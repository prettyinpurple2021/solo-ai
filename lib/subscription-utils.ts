import { query } from '@/lib/neon/client'

export interface SubscriptionInfo {
  tier: 'free' | 'launch' | 'accelerator' | 'dominator'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  features: {
    maxAgents: number
    maxConversationsPerDay: number
    maxTeamMembers: number
    hasAdvancedAnalytics: boolean
    hasPrioritySupport: boolean
    hasAPIAccess: boolean
    hasCustomBranding: boolean
  }
}

/**
 * Get user subscription information and determine feature access
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const result = await query(
      'SELECT subscription_tier, subscription_status FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      throw new Error('User not found')
    }

    const { subscription_tier, subscription_status } = result.rows[0]
    const tier = subscription_tier || 'launch'
    const status = subscription_status || 'active'

    return {
      tier: tier as SubscriptionInfo['tier'],
      status: status as SubscriptionInfo['status'],
      features: getFeaturesByTier(tier)
    }
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    // Return default free tier on error
    return {
      tier: 'launch',
      status: 'active',
      features: getFeaturesByTier('launch')
    }
  }
}

/**
 * Get features available for a specific subscription tier
 */
function getFeaturesByTier(tier: string): SubscriptionInfo['features'] {
  const features = {
    launch: {
      maxAgents: 2,
      maxConversationsPerDay: 5,
      maxTeamMembers: 1,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
      hasAPIAccess: false,
      hasCustomBranding: false,
    },
    accelerator: {
      maxAgents: 5,
      maxConversationsPerDay: 100,
      maxTeamMembers: 3,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
      hasAPIAccess: false,
      hasCustomBranding: true,
    },
    dominator: {
      maxAgents: 8,
      maxConversationsPerDay: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
      hasAPIAccess: true,
      hasCustomBranding: true,
    }
  }

  return features[tier as keyof typeof features] || features.launch
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string, 
  feature: keyof SubscriptionInfo['features']
): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription.features[feature] === true
}

/**
 * Check if user is within their usage limits
 */
export async function checkUsageLimit(
  userId: string,
  limitType: 'agents' | 'conversations' | 'teamMembers'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await getUserSubscription(userId)
  
  // Get current usage from database
  let current = 0
  let limit = 0

  switch (limitType) {
    case 'agents':
      // This would typically check how many AI agents the user has accessed today
      current = 0 // Placeholder - implement based on your tracking
      limit = subscription.features.maxAgents
      break
    case 'conversations':
      // Check conversations today
      const conversationResult = await query(
        `SELECT COUNT(*) as count FROM conversations 
         WHERE user_id = $1 AND created_at >= CURRENT_DATE`,
        [userId]
      )
      current = parseInt(conversationResult.rows[0]?.count || '0')
      limit = subscription.features.maxConversationsPerDay
      break
    case 'teamMembers':
      current = 1 // Placeholder - implement team member counting
      limit = subscription.features.maxTeamMembers
      break
  }

  return {
    allowed: limit === -1 || current < limit,
    current,
    limit
  }
}

/**
 * Update user subscription status (called by webhook)
 */
export async function updateSubscriptionStatus(
  userId: string,
  tier: string,
  status: string
): Promise<void> {
  await query(
    'UPDATE users SET subscription_tier = $1, subscription_status = $2, updated_at = NOW() WHERE id = $3',
    [tier, status, userId]
  )
}
