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
  } catch {
    return null
  }
}

