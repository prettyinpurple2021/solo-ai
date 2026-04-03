import { logError } from '@/lib/logger'
import { db } from '@/lib/database-client'
import { users } from '@/shared/db/schema'
import { eq, and, ne } from 'drizzle-orm'

// Get user by Stripe customer ID
export async function getUserByStripeCustomerId(customerId: string) {
  try {
    const results = await db.select({
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      subscription_tier: users.subscription_tier,
      subscription_status: users.subscription_status,
      stripe_customer_id: users.stripe_customer_id,
      stripe_subscription_id: users.stripe_subscription_id,
      current_period_start: users.current_period_start,
      current_period_end: users.current_period_end,
      cancel_at_period_end: users.cancel_at_period_end
    })
    .from(users)
    .where(eq(users.stripe_customer_id, customerId))
    .limit(1)

    return results[0] || null
  } catch (error) {
    logError('Error getting user by Stripe customer ID:', error)
    return null
  }
}

// Update user subscription
export async function updateUserSubscription(
  userId: string, 
  subscriptionData: {
    stripe_subscription_id?: string
    stripe_customer_id?: string
    subscription_tier?: string
    subscription_status?: string
    current_period_start?: Date
    current_period_end?: Date
    cancel_at_period_end?: boolean
  }
) {
  try {
    const updateData: any = {
      updated_at: new Date()
    }
    
    if (subscriptionData.stripe_subscription_id !== undefined) {
      updateData.stripe_subscription_id = subscriptionData.stripe_subscription_id
    }
    
    if (subscriptionData.stripe_customer_id !== undefined) {
      updateData.stripe_customer_id = subscriptionData.stripe_customer_id
    }
    
    if (subscriptionData.subscription_tier !== undefined) {
      updateData.subscription_tier = subscriptionData.subscription_tier
    }
    
    if (subscriptionData.subscription_status !== undefined) {
      updateData.subscription_status = subscriptionData.subscription_status
    }
    
    if (subscriptionData.current_period_start !== undefined) {
      updateData.current_period_start = subscriptionData.current_period_start
    }
    
    if (subscriptionData.current_period_end !== undefined) {
      updateData.current_period_end = subscriptionData.current_period_end
    }
    
    if (subscriptionData.cancel_at_period_end !== undefined) {
      updateData.cancel_at_period_end = subscriptionData.cancel_at_period_end
    }

    if (Object.keys(updateData).length === 1) { // Only updated_at
      return { success: false, error: 'No fields to update' }
    }

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        stripe_customer_id: users.stripe_customer_id,
        stripe_subscription_id: users.stripe_subscription_id
      })
    
    if (result.length === 0) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, user: result[0] }
  } catch (error) {
    logError('Error updating user subscription:', error)
    return { success: false, error: 'Database error' }
  }
}

// Update user Stripe customer ID
export async function updateUserStripeCustomerId(userId: string, customerId: string) {
  try {
    const result = await db.update(users)
      .set({ 
        stripe_customer_id: customerId, 
        updated_at: new Date() 
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        stripe_customer_id: users.stripe_customer_id
      })
    
    if (result.length === 0) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, user: result[0] }
  } catch (error) {
    logError('Error updating user Stripe customer ID:', error)
    return { success: false, error: 'Database error' }
  }
}

// Get subscription tier from price ID
export function getSubscriptionTierFromPriceId(priceId: string): string {
  // Match exact Stripe price IDs from lib/stripe.ts
  const priceIdToTierMap: Record<string, string> = {
    'price_1S46LyPpYfwm37m7M5nOAYW7': 'accelerator',
    'price_1S46LyPpYfwm37m7lyRhudBs': 'accelerator',
    'price_1S46P6PpYfwm37m76hqohIw0': 'dominator',
    'price_1S46PXPpYfwm37m7yVhLS7j2': 'dominator',
    'price_1S46IjPpYfwm37m7EKFi7H4C': 'launch',
  }
  
  // Check exact match first
  if (priceIdToTierMap[priceId]) {
    return priceIdToTierMap[priceId]
  }
  
  // Fallback: check if price ID contains tier name (excluding 'launch' as it's the default)
  const lowerPriceId = priceId.toLowerCase()
  const tierKeywords = ['accelerator', 'dominator']
  
  for (const keyword of tierKeywords) {
    if (lowerPriceId.includes(keyword)) {
      return keyword
    }
  }
  
  // Default to 'launch' tier if no match found
  return 'launch'
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const results = await db.select({
      subscription_status: users.subscription_status,
      subscription_tier: users.subscription_tier
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    
    if (results.length === 0) return false
    
    const user = results[0]
    return user.subscription_status === 'active' && user.subscription_tier !== 'launch' && user.subscription_tier !== 'free'
  } catch (error) {
    logError('Error checking active subscription:', error)
    return false
  }
}

// Get user subscription details
export async function getUserSubscription(userId: string) {
  try {
    const results = await db.select({
      email: users.email,
      subscription_tier: users.subscription_tier,
      subscription_status: users.subscription_status,
      stripe_customer_id: users.stripe_customer_id,
      stripe_subscription_id: users.stripe_subscription_id, 
      current_period_start: users.current_period_start,
      current_period_end: users.current_period_end,
      cancel_at_period_end: users.cancel_at_period_end
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    
    return results[0] || null
  } catch (error) {
    logError('Error getting user subscription:', error)
    return null
  }
}
