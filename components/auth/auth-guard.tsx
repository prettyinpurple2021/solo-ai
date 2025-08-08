"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useUser()
  const loading = !user
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      setIsChecking(false)

      // If user is not authenticated and trying to access protected routes
      if (!user && pathname !== "/" && !pathname.startsWith("/auth")) {
        router.push("/")
      }
    }
  }, [user, loading, router, pathname])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-lg font-medium">Loading your empire...</span>
        </div>
      </div>
    )
  }

  // For protected routes, require authentication
  if (!user && pathname !== "/" && !pathname.startsWith("/auth")) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
