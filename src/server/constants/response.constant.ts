/**
 * Standard API response status and code constants.
 * Enterprise standard for consistent API response contracts.
 */
export const ResponseStatus = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
} as const;

export type ResponseStatusType = (typeof ResponseStatus)[keyof typeof ResponseStatus];

export const ResponseCode = {
  SUCCESS: 'OK',
  ERROR: 'ERROR',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export type ResponseCodeType = (typeof ResponseCode)[keyof typeof ResponseCode];
