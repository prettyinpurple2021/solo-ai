import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_OPTIONS } from '@/lib/auth-utils'

/**
 * Handles user logout by clearing authentication cookies
 * @route DELETE /api/auth/logout
 */
export async function DELETE(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Also support POST for clients that can't use DELETE
 */
export async function POST(_request: NextRequest) {
  return DELETE(_request)
}