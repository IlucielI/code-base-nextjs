import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, apiFetchData, ApiClientError } from './api-client';

describe('api-client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should perform GET request and return parsed JSON', async () => {
    const mockData = { status: 'success', data: { id: 1, name: 'Alice' } };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });

    const result = await apiFetch<typeof mockData>('/api/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({ Accept: 'application/json' }),
    }));
  });

  it('should auto-unwrap data property via apiFetchData', async () => {
    const mockPayload = { status: 'success', data: { id: 42, title: 'Test Item' } };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockPayload,
    });

    const data = await apiFetchData<{ id: number; title: string }>('/api/item/42');
    expect(data).toEqual({ id: 42, title: 'Test Item' });
  });

  it('should throw ApiClientError on non-2xx HTTP responses', async () => {
    const errorPayload = {
      code: 'BAD_REQUEST',
      error: 'Invalid parameter',
      details: { field: 'email' },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorPayload,
    });

    await expect(apiFetch('/api/invalid')).rejects.toThrow(ApiClientError);

    try {
      await apiFetch('/api/invalid');
    } catch (err: unknown) {
      const apiErr = err as ApiClientError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('BAD_REQUEST');
      expect(apiErr.message).toBe('Invalid parameter');
      expect(apiErr.details).toEqual({ field: 'email' });
    }
  });

  it('should handle 204 No Content gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    const result = await apiFetch('/api/delete-something', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});
