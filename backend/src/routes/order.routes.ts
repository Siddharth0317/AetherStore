import { Router } from 'express';
import { checkout } from '../controllers/orderController';

const router = Router();

// POST /api/orders/checkout - Process inventory reservation and create pending order
router.post('/checkout', checkout);

export default router;
