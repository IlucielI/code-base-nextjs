import { z } from 'zod';
import { BadRequestError } from '../errors/app.error';

/**
 * Validates data against a Zod schema.
 * Throws a clean BadRequestError with flattened validation issues if validation fails.
 */
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.flatten();
    throw new BadRequestError('Request validation failed', errorDetails);
  }
  return result.data;
}

/**
 * Safely parses data against a Zod schema without throwing, returning a discriminated union.
 */
export function safeValidateSchema<T>(schema: z.ZodType<T>, data: unknown) {
  return schema.safeParse(data);
}
