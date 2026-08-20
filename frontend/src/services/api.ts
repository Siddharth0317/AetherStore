import axios from 'axios';
import { ApiResponse, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async (page = 1, limit = 20): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: { page, limit },
    });
    return response.data;
  } catch (err: unknown) {
    // If relative /api fails in standalone mode, retry directly against backend port 5000
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
