import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { HttpClient } from './http.client';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  BadGatewayError,
  GatewayTimeoutError,
} from '../../errors/app.error';

describe('HttpClient DataSource', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should make GET request with baseUrl and query parameters', async () => {
    const mockResponseData = { id: 1, name: 'Sample' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    });

    const client = new HttpClient({ baseUrl: 'https://api.internal.com' });
    const result = await client.get('/items', {
      params: { search: 'test', page: 1, active: true },
      requestId: 'req-123',
    });

    expect(result).toEqual(mockResponseData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.internal.com/items?search=test&page=1&active=true',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-request-id': 'req-123',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('should make POST request with JSON serialized body', async () => {
    const mockCreated = { id: 2, created: true };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockCreated,
    });

    const client = new HttpClient({ baseUrl: 'https://api.internal.com' });
    const result = await client.post('/items', { title: 'New Item' });

    expect(result).toEqual(mockCreated);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.internal.com/items',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ title: 'New Item' }),
      })
    );
  });

  it('should handle 204 No Content correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    const client = new HttpClient();
    const result = await client.delete('https://api.internal.com/items/1');
    expect(result).toBeUndefined();
  });

  it('should validate and transform response using Zod schema', async () => {
    const RawItemSchema = z.object({
      item_id: z.string(),
      item_name: z.string(),
    }).transform((raw) => ({
      id: raw.item_id,
      name: raw.item_name,
    }));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ item_id: 'i-100', item_name: 'Transformed Widget' }),
    });

    const client = new HttpClient();
    const result = await client.get('https://api.internal.com/item', {
      schema: RawItemSchema,
    });

    expect(result).toEqual({ id: 'i-100', name: 'Transformed Widget' });
  });

  it('should throw BadGatewayError if Zod validation fails', async () => {
    const StrictSchema = z.object({
      required_field: z.string(),
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ wrong_field: 123 }),
    });

    const client = new HttpClient();
    await expect(
      client.get('https://api.internal.com/item', { schema: StrictSchema })
    ).rejects.toThrow(BadGatewayError);
  });

  it('should map HTTP 400 error to BadRequestError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid payload parameter' }),
    });

    const client = new HttpClient();
    await expect(client.get('https://api.internal.com/bad')).rejects.toThrow(BadRequestError);
  });

  it('should map HTTP 401 error to UnauthorizedError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Token expired' }),
    });

    const client = new HttpClient();
    await expect(client.get('https://api.internal.com/auth')).rejects.toThrow(UnauthorizedError);
  });

  it('should map HTTP 404 error to NotFoundError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'User not found' }),
    });

    const client = new HttpClient();
    await expect(client.get('https://api.internal.com/users/999')).rejects.toThrow(NotFoundError);
  });

  it('should map HTTP 500 error to BadGatewayError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server crash in backend' }),
    });

    const client = new HttpClient();
    await expect(client.get('https://api.internal.com/crash')).rejects.toThrow(BadGatewayError);
  });

  it('should throw GatewayTimeoutError when fetch is aborted by timeout', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const abortError = new Error('The user aborted a request.');
      abortError.name = 'AbortError';
      return Promise.reject(abortError);
    });

    const client = new HttpClient({ defaultTimeoutMs: 100 });
    await expect(client.get('https://api.internal.com/timeout')).rejects.toThrow(GatewayTimeoutError);
  });
});
