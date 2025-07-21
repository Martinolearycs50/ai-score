import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log all requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${request.method} ${pathname}`);
  }

  // Ensure API routes are not redirected
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Add CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
