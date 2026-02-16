"use client"

import { useRouter} from "next/navigation"
import { useEffect, type ReactNode} from "react"
import { useUser} from "@/lib/auth-client"

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
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
