import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import { TrafficService } from "@/lib/traffic-service"
import { logError, logInfo } from "@/lib/logger"
import { canAccess } from "@/lib/subscription-gating"

const { auth } = NextAuth(authConfig)


// Context7 Verified Implementation
// Reference: NextAuth.js Middleware Route Protection
// https://context7.com/nextauthjs/next-auth

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const user = req.auth?.user
  const { pathname } = req.nextUrl

  // Define protected paths
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding')

  // 1. Redirect unauthenticated users to sign-in page
  if (isProtectedPath && !isLoggedIn) {
     const signInUrl = new URL('/login', req.url)
     // Add callbackUrl to redirect back after login
     signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
     return NextResponse.redirect(signInUrl)
  }

  // 2. Feature Gating based on Subscription Tier
  if (isLoggedIn) {
    const userTier = user?.subscription_tier || 'free'
    
    // Check if the current path is gated
    const gatedPaths = ['/dashboard/competitors', '/dashboard/collaboration', '/dashboard/strategy-nexus', '/dashboard/compliance-grid']
    const activeGate = gatedPaths.find(p => pathname.startsWith(p))
    
    if (activeGate && !canAccess(userTier as string, activeGate)) {
      logInfo('Access Denied: Tier too low', { userId: user?.id, tier: userTier, path: pathname })
      const upgradeUrl = new URL('/pricing', req.url)
      upgradeUrl.searchParams.set('reason', 'tier_low')
      upgradeUrl.searchParams.set('feature', activeGate)
      return NextResponse.redirect(upgradeUrl)
    }
  }

  // Proceed with response
  const response = NextResponse.next()

  // ---------------------------------------------------------
  // Existing Analytics Session Logic (Preserved & Hardened)
  // ---------------------------------------------------------
  let sessionId = req.cookies.get('analytics_session_id')?.value
  const isValidUuid = sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)
  
  if (!isValidUuid) {
    sessionId = crypto.randomUUID()
    response.cookies.set('analytics_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30 // 30 minutes session
    })
  } else {
     // Extend session expiry on activity
     response.cookies.set('analytics_session_id', sessionId as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30
    })
  }

  // Add custom header for backend to read if needed
  response.headers.set('x-analytics-session-id', sessionId || '')

  // ---------------------------------------------------------
  // Persist Traffic Log (Phase 3)
  // ---------------------------------------------------------
  const isApiRequest = pathname.startsWith('/api')
  const isExcluded = pathname.includes('.') // Static files, images, etc.
  
  if (!isApiRequest && !isExcluded && sessionId) {
    // Non-blocking log persistence
    TrafficService.logRequest({
      sessionId,
      userId: req.auth?.user?.id,
      url: req.url,
      referrer: req.headers.get('referer') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      metadata: {
        method: req.method,
        geo: (req as any).geo, // Next.js specific geo info if available,
      }
    }).catch(err => {
      // Silently catch errors in middleware to prevent disrupting user experience
      logError('Middleware traffic log failed', err)
    })
  }

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
     * - studio (Sanity Studio handles its own auth/routing)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|studio).*)',
  ],
}
