import Stripe from 'stripe';
import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { ApiError } from '../utils/apiError';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';
export const stripe = new Stripe(stripeSecretKey);

export class StripeService {
  /**
   * Creates a Stripe PaymentIntent for a PENDING order and saves the payment intent ID.
   */
  async createPaymentIntent(orderId: string): Promise<{
    clientSecret: string | null;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    if (!orderId) {
      throw ApiError.badRequest('Order ID is required', 'MISSING_ORDER_ID');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw ApiError.notFound(`Order with ID '${orderId}' not found`, 'ORDER_NOT_FOUND');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw ApiError.badRequest(
        `Cannot create payment intent for order in '${order.status}' status. Only PENDING orders are eligible.`,
        'INVALID_ORDER_STATUS',
      );
    }

    // Convert decimal amount to cents / minor units for Stripe (e.g. USD $299.99 -> 29999 cents)
    const amountInCents = Math.round(order.totalAmount.toNumber() * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with the created Stripe PaymentIntent ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: order.currency,
    };
  }

  /**
   * Validates Stripe webhook cryptographic signature against raw request body.
   */
  constructWebhookEvent(rawBody: string | Buffer, signature: string | string[]): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw ApiError.internal(
        'STRIPE_WEBHOOK_SECRET is not configured on the server',
        'MISSING_STRIPE_WEBHOOK_SECRET',
      );
    }

    try {
      return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid webhook signature';
      throw ApiError.badRequest(`Webhook signature verification failed: ${message}`, 'INVALID_WEBHOOK_SIGNATURE');
    }
  }

  /**
   * Handles payment_intent.succeeded: Updates order to PAID, decrements stock & reservedStock.
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;
    const order = await prisma.order.findFirst({
      where: orderId
        ? { id: orderId }
        : { stripePaymentIntentId: paymentIntent.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.warn(`[stripeWebhook]: No order found for succeeded PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    if (order.status === OrderStatus.PAID) {
      console.log(`[stripeWebhook]: Order ${order.id} is already marked as PAID.`);
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order status to PAID
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
      });

      // 2. Decrement real stock and reserved stock
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
            reservedStock: {
              decrement: item.quantity,
            },
          },
        });
      }
    });

    console.log(`[stripeWebhook]: Order ${order.id} marked as PAID and inventory updated successfully.`);
  }

  /**
   * Handles payment_intent.payment_failed: Updates order to CANCELLED and decrements reservedStock.
   */
  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;
    const order = await prisma.order.findFirst({
      where: orderId
        ? { id: orderId }
        : { stripePaymentIntentId: paymentIntent.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.warn(`[stripeWebhook]: No order found for failed PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    if (order.status === OrderStatus.CANCELLED) {
      console.log(`[stripeWebhook]: Order ${order.id} is already marked as CANCELLED.`);
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order status to CANCELLED
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      // 2. Release reservedStock
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedStock: {
              decrement: item.quantity,
            },
          },
        });
      }
    });

    console.log(`[stripeWebhook]: Order ${order.id} marked as CANCELLED and reserved inventory released.`);
  }
}

export const stripeService = new StripeService();
export default stripeService;
