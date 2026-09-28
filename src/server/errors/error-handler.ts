import { NextResponse } from 'next/server';
import { AppError } from './app.error';
import { ILogger } from '../logger/logger.interface';
import { REQUEST_ID_HEADER } from '../context/request.context';

export interface ErrorResponsePayload {
  error: string;
  code: string;
  requestId: string;
  timestamp: string;
  details?: unknown;
}

export interface HandleErrorOptions {
  requestId?: string;
  logger?: ILogger;
  context?: Record<string, unknown>;
  isProduction?: boolean;
}

/**
 * Enterprise Centralized Error Handler.
 * 
 * Guarantees:
 * 1. Internal stack traces and database credentials NEVER leak to clients in production.
 * 2. Operational errors return structured, safe client messages with appropriate HTTP status codes.
 * 3. Every error is logged to stdout with full stack trace and correlation Request ID.
 */
export function handleApiError(
  error: unknown,
  options?: HandleErrorOptions
): NextResponse<ErrorResponsePayload> {
  const requestId = options?.requestId || crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const isProduction = options?.isProduction ?? process.env.NODE_ENV === 'production';

  let statusCode = 500;
  let clientMessage = 'Internal Server Error';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let clientDetails: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    
    // Only return explicit message and details if it is an operational (safe) error
    if (error.isOperational) {
      clientMessage = error.message;
      clientDetails = error.details;
    } else {
      clientMessage = isProduction ? 'Internal Server Error' : error.message;
    }
  } else if (!isProduction && error instanceof Error) {
    // In local development, show raw error message for easier debugging
    clientMessage = error.message;
  }

  // 1. Log internal error with full context and stack trace
  if (options?.logger) {
    options.logger.error('Unhandled API exception caught', error, {
      requestId,
      statusCode,
      errorCode,
      context: options.context,
    });
  }

  // 2. Return safe, non-leaking JSON response to client
  const payload: ErrorResponsePayload = {
    error: clientMessage,
    code: errorCode,
    requestId,
    timestamp,
    ...(clientDetails !== undefined && { details: clientDetails }),
  };

  return NextResponse.json(payload, {
    status: statusCode,
    headers: {
      [REQUEST_ID_HEADER]: requestId,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
