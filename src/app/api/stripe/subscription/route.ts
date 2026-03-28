import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchUnifiedSubscriptionPayload } from '@/lib/billing/subscription-payload'
import { hasActiveSubscription, getUserSubscription } from '@/lib/stripe-db-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await fetchUnifiedSubscriptionPayload(session.user.id, {
      includeStripeSubscription: true,
    })

    if (!payload) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    logError('Error getting subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feature } = await request.json()
    if (!feature || typeof feature !== 'string') {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 })
    }

    const userId = session.user.id
    const hasActive = await hasActiveSubscription(userId)
    const subscription = await getUserSubscription(userId)

    return NextResponse.json({
      hasAccess: hasActive,
      subscription,
      feature,
    })
  } catch (error) {
    logError('Error checking feature access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
