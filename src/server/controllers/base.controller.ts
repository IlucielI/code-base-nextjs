import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ILogger } from '../logger/logger.interface';
import { handleApiError } from '../errors';
import { BadRequestError } from '../errors/app.error';
import { validateSchema } from '../schemas/validation.helper';
import { REQUEST_ID_HEADER } from '../context/request.context';

import { logger } from '../logger';

export interface SuccessResponseOptions {
  status?: number;
  requestId?: string;
  cache?: string;
  headers?: Record<string, string>;
}

export interface HandleOptions extends SuccessResponseOptions {
  action?: string;
}

export interface ErrorResponseOptions {
  requestId?: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface ControllerContext {
  requestId: string;
  req?: Request;
}

/**
 * Base HTTP Controller for Clean Architecture.
 * Standardizes correlation ID extraction, HTTP response creation with caching headers,
 * request parsing & schema validation, and centralized anti-leak error handling.
 */
export abstract class BaseController {
  protected readonly logger?: ILogger;

  constructor(customLogger?: ILogger) {
    const parent = customLogger ?? logger;
    const child = parent?.child?.({ module: this.constructor.name });
    this.logger = child ?? parent;
  }

  /**
   * Extracts correlation Request ID from incoming request headers or generates a new UUID.
   */
  protected getRequestId(req?: Request): string {
    return req?.headers?.get(REQUEST_ID_HEADER) || crypto.randomUUID();
  }

  /**
   * Automatically resolves action name for error logging without requiring magic strings.
   * Extracts method name from error stack or falls back to constructor class name.
   */
  protected resolveActionName(error?: unknown, customAction?: string): string {
    if (customAction) return customAction;
    const className = this.constructor.name || 'BaseController';
    if (error instanceof Error && error.stack) {
      const regex = new RegExp(`${className}\\.([a-zA-Z0-9_$]+)`);
      const match = error.stack.match(regex);
      if (match && match[1]) {
        return `${className}.${match[1]}`;
      }
    }
    return className;
  }

  /**
   * Parses JSON body from request and validates against a Zod schema.
   * Throws clean BadRequestError if body is malformed JSON or validation fails.
   */
  protected async getBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON in request body');
    }
    return validateSchema(schema, raw);
  }

  /**
   * Parses URL search parameters from request and validates against a Zod schema.
   * Throws clean BadRequestError if query parameter validation fails.
   */
  protected getQuery<T>(req: Request, schema: z.ZodType<T>): T {
    try {
      const url = new URL(req.url);
      const queryObj = Object.fromEntries(url.searchParams.entries());
      return validateSchema(schema, queryObj);
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError('Invalid request URL or query parameters');
    }
  }

  /**
   * Wraps an asynchronous controller action with automated correlation ID extraction,
   * standard success envelope response, and anti-leak error handling.
   * Zero-string design: eliminates boilerplate try/catch and magic action string literals.
   */
  protected async handle<T>(
    req: Request | undefined,
    handler: (ctx: ControllerContext) => Promise<T>,
    options?: HandleOptions
  ): Promise<NextResponse> {
    const requestId = this.getRequestId(req);
    try {
      const result = await handler({ requestId, req });
      return this.success(result, { requestId, ...options });
    } catch (error) {
      const action = this.resolveActionName(error, options?.action);
      return this.error(error, { requestId, action });
    }
  }

  /**
   * Builds a standardized JSON NextResponse with correlation ID and caching headers.
   */
  protected success<T>(data: T, options?: SuccessResponseOptions): NextResponse<T> {
    const requestId = options?.requestId || crypto.randomUUID();
    const headers: Record<string, string> = {
      [REQUEST_ID_HEADER]: requestId,
      'Cache-Control': options?.cache ?? 'no-store, no-cache, must-revalidate',
      ...options?.headers,
    };

    return NextResponse.json(data, {
      status: options?.status ?? 200,
      headers,
    });
  }

  /**
   * Handles unexpected exceptions safely via centralized anti-leak error handler.
   */
  protected error(error: unknown, options: ErrorResponseOptions): NextResponse {
    return handleApiError(error, {
      requestId: options.requestId,
      logger: this.logger,
      context: { action: options.action, ...options.context },
    });
  }
}
