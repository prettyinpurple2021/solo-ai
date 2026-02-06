"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useCallback } from "react"
import { authClient } from "@/lib/auth-client"
import type {} from "@/lib/auth-client" // Use new User type or adapt

// Extended User type to match DB schema and Session callback
export interface AuthUser {
  id?: string | null
  name?: string | null
  email?: string | null
  image?: string | null
  full_name?: string | null
  username?: string | null
  role?: string | null
  avatar_url?: string | null
  subscription_tier?: string | null
}

// Maintain compatibility interface as much as possible
interface AuthContextType {
  user: AuthUser | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null> 
}

// Dummy provider for compatibility if imported elsewhere
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useAuth(): AuthContextType {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authClient.signIn(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      await authClient.signUp(email, password, metadata)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [])

  const signOut = useCallback(async () => {
    await authClient.signOut()
  }, [])

  const getToken = useCallback(async () => {
    return null // Tokens are HttpOnly cookies now
  }, [])

  return {
    user: (session?.user as AuthUser) || null,
    session: session,
    loading,
    signIn,
    signUp,
    signOut,
    getToken
  }
}
