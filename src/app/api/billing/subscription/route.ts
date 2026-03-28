import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchUnifiedSubscriptionPayload } from '@/lib/billing/subscription-payload'
import { hasActiveSubscription, getUserSubscription } from '@/lib/stripe-db-utils'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userIdFromSession = session?.user?.id
    const userIdFromQuery = req.nextUrl.searchParams.get('userId')

    if (!userIdFromSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userIdFromQuery && userIdFromQuery !== userIdFromSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await fetchUnifiedSubscriptionPayload(userIdFromSession, {
      includeStripeSubscription: false,
    })

    if (!payload) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    logError('Billing subscription fetch failed', error)
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
    logError('Billing subscription feature check failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
