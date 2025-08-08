import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/neon/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import type { AuthenticatedUser, AuthResult } from "./auth-utils"

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
  } catch (error) {
    return null
  }
}

/**
 * Server-side authentication utility for API routes
 * Returns the authenticated user or an error response
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return {
        user: null,
        error: "No authentication token"
      }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return {
        user: null,
        error: "Invalid authentication token"
      }
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return {
        user: null,
        error: "User not found"
      }
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
      error: null
    }
  } catch (authError) {
    console.error("Authentication error:", authError)
    return {
      user: null,
      error: "Authentication failed"
    }
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

