import { NextRequest } from 'next/server';
import { runMiddlewares } from '@/server/middlewares';

/**
 * Next.js Edge Middleware Entry Point.
 * Dispatches to modular middlewares located in src/server/middlewares/.
 */
export function middleware(request: NextRequest) {
  return runMiddlewares(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
