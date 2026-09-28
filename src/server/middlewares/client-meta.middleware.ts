import { NextRequest } from 'next/server';
import { REQUEST_ID_HEADER } from '../context/request.context';

export const CLIENT_IP_HEADER = 'x-client-ip';

/**
 * Extracts correlation Request ID from incoming request or creates a UUIDv4.
 */
export function extractRequestId(request: NextRequest): string {
  const existing = request.headers.get(REQUEST_ID_HEADER);
  if (existing && /^[a-zA-Z0-9-_]{1,64}$/.test(existing)) {
    return existing;
  }
  return crypto.randomUUID();
}

/**
 * Extracts client IP from proxies or real IP headers.
 */
export function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}
