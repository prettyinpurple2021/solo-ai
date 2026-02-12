import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Context7 Verified Implementation
// Reference: NextAuth.js Middleware Route Protection
// https://context7.com/nextauthjs/next-auth

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Define protected paths
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding')

  // Redirect unauthenticated users to sign-in page
  if (isProtectedPath && !isLoggedIn) {
     const signInUrl = new URL('/auth/signin', req.url)
     // Add callbackUrl to redirect back after login
     signInUrl.searchParams.set('callbackUrl', pathname)
     return NextResponse.redirect(signInUrl)
  }

  // Proceed with response
  const response = NextResponse.next()

  // ---------------------------------------------------------
  // Existing Analytics Session Logic (Preserved)
  // ---------------------------------------------------------
  let sessionId = req.cookies.get('analytics_session_id')?.value
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    response.cookies.set('analytics_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30 // 30 minutes session
    })
  } else {
     // Extend session expiry on activity
     response.cookies.set('analytics_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30
    })
  }

  // Add custom header for backend to read if needed
  response.headers.set('x-analytics-session-id', sessionId || '')

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes need to be public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
