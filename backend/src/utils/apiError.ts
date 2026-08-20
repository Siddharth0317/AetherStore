export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode?: string,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, message, errorCode, details);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND', details?: unknown) {
    return new ApiError(404, message, errorCode, details);
  }

  static conflict(message = 'Conflict', errorCode = 'CONFLICT', details?: unknown) {
    return new ApiError(409, message, errorCode, details);
  }

  static unprocessable(message = 'Unprocessable Entity', errorCode = 'UNPROCESSABLE_ENTITY', details?: unknown) {
    return new ApiError(422, message, errorCode, details);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR', details?: unknown) {
    return new ApiError(500, message, errorCode, details, false);
  }
}
