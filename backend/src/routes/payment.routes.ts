import express, { Router } from 'express';
import { createIntent, handleWebhook } from '../controllers/paymentController';

const router = Router();

// POST /api/payments/create-intent - Create Stripe PaymentIntent for order
router.post(
  '/create-intent',
  express.json(),
  createIntent,
);

// POST /api/payments/webhook - Stripe Webhook listener with raw body parsing
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
);

export default router;
