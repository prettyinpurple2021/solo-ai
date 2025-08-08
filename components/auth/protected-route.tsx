"use client"

// Removed Clerk imports - using Supabase auth only
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = "/"
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(redirectTo)
    }
  }, [isLoaded, isSignedIn, router, redirectTo])

  if (!isLoaded) {
    return <>{fallback}</>
  }

  if (!isSignedIn) {
    return null
  }

  return <>{children}</>
} 