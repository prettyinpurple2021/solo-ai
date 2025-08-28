"use client"

import { StackProvider } from "@stackframe/stack"
import { ReactNode } from "react"

interface StackAuthProviderProps {
  children: ReactNode
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  // Check if required environment variables are available
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

  if (!projectId || !publishableClientKey) {
    console.warn('Stack Auth: Missing required environment variables. Authentication will not work.')
    // Return children without StackProvider if env vars are missing
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
