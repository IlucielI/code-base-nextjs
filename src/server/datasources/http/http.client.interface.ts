import { z } from 'zod';

export interface NextFetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

export interface HttpRequestOptions<T = unknown> {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  requestId?: string;
  schema?: z.ZodType<T>;
  next?: NextFetchOptions;
  cache?: RequestCache;
}

export interface IHttpClient {
  get<T = unknown>(path: string, options?: HttpRequestOptions<T>): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: HttpRequestOptions<T>): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: HttpRequestOptions<T>): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: HttpRequestOptions<T>): Promise<T>;
  delete<T = unknown>(path: string, options?: HttpRequestOptions<T>): Promise<T>;
}
