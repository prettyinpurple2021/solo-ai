import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory session tracking for demo/dev (replace with Redis in prod)
// We use a cookie to track the session ID
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. Session Tracking
  let sessionId = request.cookies.get('analytics_session_id')?.value
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    response.cookies.set('analytics_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30 // 30 minutes session
    })
  }

  // 2. Refresh session expiry on activity
  if (sessionId) {
     response.cookies.set('analytics_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30 // Extend 30 minutes
    })
  }

  // 3. Add custom header for backend to read if needed
  response.headers.set('x-analytics-session-id', sessionId || '')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
