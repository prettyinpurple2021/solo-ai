import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/neon/server"
import { cookies } from "next/headers"
import { sign, verify } from "jsonwebtoken"

export interface AuthenticatedUser {
  id: string
  email?: string
}

export interface AuthResult {
  user: AuthenticatedUser | null
  error: NextResponse | null
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * Create a JWT token for a user
 */
export function createToken(userId: string, email: string): string {
  return sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

/**
 * Get user from database by ID
 */
async function getUserById(userId: string) {
  try {
    const client = await createClient()
    const { rows } = await client.query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [userId]
    )
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Shared authentication utility for API routes
 * Returns the authenticated user or an error response
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return {
        user: null,
        error: NextResponse.json({ error: "No authentication token" }, { status: 401 })
      }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return {
        user: null,
        error: NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
      }
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return {
        user: null,
        error: NextResponse.json({ error: "User not found" }, { status: 401 })
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      error: null
    }
  } catch (authError) {
    console.error("Authentication error:", authError)
    return {
      user: null,
      error: NextResponse.json({ error: "Authentication failed" }, { status: 500 })
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
      return error
    }
    
    return handler(req, user!)
  }
}
