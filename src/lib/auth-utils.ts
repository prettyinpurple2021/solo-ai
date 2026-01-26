import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { logError } from '@/lib/logger'
import { User } from "next-auth"

/**
 * Authenticated user type extending NextAuth User
 */
export interface AuthenticatedUser extends User {
  role?: string
  username?: string | null
  full_name?: string | null
  subscription_tier?: string
  subscription_status?: string
  stripe_customer_id?: string | null
}

/**
 * Authentication result type
 */
export interface AuthResult {
  user: AuthenticatedUser | null
  error: string | null
}

/**
 * Extract user ID from session
 */
export async function getUserIdFromSession(request?: NextRequest): Promise<string> {
  try {
    const session = await auth()
    return session?.user?.id || null
  } catch (error) {
    logError('Error extracting user ID from session:', error)
    return null
  }
}

/**
 * Extract user ID from request (supports both JWT and simple user ID header)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  // First try session
  const userId = await getUserIdFromSession(request)
  if (userId) return userId

  // Fallback to user-id header (for development/testing)
  const userIdHeader = request.headers.get('x-user-id')
  if (userIdHeader) return userIdHeader

  return null
}

// Deprecated functions that we keep for signature compatibility but stub
export async function createToken(userId: string, arg_string: string): Promise<string> {
  return "mock-token"
}

export async function verifyToken(request: NextRequest): Promise<string> {
  return await getUserIdFromSession(request)
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/'
}
