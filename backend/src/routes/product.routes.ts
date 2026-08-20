import { Router } from 'express';
import { getProducts, getProductBySlug } from '../controllers/product.controller';

const router = Router();

// GET /api/products - Paginated list of published products with available stock
router.get('/', getProducts);

// GET /api/products/:slug - Single product details
router.get('/:slug', getProductBySlug);

export default router;
