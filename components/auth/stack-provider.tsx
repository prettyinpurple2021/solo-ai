"use client"

import { StackProvider } from "@stackframe/stack"
import { ReactNode } from "react"

interface StackAuthProviderProps {
  children: ReactNode
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  return (
    <StackProvider
      projectId={process.env.NEXT_PUBLIC_STACK_PROJECT_ID!}
      publishableClientKey={process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!}
      urls={{
        signIn: '/signin',
        signUp: '/signup',
      }}
    >
      {children}
    </StackProvider>
  )
}
