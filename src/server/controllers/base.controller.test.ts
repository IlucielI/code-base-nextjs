import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { BaseController, HandleOptions } from './base.controller';
import { BadRequestError } from '../errors/app.error';

class TestController extends BaseController {
  public testGetRequestId(req?: Request): string {
    return this.getRequestId(req);
  }

  public testSuccess<T>(data: T, options?: Parameters<BaseController['success']>[1]) {
    return this.success(data, options);
  }

  public testError(error: unknown, options: { requestId: string; action: string }) {
    return this.error(error, options);
  }

  public testGetBody<T>(req: Request, schema: z.ZodType<T>) {
    return this.getBody(req, schema);
  }

  public testGetQuery<T>(req: Request, schema: z.ZodType<T>) {
    return this.getQuery(req, schema);
  }

  public testHandle<T>(
    req: Request | undefined,
    handler: (ctx: { requestId: string; req?: Request }) => Promise<T>,
    options?: HandleOptions
  ) {
    return this.handle(req, handler, options);
  }
}

describe('BaseController', () => {
  it('should extract requestId from header if present', () => {
    const controller = new TestController();
    const req = new Request('http://localhost:3000', {
      headers: { 'x-request-id': 'custom-req-id-123' },
    });

    const requestId = controller.testGetRequestId(req);
    expect(requestId).toBe('custom-req-id-123');
  });

  it('should generate a new UUID if request or header is missing', () => {
    const controller = new TestController();
    const requestId = controller.testGetRequestId();
    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe('string');
    expect(requestId.length).toBeGreaterThan(0);
  });

  it('should generate success response with default 200, cache-control, and x-request-id', async () => {
    const controller = new TestController();
    const response = controller.testSuccess({ message: 'hello' }, { requestId: 'req-456' });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toBe('req-456');
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');

    const json = await response.json();
    expect(json).toEqual({ message: 'hello' });
  });

  it('should support custom status, custom cache, and additional headers', async () => {
    const controller = new TestController();
    const response = controller.testSuccess(
      { created: true },
      {
        status: 201,
        requestId: 'req-789',
        cache: 'public, max-age=3600',
        headers: { 'X-Custom-Header': 'foobar' },
      }
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('x-request-id')).toBe('req-789');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
    expect(response.headers.get('X-Custom-Header')).toBe('foobar');
  });

  it('should delegate error handling safely to centralized error handler', async () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };
    const controller = new TestController(mockLogger);

    const badReqError = new BadRequestError('Invalid query params');
    const response = controller.testError(badReqError, {
      requestId: 'err-req-1',
      action: 'TestController.action',
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('x-request-id')).toBe('err-req-1');

    const json = await response.json();
    expect(json.error).toBe('Invalid query params');
    expect(json.code).toBe('BAD_REQUEST');
  });

  describe('getBody()', () => {
    const UserSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    });

    it('should parse and validate valid JSON body', async () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      });

      const body = await controller.testGetBody(req, UserSchema);
      expect(body).toEqual({ name: 'John Doe', email: 'john@example.com' });
    });

    it('should throw BadRequestError on invalid JSON syntax', async () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ malformed json',
      });

      await expect(controller.testGetBody(req, UserSchema)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError on schema validation mismatch', async () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'J', email: 'invalid-email' }),
      });

      await expect(controller.testGetBody(req, UserSchema)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getQuery()', () => {
    const QuerySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().default(10),
    });

    it('should extract and parse query parameters from URL', () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/items?page=2&limit=25');

      const query = controller.testGetQuery(req, QuerySchema);
      expect(query).toEqual({ page: 2, limit: 25 });
    });

    it('should apply schema defaults if query parameters are missing', () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/items');

      const query = controller.testGetQuery(req, QuerySchema);
      expect(query).toEqual({ page: 1, limit: 10 });
    });
  });

  describe('handle()', () => {
    it('should execute action handler with zero string configuration', async () => {
      const controller = new TestController();
      const req = new Request('http://localhost:3000/api/test', {
        headers: { 'x-request-id': 'req-abc-123' },
      });

      const response = await controller.testHandle(req, async ({ requestId }) => {
        return { message: 'hello', correlationId: requestId };
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('x-request-id')).toBe('req-abc-123');

      const json = await response.json();
      expect(json).toEqual({ message: 'hello', correlationId: 'req-abc-123' });
    });

    it('should catch errors thrown inside handler and auto-resolve action name safely', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        child: vi.fn(),
      };
      const controller = new TestController(mockLogger);
      const req = new Request('http://localhost:3000/api/test', {
        headers: { 'x-request-id': 'req-fail-456' },
      });

      const response = await controller.testHandle(req, async () => {
        throw new BadRequestError('Something is invalid');
      });

      expect(response.status).toBe(400);
      expect(response.headers.get('x-request-id')).toBe('req-fail-456');

      const json = await response.json();
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.error).toBe('Something is invalid');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should allow optional custom action name override if provided', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        child: vi.fn(),
      };
      const controller = new TestController(mockLogger);
      const req = new Request('http://localhost:3000/api/test');

      await controller.testHandle(
        req,
        async () => {
          throw new BadRequestError('Explicit action error');
        },
        { action: 'CustomController.customAction' }
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({
            action: 'CustomController.customAction',
          }),
        })
      );
    });
  });
});
