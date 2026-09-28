import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { createSafeAction } from './safe-action';
import { BadRequestError } from '../errors/app.error';

describe('createSafeAction', () => {
  it('should execute action successfully without schema', async () => {
    const action = createSafeAction(async ({ requestId }) => {
      return { status: 'ok', reqId: requestId };
    });

    const result = await action();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ok');
      expect(result.data.reqId).toBeDefined();
    }
  });

  it('should validate input with Zod schema and execute handler on success', async () => {
    const InputSchema = z.object({
      query: z.string().min(3),
      limit: z.number().positive(),
    });

    const action = createSafeAction(
      { schema: InputSchema, actionName: 'searchAction' },
      async (input, { requestId }) => {
        return { items: [input.query], limit: input.limit, correlation: requestId };
      }
    );

    const result = await action({ query: 'test query', limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toEqual(['test query']);
      expect(result.data.limit).toBe(10);
    }
  });

  it('should return VALIDATION_ERROR when input fails schema validation', async () => {
    const InputSchema = z.object({
      email: z.string().email(),
    });

    const action = createSafeAction(
      { schema: InputSchema, actionName: 'emailAction' },
      async (input) => {
        return input.email;
      }
    );

    const result = await action({ email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Input validation failed');
      expect(result.error.details).toBeDefined();
    }
  });

  it('should catch AppError and format error payload safely', async () => {
    const action = createSafeAction(
      { actionName: 'failingAction' },
      async () => {
        throw new BadRequestError('Invalid item ID', { itemId: 'abc' });
      }
    );

    const result = await action({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BAD_REQUEST');
      expect(result.error.message).toBe('Invalid item ID');
      expect(result.error.details).toEqual({ itemId: 'abc' });
    }
  });

  it('should catch unexpected errors and log with logger', async () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };

    const action = createSafeAction(
      { actionName: 'unexpectedAction', logger: mockLogger },
      async () => {
        throw new Error('Database connection crashed');
      }
    );

    const result = await action({});
    expect(result.success).toBe(false);
    expect(mockLogger.error).toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.code).toBe('INTERNAL_SERVER_ERROR');
    }
  });
});
