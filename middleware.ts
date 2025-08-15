import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that doesn't use any instrumentation hooks
export function middleware(request: NextRequest) {
  // Simply pass through all requests
  return NextResponse.next();
}

// Limit middleware to specific paths to avoid running on all routes
export const config = {
  matcher: [
    // Skip all internal paths and static files
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};