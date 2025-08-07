"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth"
import { useCallback, useEffect, useState } from "react"

interface UnifiedUser {
  id: string
  email?: string
  fullName?: string
  imageUrl?: string
  provider: 'clerk' | 'supabase'
  isLoaded: boolean
  isSignedIn: boolean
}

interface UnifiedAuth {
  user: UnifiedUser | null
  isLoaded: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  provider: 'clerk' | 'supabase' | null
}

export function useUnifiedAuth(): UnifiedAuth {
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [provider, setProvider] = useState<'clerk' | 'supabase' | null>(null)

  // Clerk hooks
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useUser()
  const { signOut: clerkSignOut } = useAuth()

  // Supabase hooks
  const { user: supabaseUser, loading: supabaseLoading, signOut: supabaseSignOut } = useSupabaseAuth()

  // Determine which provider to use
  useEffect(() => {
    if (clerkLoaded && !supabaseLoading) {
      if (clerkSignedIn && clerkUser) {
        setProvider('clerk')
        setUnifiedUser({
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          fullName: clerkUser.fullName || undefined,
          imageUrl: clerkUser.imageUrl,
          provider: 'clerk',
          isLoaded: clerkLoaded,
          isSignedIn: clerkSignedIn,
        })
        setIsLoaded(true)
      } else if (supabaseUser) {
        setProvider('supabase')
        setUnifiedUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          fullName: supabaseUser.user_metadata?.full_name,
          imageUrl: supabaseUser.user_metadata?.avatar_url,
          provider: 'supabase',
          isLoaded: !supabaseLoading,
          isSignedIn: !!supabaseUser,
        })
        setIsLoaded(true)
      } else {
        setProvider(null)
        setUnifiedUser(null)
        setIsLoaded(true)
      }
    }
  }, [clerkUser, clerkLoaded, clerkSignedIn, supabaseUser, supabaseLoading])

  const signOut = useCallback(async () => {
    try {
      if (provider === 'clerk') {
        await clerkSignOut()
      } else if (provider === 'supabase') {
        await supabaseSignOut()
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [provider, clerkSignOut, supabaseSignOut])

  const signIn = useCallback(async (email: string, password: string) => {
    // For now, we'll use Clerk as the primary auth provider
    // You can implement Supabase sign-in here if needed during migration
    throw new Error('Please use Clerk sign-in components for authentication')
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    // For now, we'll use Clerk as the primary auth provider
    // You can implement Supabase sign-up here if needed during migration
    throw new Error('Please use Clerk sign-up components for authentication')
  }, [])

  return {
    user: unifiedUser,
    isLoaded,
    isSignedIn: !!unifiedUser?.isSignedIn,
    signOut,
    signIn,
    signUp,
    provider,
  }
}

// Migration helper hook
export function useAuthMigration() {
  const { user, provider } = useUnifiedAuth()
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'completed' | 'error'>('idle')

  const checkMigrationStatus = useCallback(async () => {
    if (!user || provider !== 'clerk') return

    setMigrationStatus('checking')
    try {
      const response = await fetch('/api/auth/migration-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId: user.id }),
      })

      const data = await response.json()
      
      if (data.migrated) {
        setMigrationStatus('completed')
      } else {
        setMigrationStatus('idle')
      }
    } catch (error) {
      console.error('Migration status check failed:', error)
      setMigrationStatus('error')
    }
  }, [user, provider])

  const startMigration = useCallback(async () => {
    if (!user || provider !== 'clerk') return

    setMigrationStatus('migrating')
    try {
      const response = await fetch('/api/auth/migrate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId: user.id }),
      })

      const data = await response.json()
      
      if (data.success) {
        setMigrationStatus('completed')
      } else {
        setMigrationStatus('error')
      }
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationStatus('error')
    }
  }, [user, provider])

  return {
    migrationStatus,
    checkMigrationStatus,
    startMigration,
    needsMigration: provider === 'clerk' && migrationStatus === 'idle',
  }
} 