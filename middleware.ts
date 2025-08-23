import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Enhanced middleware with CORS support and security headers
export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow requests from production domains and localhost
    const allowedOrigins = [
      'https://soloboss-ai-v3.web.app',
      'https://soloboss-ai-v3.firebaseapp.com', 
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      // Add your production domain here
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token'
    );

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

// Limit middleware to specific paths to avoid running on all routes
export const config = {
  matcher: [
    // Apply to API routes and auth-related pages
    '/api/:path*',
    '/signin',
    '/signup', 
    '/dashboard/:path*',
  ],
};