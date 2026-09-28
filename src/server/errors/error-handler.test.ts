import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from './error-handler';
import { BadRequestError, InternalServerError } from './app.error';

describe('handleApiError', () => {
  it('should format operational AppError safely', async () => {
    const error = new BadRequestError('Email is invalid', { field: 'email' });
    const response = handleApiError(error, { requestId: 'req-test-123' });

    expect(response.status).toBe(400);
    expect(response.headers.get('x-request-id')).toBe('req-test-123');

    const body = await response.json();
    expect(body.error).toBe('Email is invalid');
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.requestId).toBe('req-test-123');
    expect(body.details).toEqual({ field: 'email' });
    expect(body.timestamp).toBeDefined();
  });

  it('should mask internal errors in production without leaking details or stack trace', async () => {
    const secretDbError = new Error('Database password failed: user=postgres password=secret_pw');
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };

    const response = handleApiError(secretDbError, {
      requestId: 'req-secret-999',
      logger: mockLogger,
      isProduction: true,
    });

    expect(response.status).toBe(500);
    expect(response.headers.get('x-request-id')).toBe('req-secret-999');

    const body = await response.json();
    expect(body.error).toBe('Internal Server Error'); // Never leaks DB password!
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.requestId).toBe('req-secret-999');
    expect(body.stack).toBeUndefined();

    // Logger receives the full internal error
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Unhandled API exception caught',
      secretDbError,
      expect.objectContaining({
        requestId: 'req-secret-999',
        statusCode: 500,
      })
    );
  });

  it('should mask non-operational AppError in production', async () => {
    const crash = new InternalServerError('Internal memory leak details');
    const response = handleApiError(crash, { requestId: 'req-leak-456', isProduction: true });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Internal Server Error');
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
