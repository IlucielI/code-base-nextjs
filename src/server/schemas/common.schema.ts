import { z } from 'zod';
import { ResponseStatus, ResponseCode } from '../constants/response.constant';

/**
 * -----------------------------------------------------------------------------
 * 1. Request Query & Pagination Schemas
 * -----------------------------------------------------------------------------
 */

/**
 * Schema for incoming pagination and search query parameters from client.
 * Uses z.coerce to gracefully parse string URL query parameters (?page=1&limit=10).
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationQuerySchemaType = z.infer<typeof PaginationQuerySchema>;

/**
 * -----------------------------------------------------------------------------
 * 2. Standard API Response Envelopes
 * -----------------------------------------------------------------------------
 */

/**
 * Schema for standard response status.
 */
export const ResponseStatusSchema = z.enum([
  ResponseStatus.SUCCESS,
  ResponseStatus.FAIL,
  ResponseStatus.ERROR,
]);

/**
 * Schema for standard response codes.
 */
export const ResponseCodeSchema = z.enum([
  ResponseCode.SUCCESS,
  ResponseCode.ERROR,
  ResponseCode.INTERNAL_ERROR,
  ResponseCode.NOT_FOUND,
  ResponseCode.BAD_REQUEST,
  ResponseCode.UNAUTHORIZED,
  ResponseCode.FORBIDDEN,
]).or(z.string());

/**
 * Schema for standard BaseResponse envelope.
 */
export const BaseResponseSchema = z.object({
  status: ResponseStatusSchema,
  code: ResponseCodeSchema,
  message: z.string(),
  timestamp: z.string(),
});

export type BaseResponseDto = z.infer<typeof BaseResponseSchema>;

/**
 * Factory for creating typed ApiResponse<T> schemas.
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return BaseResponseSchema.extend({
    data: dataSchema.optional(),
  });
}

/**
 * -----------------------------------------------------------------------------
 * 3. Paginated Response Metadata & Envelope
 * -----------------------------------------------------------------------------
 */

/**
 * Schema for pagination metadata in responses.
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export type PaginationMetaSchemaType = z.infer<typeof PaginationMetaSchema>;

/**
 * Factory for creating typed PaginatedResponse<T> schemas.
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return BaseResponseSchema.extend({
    data: z.array(itemSchema),
    pagination: PaginationMetaSchema,
  });
}
