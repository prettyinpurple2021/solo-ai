// lib/auth-server.ts

import { NextRequest, NextResponse } from "next/server"
import type { AuthenticatedUser, AuthResult } from "./auth-utils"
import { getStackServerApp } from "@/stack"

// Define Stack Auth user interface
interface StackUser {
  id: string
  primaryEmail?: string
  email?: string
  displayName?: string
  avatarUrl?: string
}

async function getStackAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const app = getStackServerApp()
    if (!app) return null
    const stackUser = await app.getUser() as StackUser | null
    if (!stackUser) return null

    // Map Stack user to our AuthenticatedUser shape
    return {
      id: stackUser.id,
      email: stackUser.primaryEmail || stackUser.email || "",
      full_name: stackUser.displayName,
      avatar_url: stackUser.avatarUrl,
      subscription_tier: undefined,
      subscription_status: undefined,
    }
  } catch (err) {
    console.error('Stack authentication error:', err)
    return null
  }
}

/**
 * Server-side authentication utility for API routes.
 * This now exclusively uses Stack Auth.
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    const stackUser = await getStackAuthenticatedUser()

    if (stackUser) {
      return { user: stackUser, error: null }
    } else {
      return { user: null, error: "No authenticated user session found" }
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