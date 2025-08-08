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



            // This function is for server-side use only (API routes, Server Components)
            export async function authenticateRequest(): Promise<AuthResult> {
              try {
                // This function should only be called from server-side code
                // For client-side authentication, use the useAuth hook
                throw new Error('authenticateRequest should only be called from server-side code');
              } catch (error) {
                return {
                  user: null,
                  error: error instanceof Error ? error.message : 'Authentication failed'
                }
              }
            }
