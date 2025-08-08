"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useUser } from "@stackframe/stack"

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
  const user = useUser()
  const loading = !user
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 