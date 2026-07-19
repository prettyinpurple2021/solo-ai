'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import posthog from 'posthog-js'

export function PostHogIdentify() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      const user = session.user as { id?: string; email?: string; name?: string }
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
