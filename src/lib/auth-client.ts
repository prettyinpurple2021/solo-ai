/**
 * Client-side authentication utilities
 * Migrated to Auth.js (NextAuth) v5
 */
"use client"

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession as useNextAuthSession, getSession as getNextAuthSession } from "next-auth/react"

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  // ... other fields can be added but might need database migration or proper mapping
}

// Wrapper for compatibility
export async function signIn(email: string, password: string) {
  const result = await nextAuthSignIn("credentials", {
    email,
    password,
    redirect: false,
  })

  // NextAuth v5 credentials provider returns { error, status, ok, url }
  if (result?.error) {
    throw new Error(result.error)
  }

  // Fetch session to return complete user object if needed, or just return success
  const session = await getNextAuthSession()
  return {
    user: session?.user,
    session: session 
  }
}

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: (metadata?.full_name as string) || (metadata?.username as string) }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Registration failed")
  }

  // Auto sign in after registration
  return signIn(email, password)
}

export async function signOut() {
  await nextAuthSignOut({ redirect: true, callbackUrl: "/login" })
}

export async function getSession() {
  const session = await getNextAuthSession()
  return {
    user: session?.user || null,
    session: session
  }
}

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()
  
  return {
    data: session ? { user: session.user, session } : null,
    status,
    update
  }
}

export function useUser() {
  const { data: session, status } = useNextAuthSession()
  return {
    data: session?.user || null,
    isLoading: status === "loading",
    error: status === "unauthenticated" ? "Not authenticated" : null
  }
}

// Deprecated / Stubbed methods
export async function verifyTOTP(args: { code: string }) { 
  const res = await fetch("/api/auth/totp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: args.code }),
  })
  const data = await res.json()
  if (!res.ok) {
    return { data: null, error: { message: data.error || "TOTP verification failed" } }
  }
  return { data: data.success, error: null as any }
}

export async function resend2FACode(args?: { method?: 'email' | 'sms' }) { 
  const res = await fetch("/api/auth/totp/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: args?.method || 'email' }),
  })
  const data = await res.json()
  if (!res.ok) {
    return { data: null, error: { message: data.error || "Failed to resend 2FA code" } }
  }
  return { data: data.success, error: null as any }
}
interface ApproveDeviceParams {
  deviceFingerprint: string;
  deviceName: string;
  deviceType: string;
  trustDevice: boolean;
}

interface DenyDeviceParams {
  deviceFingerprint: string;
}

export async function approveDevice(_data?: ApproveDeviceParams) { return { data: true, error: null as any } } 
export async function denyDevice(_data: DenyDeviceParams) { return { data: true, error: null as any } } 
export async function getSessions() { return { data: { sessions: [] }, error: null as any } }
export async function revokeSession(args?: any) { return { data: true, error: null as any } }
export async function revokeOtherSessions() { return { data: true, error: null as any } }

export const authClient = {
  signIn,
  signUp,
  signOut,
  getSession,
  useSession,
  useUser,
  twoFactor: {
    verifyTOTP,
    resendCode: resend2FACode
  },
  multiSession: {
    approveDevice,
    denyDevice,
    getSessions,
    revokeSession,
    revokeOtherSessions
  }
}
