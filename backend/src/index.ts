import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/apiResponse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Payment Routes (mounted before global express.json to preserve raw webhook body)
app.use('/api/payments', paymentRoutes);

// Global JSON middleware for standard endpoints
app.use(express.json());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'aetherstore-backend',
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 Fallback
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server]: AetherStore Backend is running on http://localhost:${PORT}`);
  });
}

export default app;
