import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  data?: T;
  pagination?: PaginationMeta;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response<ApiResponsePayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T,
  pagination: PaginationMeta,
  statusCode = 200,
): Response<ApiResponsePayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown,
): Response<ApiResponsePayload> => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details !== undefined ? { details } : {}),
    },
  });
};
