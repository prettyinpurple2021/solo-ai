import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"


/**
 * Authenticate request using NextAuth
 */
export async function authenticateRequest() {
  const session = await auth()
  
  if (session?.user) {
    return { user: session.user, error: null }
  }
  
  return { user: null, error: "Unauthorized" }
}

/**
 * Get the current authenticated user from session
 */
export async function getJWTAuthenticatedUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Middleware-style wrapper
 */
export function withAuth(handler: any) {
  return async (req: NextRequest) => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return handler(req, session.user)
  }
}

export async function verifyAuth() {
  const session = await auth()
  return { 
    user: session?.user, 
    error: session?.user ? undefined : "Unauthorized" 
  }
}

export const authenticateAction = verifyAuth;
