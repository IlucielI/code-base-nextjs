import { NextRequest, NextResponse } from 'next/server';
import { REQUEST_ID_HEADER } from '../context/request.context';

/**
 * Handles CORS preflight OPTIONS requests.
 */
export function handleCorsPreflight(
  request: NextRequest,
  requestId: string
): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      'Access-Control-Max-Age': '86400',
      [REQUEST_ID_HEADER]: requestId,
    },
  });
}
