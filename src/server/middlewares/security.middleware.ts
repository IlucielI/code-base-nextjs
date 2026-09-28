import { NextResponse } from 'next/server';
import { REQUEST_ID_HEADER } from '../context/request.context';
import { CLIENT_IP_HEADER } from './client-meta.middleware';

/**
 * Attaches enterprise security headers to the outgoing response.
 */
export function applySecurityHeaders(
  response: NextResponse,
  requestId: string,
  clientIp: string
): void {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set(CLIENT_IP_HEADER, clientIp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
}
