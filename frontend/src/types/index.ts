export interface InventoryInfo {
  stock: number;
  reservedStock: number;
  availableStock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice: string | number;
  currency: string;
  isPublished: boolean;
  inventory?: InventoryInfo | null;
  availableStock: number;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  quantity: number;
  availableStock: number;
  imageUrl?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
