import { Prisma, OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { ApiError } from '../utils/apiError';

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItemInput[];
  currency?: string;
  userId?: string;
}

export interface CheckoutResult {
  orderId: string;
  totalAmount: Prisma.Decimal;
  currency: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
  }>;
}

export class OrderService {
  /**
   * Processes checkout with row-level locking on inventory and server-side price calculation.
   */
  async createCheckoutOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw ApiError.badRequest('Checkout items list cannot be empty', 'EMPTY_CHECKOUT_ITEMS');
    }

    // Consolidate duplicate product entries and validate quantities
    const consolidatedMap = new Map<string, number>();
    for (const item of payload.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw ApiError.badRequest('Invalid productId provided in items', 'INVALID_PRODUCT_ID');
      }
      if (!item.quantity || typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw ApiError.badRequest(
          `Invalid quantity for productId '${item.productId}'. Must be a positive integer.`,
          'INVALID_QUANTITY',
          { productId: item.productId, quantity: item.quantity },
        );
      }
      const existing = consolidatedMap.get(item.productId) || 0;
      consolidatedMap.set(item.productId, existing + item.quantity);
    }

    // Sort product IDs deterministically to avoid database deadlocks on concurrent transactions
    const sortedProductIds = Array.from(consolidatedMap.keys()).sort();
    const currency = payload.currency?.toUpperCase() || 'USD';

    // Execute within Prisma interactive transaction
    return await prisma.$transaction(
      async (tx) => {
        let totalAmount = new Prisma.Decimal(0);
        const orderItemsToCreate: Array<{
          productId: string;
          quantity: number;
          unitPrice: Prisma.Decimal;
        }> = [];

        for (const productId of sortedProductIds) {
          const requestedQuantity = consolidatedMap.get(productId)!;

          // 1. Row-level lock on Inventory table
          const inventoryRows = await tx.$queryRaw<Array<{ stock: number; reservedStock: number }>>`
            SELECT "stock", "reservedStock" 
            FROM "inventories" 
            WHERE "productId" = ${productId} 
            FOR UPDATE
          `;

          if (!inventoryRows || inventoryRows.length === 0) {
            throw ApiError.conflict(
              `Inventory record for product '${productId}' was not found`,
              'INSUFFICIENT_STOCK',
              {
                productId,
                requestedQuantity,
                availableStock: 0,
              },
            );
          }

          const inventory = inventoryRows[0];
          const stock = inventory.stock ?? 0;
          const reservedStock = inventory.reservedStock ?? 0;
          const availableStock = stock - reservedStock;

          // 2. Verify sufficient available stock (stock - reservedStock >= quantity)
          if (availableStock < requestedQuantity) {
            throw ApiError.conflict(
              `Product '${productId}' is out of stock or has insufficient available inventory`,
              'INSUFFICIENT_STOCK',
              {
                productId,
                requestedQuantity,
                availableStock: Math.max(0, availableStock),
              },
            );
          }

          // 3. Increment reservedStock for the product
          await tx.inventory.update({
            where: { productId },
            data: {
              reservedStock: {
                increment: requestedQuantity,
              },
            },
          });

          // 4. Query product table to get true server-side basePrice (disregarding client prices)
          const product = await tx.product.findUnique({
            where: { id: productId },
            select: {
              id: true,
              title: true,
              basePrice: true,
              currency: true,
              isPublished: true,
            },
          });

          if (!product || !product.isPublished) {
            throw ApiError.notFound(
              `Product with ID '${productId}' is unavailable or not published`,
              'PRODUCT_UNAVAILABLE',
              { productId },
            );
          }

          const itemTotal = product.basePrice.mul(new Prisma.Decimal(requestedQuantity));
          totalAmount = totalAmount.add(itemTotal);

          orderItemsToCreate.push({
            productId: product.id,
            quantity: requestedQuantity,
            unitPrice: product.basePrice,
          });
        }

        // 5. Create Order record with PENDING status and nested OrderItems
        const order = await tx.order.create({
          data: {
            userId: payload.userId || null,
            status: OrderStatus.PENDING,
            totalAmount,
            currency,
            items: {
              create: orderItemsToCreate.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: {
            items: {
              select: {
                productId: true,
                quantity: true,
                unitPrice: true,
              },
            },
          },
        });

        return {
          orderId: order.id,
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          items: order.items,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 15000, // 15 seconds
      },
    );
  }
}

export const orderService = new OrderService();
export default orderService;
