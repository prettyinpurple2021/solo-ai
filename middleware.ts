import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/stack'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/gdpr',
    '/blog',
    '/landing',
    '/api/auth',
    '/api/health',
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/robots.txt'
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For API routes, let them handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  try {
    const app = getStackServerApp()
    if (!app) {
      // If Stack Auth is not configured, redirect to signin
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    const user = await app.getUser()
    
    if (!user) {
      // User is not authenticated, redirect to signin
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // User is authenticated, allow access
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware authentication error:', error)
    // On error, redirect to signin
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}