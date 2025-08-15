import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/neon/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import type { AuthenticatedUser, AuthResult } from "./auth-utils"
import { getStackServerApp } from "@/stack"

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function getUserById(userId: string) {
  try {
    const client = await createClient()
    const { rows } = await client.query(
      'SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status FROM users WHERE id = $1',
      [userId]
    )
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }
    return decoded
  } catch {
    return null
  }
}

async function getStackAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const app = getStackServerApp()
    if (!app) return null
    const stackUser = await app.getUser()
    if (!stackUser) return null

    // Map Stack user to our AuthenticatedUser shape
    return {
      id: stackUser.id,
      email: (stackUser as any).primaryEmail || (stackUser as any).email || "",
      full_name: (stackUser as any).displayName,
      avatar_url: (stackUser as any).avatarUrl,
      subscription_tier: undefined,
      subscription_status: undefined,
    }
  } catch (err) {
    console.error('Stack authentication error:', err)
    return null
  }
}

/**
 * Server-side authentication utility for API routes
 * Tries Stack Auth first, then falls back to legacy JWT cookie.
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    // 1) Try Stack Auth cookie/session
    const stackUser = await getStackAuthenticatedUser()
    if (stackUser) {
      return { user: stackUser, error: null }
    }

    // 2) Fallback to legacy JWT cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { user: null, error: "No authentication token" }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return { user: null, error: "Invalid authentication token" }
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return { user: null, error: "User not found" }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
      },
      error: null,
    }
  } catch (authError) {
    console.error("Authentication error:", authError)
    return { user: null, error: "Authentication failed" }
  }
}

/**
 * Middleware-style authentication wrapper for API route handlers
 */
export function withAuth<T>(
  handler: (_req: NextRequest, _user: AuthenticatedUser) => Promise<T>
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    const { user, error } = await authenticateRequest()
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }
    return handler(req, user!)
  }
}

