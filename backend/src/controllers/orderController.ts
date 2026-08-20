import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, currency, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('Request body must contain a non-empty items array', 'INVALID_CHECKOUT_PAYLOAD');
    }

    const orderResult = await orderService.createCheckoutOrder({
      items,
      currency,
      userId,
    });

    sendSuccess(
      res,
      {
        orderId: orderResult.orderId,
        totalAmount: orderResult.totalAmount,
        currency: orderResult.currency,
        status: orderResult.status,
        items: orderResult.items,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};
