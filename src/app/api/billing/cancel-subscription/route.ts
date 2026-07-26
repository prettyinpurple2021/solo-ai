import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cancelSubscriptionAtPeriodEnd } from '@/lib/billing/subscription-lifecycle'
import { logError } from '@/lib/logger'
import { getPostHogClient } from '@/lib/posthog-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await cancelSubscriptionAtPeriodEnd(session.user.id)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    try {
      const posthog = getPostHogClient()
      posthog.capture({
        distinctId: session.user.id,
        event: 'subscription_cancelled',
        properties: {
          cancel_at_period_end: result.cancel_at_period_end,
          current_period_end: result.current_period_end,
        },
      })
      await posthog.flush()
    } catch (analyticsErr) {
      logError('PostHog cancellation tracking failed', analyticsErr)
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cancel_at_period_end: result.cancel_at_period_end,
      current_period_end: result.current_period_end,
    })
  } catch (error) {
    logError('Billing cancel-subscription failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
