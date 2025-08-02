"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { useCallback } from "react"

export function useClerkAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [signOut])

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut: handleSignOut,
    userId: user?.id,
    email: user?.emailAddresses?.[0]?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
  }
} 