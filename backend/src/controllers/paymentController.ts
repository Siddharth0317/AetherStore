import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { stripeService } from '../services/stripeService';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const createIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw ApiError.badRequest('Missing orderId in request body', 'MISSING_ORDER_ID');
    }

    const intentResult = await stripeService.createPaymentIntent(orderId);

    sendSuccess(
      res,
      {
        clientSecret: intentResult.clientSecret,
        paymentIntentId: intentResult.paymentIntentId,
        amount: intentResult.amount,
        currency: intentResult.currency,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw ApiError.badRequest('Missing stripe-signature header', 'MISSING_STRIPE_SIGNATURE');
    }

    // req.body is a raw Buffer because of express.raw({ type: 'application/json' }) middleware
    const rawBody = req.body;
    const event = stripeService.constructWebhookEvent(rawBody, sig);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await stripeService.handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await stripeService.handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`[stripeWebhook]: Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
