import { getStripe } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/stripe-db-utils'

function normalizeTier(tier: string | null | undefined): string {
  const t = (tier || 'free').toLowerCase()
  if (t === 'free') return 'launch'
  return t
}

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

export interface UnifiedSubscriptionPayload {
  tier: string
  status: string
  current_period_end: string | null
  subscription: {
    subscription_tier: string
    subscription_status: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    stripe_subscription?: unknown
  }
}

export async function fetchUnifiedSubscriptionPayload(
  userId: string,
  options: { includeStripeSubscription?: boolean } = {},
): Promise<UnifiedSubscriptionPayload | null> {
  const row = await getUserSubscription(userId)
  if (!row) return null

  const normalizedTier = normalizeTier(row.subscription_tier)
  const status =
    row.subscription_status || (normalizedTier === 'launch' ? 'inactive' : 'active')

  let stripeSubscription: unknown | undefined
  if (options.includeStripeSubscription && row.stripe_subscription_id) {
    try {
      const stripe = getStripe()
      if (stripe) {
        stripeSubscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id)
      }
    } catch {
      stripeSubscription = undefined
    }
  }

  const currentPeriodStart = toIso(row.current_period_start as Date | null)
  const currentPeriodEnd = toIso(row.current_period_end as Date | null)

  const subscription = {
    subscription_tier: normalizedTier,
    subscription_status: row.subscription_status,
    stripe_customer_id: row.stripe_customer_id,
    stripe_subscription_id: row.stripe_subscription_id,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: row.cancel_at_period_end,
    ...(stripeSubscription !== undefined ? { stripe_subscription: stripeSubscription } : {}),
  }

  return {
    tier: normalizedTier,
    status,
    current_period_end: currentPeriodEnd,
    subscription,
  }
}
