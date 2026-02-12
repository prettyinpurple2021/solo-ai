import { logError } from "@/lib/logger"
import { getSql } from "@/lib/api-utils"

// --- CONSTANTS ---

export const TIERS = {
  FREE: 'launch',
  ACCELERATOR: 'accelerator',
  DOMINATOR: 'dominator'
} as const;

export type SubscriptionTier = typeof TIERS[keyof typeof TIERS];

// Agent IDs (must match filenames or database IDs)
export const AGENTS = {
  ROXY: 'roxy',
  LEXI: 'lexi',
  NOVA: 'nova',
  ECHO: 'echo',
  GLITCH: 'glitch',
  BLAZE: 'blaze',
  VEX: 'vex',
  LUMI: 'lumi',
  AURA: 'aura', 
  SALES: 'sales', // Kept for backward compatibility if needed, though Blaze is the main sales engine
} as const;

// 1. Agent Access Rules
export const AGENT_ACCESS: Record<SubscriptionTier, string[]> = {
  [TIERS.FREE]: [AGENTS.AURA], // Basic Wellness only
  [TIERS.ACCELERATOR]: [AGENTS.AURA, AGENTS.BLAZE, AGENTS.GLITCH, AGENTS.VEX, AGENTS.SALES],
  [TIERS.DOMINATOR]: Object.values(AGENTS), // All agents
};

// 2. Storage Limits (in Bytes)
const MB = 1024 * 1024;
const GB = 1024 * MB;

export const STORAGE_LIMITS: Record<SubscriptionTier, number> = {
  [TIERS.FREE]: 50 * MB,
  [TIERS.ACCELERATOR]: 1 * GB,
  [TIERS.DOMINATOR]: 10 * GB,
};

// 3. Chat Limits (Messages per Day)
// -1 means Unlimited
export const CHAT_LIMITS: Record<SubscriptionTier, number> = {
  [TIERS.FREE]: 10,
  [TIERS.ACCELERATOR]: 100,
  [TIERS.DOMINATOR]: -1,
};

// 4. Feature Flags (Booleans)
export const TIER_FEATURES = {
  [TIERS.FREE]: {
    canUseWarRoom: false,
    canUseIronclad: false,
    canUseCompetitorStalker: false,
    canUseIdeaIncinerator: false,
    canUseTacticalRoadmap: false,
    canUseBoardroom: false,
    customBranding: false,
    prioritySupport: false,
  },
  [TIERS.ACCELERATOR]: {
    canUseWarRoom: false,
    canUseIronclad: false,
    canUseCompetitorStalker: false,
    canUseIdeaIncinerator: true,
    canUseTacticalRoadmap: true,
    canUseBoardroom: false,
    customBranding: true,
    prioritySupport: true,
  },
  [TIERS.DOMINATOR]: {
    canUseWarRoom: true,
    canUseIronclad: true,
    canUseCompetitorStalker: true,
    canUseIdeaIncinerator: true,
    canUseTacticalRoadmap: true,
    canUseBoardroom: true,
    customBranding: true,
    prioritySupport: true,
  }
} as const;


export interface SubscriptionInfo {
  tier: SubscriptionTier
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  features: {
    maxAgents: number
    maxConversationsPerDay: number
    maxTeamMembers: number
    hasAdvancedAnalytics: boolean
    hasPrioritySupport: boolean
    hasAPIAccess: boolean
    hasCustomBranding: boolean
    allowedAgents: string[]
    storageLimitBytes: number
  }
  usage_percentage?: number
  current_period_end?: string
}

/**
 * Get user subscription information and determine feature access
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT subscription_tier, subscription_status FROM users WHERE id = ${userId}
    ` as any[];

    if (result.length === 0) {
      throw new Error('User not found')
    }

    const { subscription_tier, subscription_status } = result[0]
    // Default to FREE/LAUNCH if null
    const tier = (subscription_tier || TIERS.FREE) as SubscriptionTier
    const status = subscription_status || 'active'

    return {
      tier,
      status: status as SubscriptionInfo['status'],
      features: getFeaturesByTier(tier)
    }
  } catch (error) {
    logError('Error fetching user subscription:', error)
    // Return default free tier on error
    return {
      tier: TIERS.FREE,
      status: 'active',
      features: getFeaturesByTier(TIERS.FREE)
    }
  }
}

/**
 * Get features available for a specific subscription tier
 */
function getFeaturesByTier(tier: SubscriptionTier): SubscriptionInfo['features'] {
  const defaults = {
    maxAgents: 0,
    maxConversationsPerDay: 0,
    maxTeamMembers: 1,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    hasAPIAccess: false,
    hasCustomBranding: false,
    allowedAgents: [] as string[],
    storageLimitBytes: 0
  };

  // Safe fallback if tier is invalid
  if (!Object.values(TIERS).includes(tier)) {
    return { ...defaults, ...getFeaturesByTier(TIERS.FREE) };
  }

  const access = AGENT_ACCESS[tier];
  const storage = STORAGE_LIMITS[tier];
  const chatLimit = CHAT_LIMITS[tier];
  const flags = TIER_FEATURES[tier];

  return {
    maxAgents: access.length,
    maxConversationsPerDay: chatLimit,
    maxTeamMembers: tier === TIERS.DOMINATOR ? -1 : (tier === TIERS.ACCELERATOR ? 3 : 1),
    hasAdvancedAnalytics: tier !== TIERS.FREE,
    hasPrioritySupport: flags.prioritySupport,
    hasAPIAccess: tier === TIERS.DOMINATOR,
    hasCustomBranding: flags.customBranding,
    allowedAgents: access,
    storageLimitBytes: storage
  };
}

/**
 * Check if user has access to a specific CORE feature (War Room, Incinerator, etc.)
 */
export async function canAccessFeature(
  userId: string,
  featureName: keyof typeof TIER_FEATURES[typeof TIERS.FREE]
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const tierFeatures = TIER_FEATURES[subscription.tier];
  return tierFeatures[featureName] === true;
}

/**
 * Check if user has access to a specific AGENT
 */
export async function canAccessAgent(userId: string, agentId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  // Normalize agent ID
  const normalizedId = agentId.toLowerCase();
  return subscription.features.allowedAgents.includes(normalizedId);
}

/**
 * Check usage limits
 */
export async function checkUsageLimit(
  userId: string,
  limitType: 'agents' | 'conversations' | 'teamMembers' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await getUserSubscription(userId)
  const sql = getSql();

  let current = 0
  let limit = 0

  switch (limitType) {
    case 'agents':
      // Count distinct agents chatted with today
      const agentsResult = await sql`SELECT COUNT(DISTINCT agent_id) AS count FROM conversations 
         WHERE user_id = ${userId} AND created_at >= CURRENT_DATE`
      current = parseInt(agentsResult[0]?.count || '0')
      limit = subscription.features.maxAgents
      break
      
    case 'conversations':
      // Check conversations today
      const conversationResult = await sql`SELECT COUNT(*) as count FROM conversations 
         WHERE user_id = ${userId} AND created_at >= CURRENT_DATE`
      current = parseInt(conversationResult[0]?.count || '0')
      limit = subscription.features.maxConversationsPerDay
      break
      
    case 'teamMembers':
      const teamResult = await sql`SELECT COUNT(*) AS count FROM team_members WHERE user_id = ${userId}`
      current = parseInt(teamResult[0]?.count || '0')
      limit = subscription.features.maxTeamMembers
      break
      
    case 'storage':
      // This would require a real query against your storage table/bucket tracking
      // For now, we stub it or assume checking a 'storage_usage' column on users
      const userResult = await sql`SELECT storage_usage_bytes FROM users WHERE id = ${userId}`;
      current = parseInt(userResult[0]?.storage_usage_bytes || '0');
      limit = subscription.features.storageLimitBytes;
      break;
  }

  // Handle Unlimited (-1)
  const isUnlimited = limit === -1;
  const allowed = isUnlimited || current < limit;

  return {
    allowed,
    current,
    limit
  }
}

/**
 * Update user subscription status (webhook)
 */
export async function updateSubscriptionStatus(
  userId: string,
  tier: string,
  status: string
): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET subscription_tier = ${tier}, subscription_status = ${status}, updated_at = NOW() WHERE id = ${userId}`
}
