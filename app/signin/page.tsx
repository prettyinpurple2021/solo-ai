"use client"

import { useEffect, useState } from "react"
import { NeonAuth } from "@/components/auth/neon-auth"
import FallbackSignIn from "./fallback"

// Disable static generation for auth pages
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const [hasStackAuth, setHasStackAuth] = useState(true)

  useEffect(() => {
    // Check if Stack Auth environment variables are available
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
    const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
    
    if (!projectId || !publishableKey) {
      setHasStackAuth(false)
    }
  }, [])

  // Use fallback if Stack Auth is not available
  if (!hasStackAuth) {
    return <FallbackSignIn />
  }

  return <NeonAuth />
}
