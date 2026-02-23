import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { logError } from '@/lib/logger'
import { User } from "next-auth"

/**
 * Authenticated user type extending NextAuth User
 */
export interface AuthenticatedUser extends User {
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
export async function getUserIdFromSession(request?: NextRequest): Promise<string | null> {
  try {
    const session = await auth()
    return session?.user?.id || null
  } catch (error) {
    logError('Error extracting user ID from session:', error)
    return null
  }
}

/**
 * Extract user ID from request (only checks session)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Only use session for authentication
  const userId = await getUserIdFromSession(request)
  if (userId) return userId

  return null
}


export async function verifyToken(request: NextRequest): Promise<string | null> {
  return await getUserIdFromSession(request)
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/'
}
