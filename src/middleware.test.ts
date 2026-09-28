import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { REQUEST_ID_HEADER, CLIENT_IP_HEADER } from '@/server/middlewares';

describe('Global Middleware', () => {
  it('should generate x-request-id and attach security headers on GET request', () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18',
      },
    });

    const response = middleware(request);

    expect(response.headers.get(REQUEST_ID_HEADER)).toBeDefined();
    expect(response.headers.get(CLIENT_IP_HEADER)).toBe('203.0.113.195');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('should preserve and forward incoming x-request-id', () => {
    const customId = 'client-custom-trace-id-888';
    const request = new NextRequest('http://localhost:3000/api/health', {
      headers: {
        [REQUEST_ID_HEADER]: customId,
      },
    });

    const response = middleware(request);
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe(customId);
  });

  it('should handle preflight OPTIONS request with 204 No Content', () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'OPTIONS',
    });

    const response = middleware(request);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
});
