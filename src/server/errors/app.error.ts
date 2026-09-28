/**
 * Standard Domain Application Error following Clean Architecture.
 * 
 * isOperational: true means this is an expected client/business error 
 * (e.g. invalid input, unauthorized access) whose message is safe to return to clients.
 * isOperational: false indicates unexpected bugs, syntax errors, or infrastructure crashes 
 * that must be logged internally and masked as generic 500 errors to prevent leaks.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 403, 'FORBIDDEN', true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource Conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false, details);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'Bad Gateway: Upstream service failure', details?: unknown) {
    super(message, 502, 'BAD_GATEWAY', true, details);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = 'Gateway Timeout: Upstream request timed out', details?: unknown) {
    super(message, 504, 'GATEWAY_TIMEOUT', true, details);
  }
}

