import { ResponseStatusType, ResponseCodeType } from '../constants/response.constant';

/**
 * Standard API Response envelope with data payload.
 */
export interface ApiResponse<T = unknown> {
  status: ResponseStatusType;
  code: ResponseCodeType | string;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * Standard Base Response envelope without data payload (e.g. acknowledgments or errors).
 */
export interface BaseResponse {
  status: ResponseStatusType;
  code: ResponseCodeType | string;
  message: string;
  timestamp: string;
}

/**
 * Metadata for paginated list endpoints.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard Paginated Response envelope with array payload and pagination metadata.
 */
export interface PaginatedResponse<T = unknown> {
  status: ResponseStatusType;
  code: ResponseCodeType | string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

/**
 * Standard query parameters for paginated requests.
 */
export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Utility helper to calculate pagination metadata.
 */
export function buildPaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta {
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const safePage = Math.max(1, page);

  return {
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

