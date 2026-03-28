import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reactivateSubscription } from '@/lib/billing/subscription-lifecycle'
import { logError } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await reactivateSubscription(session.user.id)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cancel_at_period_end: result.cancel_at_period_end,
      current_period_end: result.current_period_end,
    })
  } catch (error) {
    logError('Billing reactivate-subscription failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
