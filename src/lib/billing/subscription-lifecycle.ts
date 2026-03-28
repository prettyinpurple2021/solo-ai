import { getStripe } from '@/lib/stripe'
import { getUserSubscription, updateUserSubscription } from '@/lib/stripe-db-utils'
import { logError } from '@/lib/logger'

export type LifecycleResult =
  | {
      ok: true
      message: string
      cancel_at_period_end: boolean
      current_period_end: Date
    }
  | { ok: false; error: string; status: number }

export async function cancelSubscriptionAtPeriodEnd(userId: string): Promise<LifecycleResult> {
  const subscription = await getUserSubscription(userId)
  if (!subscription?.stripe_subscription_id) {
    return { ok: false, error: 'No active subscription found', status: 404 }
  }

  const stripe = getStripe()
  if (!stripe) {
    return { ok: false, error: 'Stripe not configured', status: 500 }
  }

  try {
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    const result = await updateUserSubscription(userId, { cancel_at_period_end: true })
    if (!result.success) {
      logError('Failed to update user subscription after Stripe cancel', result.error)
      return { ok: false, error: 'Failed to update subscription', status: 500 }
    }

    const periodEndSec = (stripeSubscription as { current_period_end?: number }).current_period_end
    const currentPeriodEnd = periodEndSec
      ? new Date(periodEndSec * 1000)
      : new Date()

    return {
      ok: true,
      message: 'Subscription will be canceled at the end of the current period',
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd,
    }
  } catch (error) {
    logError('cancelSubscriptionAtPeriodEnd failed', error)
    return { ok: false, error: 'Internal server error', status: 500 }
  }
}

export async function reactivateSubscription(userId: string): Promise<LifecycleResult> {
  const subscription = await getUserSubscription(userId)
  if (!subscription?.stripe_subscription_id) {
    return { ok: false, error: 'No subscription found', status: 404 }
  }

  const stripe = getStripe()
  if (!stripe) {
    return { ok: false, error: 'Stripe not configured', status: 500 }
  }

  try {
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    const result = await updateUserSubscription(userId, { cancel_at_period_end: false })
    if (!result.success) {
      logError('Failed to update user subscription after Stripe reactivate', result.error)
      return { ok: false, error: 'Failed to update subscription', status: 500 }
    }

    const periodEndSec = (stripeSubscription as { current_period_end?: number }).current_period_end
    const currentPeriodEnd = periodEndSec
      ? new Date(periodEndSec * 1000)
      : new Date()

    return {
      ok: true,
      message: 'Subscription reactivated successfully',
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd,
    }
  } catch (error) {
    logError('reactivateSubscription failed', error)
    return { ok: false, error: 'Internal server error', status: 500 }
  }
}
