// Lazy import Stripe to prevent bundling issues with Cloudflare
import { logError } from '@/lib/logger';

let Stripe: typeof import('stripe').default | null = null
let stripeInstance: import('stripe').default | null = null

async function loadStripe() {
  if (!Stripe) {
    try {
      // Load Stripe dynamically
      const stripeModule = await import('stripe')
      Stripe = stripeModule.default
    } catch (error) {
      logError('Failed to load Stripe module', {}, error instanceof Error ? error : new Error(String(error)))
      return null
    }
  }
  return Stripe
}

// Initialize Stripe only when the secret key is available
async function getStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }

  if (!stripeInstance) {
    const StripeClass = await loadStripe()
    if (!StripeClass) {
      return null
    }
    stripeInstance = new StripeClass(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    } as any)
  }

  return stripeInstance
}

// Export a getter function instead of the instance directly
export async function getStripe() {
  return await getStripeInstance()
}

// For backwards compatibility, export a proxy that lazily loads Stripe
export const stripe = new Proxy({} as import('stripe').default, {
  get(target, prop) {
    throw new Error('Use await getStripe() instead of accessing stripe directly')
  }
})

// Helper function to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// Stripe Product IDs - From your Stripe dashboard
export const STRIPE_PRODUCTS = {
  LAUNCH: 'prod_T06VzLBN9hna1l', // SoloSuccess AI - Launch Plan (Free)
  ACCELERATOR: 'prod_T06ZE5uUl56Ez1', // SoloSuccess AI - Accelerator Plan
  DOMINATOR: 'prod_T06cdEqWcdrKgy', // SoloSuccess AI - Dominator Plan
} as const

// Stripe Price IDs - From your Stripe dashboard
export const STRIPE_PRICES = {
  LAUNCH: 'price_1S46IjPpYfwm37m7EKFi7H4C', // SoloSuccess AI - Launch Plan (Free)
  ACCELERATOR_MONTHLY: 'price_1S46LyPpYfwm37m7M5nOAYW7', // SoloSuccess AI - Accelerator Plan ($19/month)
  ACCELERATOR_YEARLY: 'price_1S46LyPpYfwm37m7lyRhudBs', // SoloSuccess AI - Accelerator Plan ($190/year)
  DOMINATOR_MONTHLY: 'price_1S46P6PpYfwm37m76hqohIw0', // SoloSuccess AI - Dominator Plan ($29/month)
  DOMINATOR_YEARLY: 'price_1S46PXPpYfwm37m7yVhLS7j2', // SoloSuccess AI - Dominator Plan ($290/year)
} as const

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  LAUNCH: {
    id: 'launch',
    name: 'Launch',
    price: 0,
    period: 'month',
    description: 'Perfect for ambitious beginners ready to start their empire',
    features: [
      'Access to 2 AI agents (Nova & Echo)',
      '5 AI conversations per day',
      'Basic task automation',
      'Email support',
      'Community access',
      'Mobile app access'
    ],
    limits: {
      aiAgents: 2,
      dailyConversations: 5,
      fileStorage: '1GB',
      goals: 5,
      tasks: 20,
      competitors: 3,
      templates: 5
    },
    stripePriceId: STRIPE_PRICES.LAUNCH,
    popular: false
  },
  ACCELERATOR: {
    id: 'accelerator',
    name: 'Accelerator',
    price: 19,
    period: 'month',
    yearlyPrice: 190,
    yearlyPeriod: 'year',
    description: 'For solo founders ready to scale their empire',
    features: [
      'Access to all 8 AI agents',
      'Unlimited AI conversations',
      'Advanced automation',
      'Priority support',
      'Advanced analytics',
      'File management (10GB)',
      'Competitive intelligence',
      'Guardian AI compliance',
      'Template library access',
      'API access'
    ],
    limits: {
      aiAgents: 8,
      dailyConversations: -1, // Unlimited
      fileStorage: '10GB',
      goals: -1, // Unlimited
      tasks: -1, // Unlimited
      competitors: 10,
      templates: -1 // Unlimited
    },
    stripePriceId: STRIPE_PRICES.ACCELERATOR_MONTHLY,
    stripeYearlyPriceId: STRIPE_PRICES.ACCELERATOR_YEARLY,
    popular: true
  },
  DOMINATOR: {
    id: 'dominator',
    name: 'Dominator',
    price: 29,
    period: 'month',
    yearlyPrice: 290,
    yearlyPeriod: 'year',
    description: 'For empire builders who demand the best',
    features: [
      'Everything in Accelerator',
      'White-label options',
      'Advanced API access',
      'Custom integrations',
      'File management (100GB)',
      'Priority feature requests',
      'Dedicated support',
      'Advanced analytics',
      'Custom workflows',
      'Team collaboration tools'
    ],
    limits: {
      aiAgents: 8,
      dailyConversations: -1, // Unlimited
      fileStorage: '100GB',
      goals: -1, // Unlimited
      tasks: -1, // Unlimited
      competitors: -1, // Unlimited
      templates: -1, // Unlimited
      teamMembers: 5
    },
    stripePriceId: STRIPE_PRICES.DOMINATOR_MONTHLY,
    stripeYearlyPriceId: STRIPE_PRICES.DOMINATOR_YEARLY,
    popular: false
  }
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Helper function to get subscription tier by ID
export function getSubscriptionTier(tierId: string) {
  return Object.values(SUBSCRIPTION_TIERS).find(tier => tier.id === tierId)
}

// Helper function to check if user has access to feature
export function hasFeatureAccess(
  userTier: string,
  feature: keyof typeof SUBSCRIPTION_TIERS.LAUNCH.limits
): boolean {
  const tier = getSubscriptionTier(userTier)
  if (!tier) return false

  const limit = tier.limits[feature]
  return limit === -1 || (typeof limit === 'number' && limit > 0) // -1 means unlimited
}

// Helper function to get usage limit for feature
export function getFeatureLimit(
  userTier: string,
  feature: keyof typeof SUBSCRIPTION_TIERS.LAUNCH.limits
): number {
  const tier = getSubscriptionTier(userTier)
  if (!tier) return 0

  return typeof tier.limits[feature] === 'number' ? tier.limits[feature] : 0
}

// Stripe webhook event types
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
} as const

// Create Stripe customer
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<import('stripe').Stripe.Customer> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  return await stripe.customers.create({
    email,
    name,
    metadata: {
      platform: 'SoloSuccess-ai',
      ...metadata
    }
  })
}

// Create Stripe checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<import('stripe').Stripe.Checkout.Session> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      platform: 'SoloSuccess-ai',
      ...metadata
    },
    subscription_data: {
      metadata: {
        platform: 'SoloSuccess-ai',
        ...metadata
      }
    }
  })
}

// Create Stripe billing portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<import('stripe').Stripe.BillingPortal.Session> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// Get Stripe subscription
export async function getStripeSubscription(
  subscriptionId: string
): Promise<import('stripe').Stripe.Subscription> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  return await stripe.subscriptions.retrieve(subscriptionId)
}

// Cancel Stripe subscription
export async function cancelStripeSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<import('stripe').Stripe.Subscription> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId)
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  }
}

// Update Stripe subscription
export async function updateStripeSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<import('stripe').Stripe.Subscription> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations'
  })
}

// Get Stripe customer
export async function getStripeCustomer(
  customerId: string
): Promise<import('stripe').Stripe.Customer> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  return await stripe.customers.retrieve(customerId) as import('stripe').Stripe.Customer
}

// List Stripe subscriptions for customer
export async function listStripeSubscriptions(
  customerId: string
): Promise<import('stripe').Stripe.Subscription[]> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all'
  })

  return subscriptions.data
}

// List all Stripe customers
export async function listStripeCustomers(
  limit: number = 100,
  startingAfter?: string
): Promise<import('stripe').Stripe.Customer[]> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const customers = await stripe.customers.list({
    limit,
    starting_after: startingAfter
  })

  return customers.data
}

// Get Stripe customers with pagination
export async function getStripeCustomersPaginated(
  limit: number = 100,
  startingAfter?: string
): Promise<{
  customers: import('stripe').Stripe.Customer[]
  hasMore: boolean
  nextStartingAfter?: string
}> {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const customers = await stripe.customers.list({
    limit,
    starting_after: startingAfter
  })

  return {
    customers: customers.data,
    hasMore: customers.has_more,
    nextStartingAfter: customers.data.length > 0 ? customers.data[customers.data.length - 1].id : undefined
  }
}

// Note: Usage records functionality removed as it's not available in current Stripe API version
// For metered billing, use Stripe's dashboard or implement custom usage tracking
