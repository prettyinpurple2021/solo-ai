"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs"

interface AuthContextType {
  user: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerkAuth()

  const value = {
    user: user ? {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      full_name: user.fullName,
      avatar_url: user.imageUrl,
    } : null,
    loading: !isLoaded,
    signOut: async () => {
      await signOut()
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
