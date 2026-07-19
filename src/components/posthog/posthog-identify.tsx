'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import posthog from 'posthog-js'

type PostHogUser = {
  id?: string
  email?: string | null
  name?: string | null
}

function toPostHogUser(value: unknown): PostHogUser | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const user = value as Record<string, unknown>
  const id = typeof user.id === 'string' ? user.id : undefined
  const email = typeof user.email === 'string' ? user.email : undefined
  const name = typeof user.name === 'string' ? user.name : undefined

  return { id, email, name }
}

export function PostHogIdentify() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      const user = toPostHogUser(session.user)
      if (!user) return
      const distinctId = user.id || user.email
      if (distinctId) {
        posthog.identify(distinctId, {
          email: user.email,
          name: user.name,
        })
      }
    } else if (status === 'unauthenticated') {
      posthog.reset()
    }
  }, [session, status])

  return null
}
