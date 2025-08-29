"use client"

import { StackProvider } from "@stackframe/stack"
import { ReactNode, useEffect, useState } from "react"

interface StackAuthProviderProps {
  children: ReactNode
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if required environment variables are available
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

  // During SSR or if env vars are missing, render children without StackProvider
  if (!mounted || !projectId || !publishableClientKey) {
    if (!mounted) {
      // During SSR, render a loading state
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      )
    }
    
    // If env vars are missing, render children without StackProvider
    console.warn('Stack Auth: Missing required environment variables. Authentication will not work.')
    return <>{children}</>
  }

  return (
    <StackProvider
      projectId={projectId}
      publishableClientKey={publishableClientKey}
      urls={{
        signIn: '/signin',
        signUp: '/signup',
      }}
    >
      {children}
    </StackProvider>
  )
}
