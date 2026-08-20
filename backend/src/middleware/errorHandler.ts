import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/apiResponse';

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Handle known custom ApiError
  if (err instanceof ApiError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      sendError(
        res,
        `Duplicate field value: ${target.join(', ')} already exists`,
        409,
        'CONFLICT_ERROR',
        err.meta,
      );
      return;
    }

    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 404, 'NOT_FOUND_ERROR', err.meta);
      return;
    }

    sendError(res, 'Database operation error', 400, 'DATABASE_ERROR', {
      code: err.code,
    });
    return;
  }

  // Handle Prisma Validation Errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid database query parameters', 400, 'VALIDATION_ERROR');
    return;
  }

  // Handle express JSON body parsing errors
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    sendError(res, 'Malformed JSON payload', 400, 'BAD_REQUEST');
    return;
  }

  // Fallback for unhandled internal server errors
  console.error('[errorHandler]: Unhandled Exception:', err);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
};
