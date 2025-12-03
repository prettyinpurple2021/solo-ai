import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getUserSubscription, hasActiveSubscription } from '@/lib/stripe-db-utils'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Get user's subscription details
export async function GET(_request: NextRequest) {
  try {
    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get subscription details from database
    const subscription = await getUserSubscription(user.id)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // If user has a Stripe subscription, get additional details from Stripe
    let stripeSubscription = null
    if (subscription.stripe_subscription_id) {
      try {
        const stripe = await getStripe()
        if (stripe) {
          stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
        }
      } catch (error) {
        logError('Error fetching Stripe subscription:', error)
        // Continue without Stripe data
      }
    }

    return NextResponse.json({
      subscription: {
        ...subscription,
        stripe_subscription: stripeSubscription
      }
    })

  } catch (error) {
    logError('Error getting subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Check if user has access to a feature
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { feature } = await request.json()

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature is required' },
        { status: 400 }
      )
    }

    // Check if user has active subscription
    const hasActive = await hasActiveSubscription(user.id)

    // Get subscription details
    const subscription = await getUserSubscription(user.id)

    return NextResponse.json({
      hasAccess: hasActive,
      subscription: subscription,
      feature: feature
    })

  } catch (error) {
    logError('Error checking feature access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
