import axios from 'axios';
import { ApiResponse, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CheckoutOrderItem {
  productId: string;
  quantity: number;
}

export interface CheckoutOrderResponse {
  orderId: string;
  totalAmount: string | number;
  currency: string;
  status: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string | number;
  }>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export const fetchProducts = async (page = 1, limit = 20): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: { page, limit },
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && !err.response) {
      const fallbackResponse = await axios.get<ApiResponse<Product[]>>(
        'http://localhost:5000/api/products',
        {
          params: { page, limit },
        },
      );
      return fallbackResponse.data;
    }
    throw err;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && !err.response) {
      const fallbackResponse = await axios.get<ApiResponse<Product>>(
        `http://localhost:5000/api/products/${slug}`,
      );
      return fallbackResponse.data;
    }
    throw err;
  }
};

export const createCheckoutOrder = async (
  items: CheckoutOrderItem[],
  currency = 'USD',
): Promise<ApiResponse<CheckoutOrderResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<CheckoutOrderResponse>>('/orders/checkout', {
      items,
      currency,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && !err.response) {
      const fallbackResponse = await axios.post<ApiResponse<CheckoutOrderResponse>>(
        'http://localhost:5000/api/orders/checkout',
        { items, currency },
      );
      return fallbackResponse.data;
    }
    throw err;
  }
};

export const createPaymentIntent = async (
  orderId: string,
): Promise<ApiResponse<CreatePaymentIntentResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
      '/payments/create-intent',
      { orderId },
    );
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && !err.response) {
      const fallbackResponse = await axios.post<ApiResponse<CreatePaymentIntentResponse>>(
        'http://localhost:5000/api/payments/create-intent',
        { orderId },
      );
      return fallbackResponse.data;
    }
    throw err;
  }
};
