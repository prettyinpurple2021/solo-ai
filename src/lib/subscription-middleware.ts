import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getUserSubscription, hasActiveSubscription } from './stripe-db-utils'

// Define which routes require which subscription tiers
const SUBSCRIPTION_REQUIREMENTS: Record<string, 'accelerator' | 'dominator'> = {
  '/custom-agents': 'accelerator',
  '/advanced-analytics': 'accelerator',
  '/api/custom-agents': 'accelerator',
  '/api/advanced-analytics': 'accelerator',
  '/white-label': 'dominator',
  '/enterprise': 'dominator',
  '/api/white-label': 'dominator',
  '/api/enterprise': 'dominator',
}

// Check if a route requires subscription
export function requiresSubscription(pathname: string): 'accelerator' | 'dominator' | null {
  // Check exact matches first
  if (SUBSCRIPTION_REQUIREMENTS[pathname]) {
    return SUBSCRIPTION_REQUIREMENTS[pathname]
  }

  // Check if pathname starts with any of the protected routes
  for (const [route, tier] of Object.entries(SUBSCRIPTION_REQUIREMENTS)) {
    if (pathname.startsWith(route)) {
      return tier
    }
  }

  return null
}

// Check if user has required subscription tier
export function hasRequiredTier(userTier: string, requiredTier: 'accelerator' | 'dominator'): boolean {
  if (requiredTier === 'accelerator') {
    return userTier === 'accelerator' || userTier === 'dominator'
  } else if (requiredTier === 'dominator') {
    return userTier === 'dominator'
  }
  return false
}

// Middleware function to check subscription access
export async function checkSubscriptionAccess(
  request: NextRequest,
  userId: string
): Promise<{ allowed: boolean; redirectTo?: string; error?: string }> {
  try {
    const pathname = request.nextUrl.pathname
    const requiredTier = requiresSubscription(pathname)

    // If no subscription required, allow access
    if (!requiredTier) {
      return { allowed: true }
    }

    // Check if user has active subscription
    const hasActive = await hasActiveSubscription(userId)
    if (!hasActive) {
      return {
        allowed: false,
        redirectTo: '/pricing',
        error: 'Active subscription required'
      }
    }

    // Get user subscription details
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        allowed: false,
        redirectTo: '/pricing',
        error: 'Subscription not found'
      }
    }

    // Check if user has required tier
    const hasTier = hasRequiredTier(subscription.subscription_tier, requiredTier)

    if (!hasTier) {
      return {
        allowed: false,
        redirectTo: '/pricing',
        error: `${requiredTier} subscription required`
      }
    }

    return { allowed: true }
  } catch (error) {
    logError('Error checking subscription access:', error)
    return {
      allowed: false,
      redirectTo: '/pricing',
      error: 'Error checking subscription'
    }
  }
}

// API route wrapper for subscription checks
export function withSubscriptionCheck(
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
  requiredTier?: 'accelerator' | 'dominator'
) {
  return async (request: NextRequest, userId: string) => {
    // If no tier required, proceed normally
    if (!requiredTier) {
      return handler(request, userId)
    }

    // Check subscription access
    const accessCheck = await checkSubscriptionAccess(request, userId)
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: accessCheck.error || 'Subscription required',
          requiredTier,
          redirectTo: accessCheck.redirectTo
        },
        { status: 403 }
      )
    }

    // Proceed with the original handler
    return handler(request, userId)
  }
}
