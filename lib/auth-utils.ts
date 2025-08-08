import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/neon/server"
import { sign, verify } from "jsonwebtoken"

export interface AuthenticatedUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier?: string
  subscription_status?: string
}

export interface AuthResult {
  user: AuthenticatedUser | null
  error: string | null
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function createToken(userId: string, email: string): string {
  return sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }
    return decoded
  } catch (error) {
    return null
  }
}

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

// This function is for server-side use only (API routes, Server Components)
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    // This function should only be called from server-side code
    // For client-side authentication, use the useAuth hook
    throw new Error('authenticateRequest should only be called from server-side code')
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}
