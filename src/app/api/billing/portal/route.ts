import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createBillingPortalForUser } from '@/lib/billing/portal'
import { isStripeConfigured } from '@/lib/stripe'
import { logError, logInfo } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured in this environment' }, { status: 500 })
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
    const returnUrl = `${baseUrl}/dashboard/billing`

    logInfo('Creating billing portal session', { userId: session.user.id })

    const result = await createBillingPortalForUser({
      userId: session.user.id,
      returnUrl,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      url: result.url,
      success: true,
    })
  } catch (error) {
    logError('Error creating billing portal session', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
