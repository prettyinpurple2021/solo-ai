import { logError,} from '@/lib/logger'
import { neon } from '@neondatabase/serverless'
import { SUBSCRIPTION_TIERS } from '@/lib/pricing'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export interface UsageLimit {
  allowed: boolean
  current: number
  limit: number
  remaining: number
}

/**
 * Get or create today's usage record for a user
 */
async function getTodayUsage(userId: string) {
  const sql = getSql()

  const result = await sql`
    INSERT INTO daily_usage_limits (user_id, date, conversations_count, agents_accessed, file_storage_bytes)
    VALUES (${userId}, CURRENT_DATE, 0, ARRAY[]: TEXT[], 0)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING *
  `

  return result[0]
}

/**
 * Get user's subscription tier and limits
 */
export async function getUserLimits(userId: string) {
  const sql = getSql()

  const users = await sql`
    SELECT subscription_tier, subscription_status
    FROM users
    WHERE id = ${userId}
  `

  if (users.length === 0) {
    throw new Error('User not found')
  }

  const { subscription_tier } = users[0]
  const tier = subscription_tier || 'launch'

  // Get limits from SUBSCRIPTION_TIERS
  const tierConfig = SUBSCRIPTION_TIERS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]

  if (!tierConfig) {
    logError(`Unknown subscription tier: ${tier}`)
    return SUBSCRIPTION_TIERS.LAUNCH.limits
  }

  return tierConfig.limits
}

/**
 * Check if user can start a new conversation
 */
export async function checkConversationLimit(userId: string): Promise<UsageLimit> {
  try {
    const limits = await getUserLimits(userId)
    const usage = await getTodayUsage(userId)

    const current = usage.conversations_count || 0
    const limit = limits.dailyConversations

    // -1 means unlimited
    if ((limit as number) === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1
      }
    }

    const allowed = current < limit
    const remaining = Math.max(0, limit - current)

    return { allowed, current, limit, remaining }
  } catch (error) {
    logError('Error checking conversation limit:', error)
    // Fail open - allow the request but log the error
    return { allowed: true, current: 0, limit: -1, remaining: -1 }
  }
}

/**
 * Increment conversation count for today
 */
export async function incrementConversationCount(userId: string): Promise<boolean> {
  try {
    const sql = getSql()

    await sql`
      INSERT INTO daily_usage_limits (user_id, date, conversations_count)
      VALUES (${userId}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, date)
      DO UPDATE SET 
        conversations_count = daily_usage_limits.conversations_count + 1,
        updated_at = NOW()
    `

    return true
  } catch (error) {
    logError('Error incrementing conversation count:', error)
    return false
  }
}

/**
 * Check if user can access a specific agent
 */
export async function checkAgentAccess(userId: string, agentId: string): Promise<UsageLimit> {
  try {
    const limits = await getUserLimits(userId)
    const usage = await getTodayUsage(userId)

    const agentsAccessed = (usage.agents_accessed as string[]) || []
    const uniqueAgents = new Set(agentsAccessed)
    uniqueAgents.add(agentId)

    const current = uniqueAgents.size
    const limit = limits.aiAgents

    // -1 means unlimited
    if ((limit as number) === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1
      }
    }

    const allowed = current <= limit
    const remaining = Math.max(0, limit - current + 1)

    return { allowed, current, limit, remaining }
  } catch (error) {
    logError('Error checking agent access:', error)
    return { allowed: true, current: 0, limit: -1, remaining: -1 }
  }
}

/**
 * Track agent access
 */
export async function trackAgentAccess(userId: string, agentId: string): Promise<boolean> {
  try {
    const sql = getSql()

    // Check if we need to add the agent to today's accessed list
    const usage = await getTodayUsage(userId)
    const agentsAccessed = (usage.agents_accessed as string[]) || []

    if (!agentsAccessed.includes(agentId)) {
      await sql`
        UPDATE daily_usage_limits
        SET 
          agents_accessed = array_append(agents_accessed, ${agentId}),
          updated_at = NOW()
        WHERE user_id = ${userId} AND date = CURRENT_DATE
      `
    }

    return true
  } catch (error) {
    logError('Error tracking agent access:', error)
    return false
  }
}

/**
 * Check file storage limit
 */
export async function checkFileStorageLimit(userId: string, additionalBytes: number): Promise<UsageLimit> {
  try {
    const sql = getSql()
    const limits = await getUserLimits(userId)

    // Get current total file storage
    const result = await sql`
      SELECT COALESCE(SUM(size_bytes), 0) as total_bytes
      FROM briefcase_files
      WHERE user_id = ${userId}
    `

    const current = Number(result[0]?.total_bytes || 0)
    const limitStr = limits.fileStorage as string

    // Parse storage limit (e.g., "1GB", "10GB", "100GB")
    let limitBytes: number
    if (limitStr.includes('GB')) {
      limitBytes = parseInt(limitStr) * 1024 * 1024 * 1024
    } else if (limitStr.includes('MB')) {
      limitBytes = parseInt(limitStr) * 1024 * 1024
    } else {
      limitBytes = -1 // Unlimited
    }

    if (limitBytes === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1
      }
    }

    const allowed = (current + additionalBytes) <= limitBytes
    const remaining = Math.max(0, limitBytes - current)

    return { allowed, current, limit: limitBytes, remaining }
  } catch (error) {
    logError('Error checking file storage limit:', error)
    return { allowed: true, current: 0, limit: -1, remaining: -1 }
  }
}

/**
 * Check if user has access to advanced features
 */
export async function hasAdvancedFeatureAccess(userId: string, feature: 'analytics' | 'priority_support' | 'api_access' | 'custom_branding'): Promise<boolean> {
  try {
    const limits = await getUserLimits(userId)

    switch (feature) {
      case 'analytics':
        return limits.aiAgents >= 5 // Accelerator or higher
      case 'priority_support':
        return limits.aiAgents >= 5 // Accelerator or higher  
      case 'api_access':
        return limits.aiAgents === 10 && limits.dailyConversations === -1 // Dominator only
      case 'custom_branding':
        return limits.aiAgents >= 5 // Accelerator or higher
      default:
        return false
    }
  } catch (error) {
    logError(`Error checking ${feature} access:`, error)
    return false
  }
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(userId: string) {
  try {
    const limits = await getUserLimits(userId)
    const usage = await getTodayUsage(userId)

    const conversationLimit = await checkConversationLimit(userId)
    const storageLimit = await checkFileStorageLimit(userId, 0)

    return {
      conversations: conversationLimit,
      agents: {
        current: (usage.agents_accessed as string[])?.length || 0,
        limit: limits.aiAgents,
        remaining: (limits.aiAgents as number) === -1 ? -1 : Math.max(0, limits.aiAgents - ((usage.agents_accessed as string[])?.length || 0))
      },
      storage: storageLimit,
      features: {
        hasAdvancedAnalytics: await hasAdvancedFeatureAccess(userId, 'analytics'),
        hasPrioritySupport: await hasAdvancedFeatureAccess(userId, 'priority_support'),
        hasAPIAccess: await hasAdvancedFeatureAccess(userId, 'api_access'),
        hasCustomBranding: await hasAdvancedFeatureAccess(userId, 'custom_branding')
      }
    }
  } catch (error) {
    logError('Error getting usage summary:', error)
    throw error
  }
}
