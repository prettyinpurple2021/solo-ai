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
  
  // Check if we have the required environment variables
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
  
  // During SSR/build time or if environment variables are missing, render children without StackAuth
  if (!mounted || !projectId || !publishableClientKey) {
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
