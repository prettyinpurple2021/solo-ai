import NextAuth from "next-auth"
import { authConfig } from "./src/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const { nextUrl } = req
  // Use req.auth which is populated by NextAuth proxy
  // This ensures we check the actual session that was just established
  const isLoggedIn = !!req.auth
  
  // Public routes logic is handled in auth.config.ts authorized callback mostly, 
  // but we can add handle headers here.
  
  const response = NextResponse.next()
  
  // Security headers (production-ready)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // CSP (Content Security Policy)
  const csp = [
    "default-src 'self' https: data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss: blob:",
    "frame-src 'self' https:",
    "media-src 'self' https: data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https:",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  // CSP is handled in next.config.mjs to avoid conflicts
  // response.headers.set('Content-Security-Policy', csp)
  
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
     * - public (public files)
     * - auth (auth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
}
