import { z } from 'zod';
import { AppError } from '../errors/app.error';
import { ILogger } from '../logger/logger.interface';

export interface ActionSuccess<T> {
  success: true;
  data: T;
}

export interface ActionError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ActionResult<T> = ActionSuccess<T> | ActionError;

export interface SafeActionContext {
  requestId: string;
}

export interface SafeActionOptions<TInput> {
  schema?: z.ZodType<TInput>;
  actionName?: string;
  logger?: ILogger;
}

/**
 * Creates a type-safe Server Action wrapper with automated input schema validation,
 * correlation tracking, and safe error masking.
 */
export function createSafeAction<TInput, TOutput>(
  options: SafeActionOptions<TInput>,
  handler: (input: TInput, ctx: SafeActionContext) => Promise<TOutput>
): (input: TInput) => Promise<ActionResult<TOutput>>;

export function createSafeAction<TOutput>(
  handler: (ctx: SafeActionContext) => Promise<TOutput>
): () => Promise<ActionResult<TOutput>>;

export function createSafeAction<TInput, TOutput>(
  optionsOrHandler: SafeActionOptions<TInput> | ((ctx: SafeActionContext) => Promise<TOutput>),
  maybeHandler?: (input: TInput, ctx: SafeActionContext) => Promise<TOutput>
) {
  if (typeof optionsOrHandler === 'function') {
    const handler = optionsOrHandler;
    return async (): Promise<ActionResult<TOutput>> => {
      const requestId = crypto.randomUUID();
      try {
        const data = await handler({ requestId });
        return { success: true, data };
      } catch (err: unknown) {
        return handleActionError(err, requestId);
      }
    };
  }

  const options = optionsOrHandler;
  const handler = maybeHandler!;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    const requestId = crypto.randomUUID();

    let validatedInput = input;
    if (options.schema) {
      const validation = options.schema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: validation.error.flatten(),
          },
        };
      }
      validatedInput = validation.data;
    }

    try {
      const data = await handler(validatedInput, { requestId });
      return { success: true, data };
    } catch (err: unknown) {
      return handleActionError(err, requestId, options);
    }
  };
}

function handleActionError(
  err: unknown,
  requestId: string,
  options?: { actionName?: string; logger?: ILogger }
): ActionError {
  const isProduction = process.env.NODE_ENV === 'production';

  if (options?.logger) {
    options.logger.error(`Server Action failed: ${options.actionName || 'unknown'}`, err, {
      requestId,
    });
  }

  if (err instanceof AppError) {
    return {
      success: false,
      error: {
        code: err.code,
        message: err.isOperational || !isProduction ? err.message : 'Internal Server Error',
        ...(err.details !== undefined && { details: err.details }),
      },
    };
  }

  const message =
    !isProduction && err instanceof Error ? err.message : 'Internal Server Error';

  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
  };
}
