import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface AuthenticatedUser {
  id: string
  email?: string
}

export interface AuthResult {
  user: AuthenticatedUser | null
  error: NextResponse | null
}

/**
 * Shared authentication utility for API routes
 * Returns the authenticated user or an error response
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      error: null
    }
  } catch (error) {
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
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<T>
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    const { user, error } = await authenticateRequest()
    
    if (error) {
      return error
    }
    
    return handler(req, user!)
  }
}