import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ApiError } from '../utils/apiError';
import { sendPaginatedSuccess, sendSuccess } from '../utils/apiResponse';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
    };

    const [totalItems, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          slug: 'asc',
        },
        include: {
          inventory: {
            select: {
              stock: true,
              reservedStock: true,
            },
          },
        },
      }),
    ]);

    const formattedProducts = products.map((product) => {
      const stock = product.inventory?.stock ?? 0;
      const reservedStock = product.inventory?.reservedStock ?? 0;
      const availableStock = Math.max(0, stock - reservedStock);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        currency: product.currency,
        isPublished: product.isPublished,
        inventory: product.inventory
          ? {
              stock,
              reservedStock,
              availableStock,
            }
          : null,
        availableStock,
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    sendPaginatedSuccess(
      res,
      formattedProducts,
      {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw ApiError.badRequest('Product slug parameter is required', 'MISSING_SLUG');
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        inventory: {
          select: {
            stock: true,
            reservedStock: true,
          },
        },
      },
    });

    if (!product || !product.isPublished) {
      throw ApiError.notFound(`Product with slug '${slug}' was not found`, 'PRODUCT_NOT_FOUND');
    }

    const stock = product.inventory?.stock ?? 0;
    const reservedStock = product.inventory?.reservedStock ?? 0;
    const availableStock = Math.max(0, stock - reservedStock);

    const formattedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      currency: product.currency,
      isPublished: product.isPublished,
      inventory: product.inventory
        ? {
            stock,
            reservedStock,
            availableStock,
          }
        : null,
      availableStock,
    };

    sendSuccess(res, formattedProduct, 200);
  } catch (error) {
    next(error);
  }
};
