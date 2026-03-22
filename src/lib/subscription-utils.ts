import { logError } from "@/lib/logger"
import { canonicalAgentId } from "@/lib/agent-id-normalize"
import { db } from "@/db/index"
import { users, chatConversations, documents } from "@/shared/db/schema"
import { eq, and, gte, sql, count, sum } from "drizzle-orm"

// --- CONSTANTS ---

export const TIERS = {
  FREE: 'free',
  LAUNCH: 'launch',
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
  FINN: 'finn',
} as const;

// 1. Agent Access Rules
export const AGENT_ACCESS: Record<SubscriptionTier, string[]> = {
  [TIERS.FREE]: [AGENTS.AURA],
  [TIERS.LAUNCH]: [AGENTS.AURA],
  [TIERS.ACCELERATOR]: [AGENTS.AURA, AGENTS.BLAZE, AGENTS.GLITCH, AGENTS.VEX, AGENTS.FINN],
  [TIERS.DOMINATOR]: Object.values(AGENTS),
};

// 2. Storage Limits (in Bytes)
const MB = 1024 * 1024;
const GB = 1024 * MB;

export const STORAGE_LIMITS: Record<SubscriptionTier, number> = {
  [TIERS.FREE]: 50 * MB,
  [TIERS.LAUNCH]: 50 * MB,
  [TIERS.ACCELERATOR]: 1 * GB,
  [TIERS.DOMINATOR]: 100 * GB,
};

// 3. Chat Limits (Messages per Day)
// -1 means Unlimited
export const CHAT_LIMITS: Record<SubscriptionTier, number> = {
  [TIERS.FREE]: 10,
  [TIERS.LAUNCH]: 10,
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
  [TIERS.LAUNCH]: {
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
    const [user] = await db.select({
      tier: users.subscription_tier,
      status: users.subscription_status
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (!user) {
      throw new Error('User not found')
    }

    const tier = (user.tier || TIERS.FREE) as SubscriptionTier
    const status = user.status || 'active'

    return {
      tier,
      status: status as SubscriptionInfo['status'],
      features: getFeaturesByTier(tier)
    }
  } catch (error) {
    logError('Error fetching user subscription:', error)
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
 * Check if user has access to a specific CORE feature
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
  const id = canonicalAgentId(agentId);
  return subscription.features.allowedAgents.includes(id);
}

/**
 * Check usage limits
 */
export async function checkUsageLimit(
  userId: string,
  limitType: 'agents' | 'conversations' | 'teamMembers' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await getUserSubscription(userId)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0
  let limit = 0

  switch (limitType) {
    case 'agents': {
      const [result] = await db.select({ value: count(sql`DISTINCT ${chatConversations.agent_id}`) })
        .from(chatConversations)
        .where(and(
          eq(chatConversations.user_id, userId),
          gte(chatConversations.created_at, today)
        ));
      current = result.value;
      limit = subscription.features.maxAgents;
      break;
    }
      
    case 'conversations': {
      const [result] = await db.select({ value: count() })
        .from(chatConversations)
        .where(and(
          eq(chatConversations.user_id, userId),
          gte(chatConversations.created_at, today)
        ));
      current = result.value;
      limit = subscription.features.maxConversationsPerDay;
      break;
    }
      
    case 'teamMembers': {
      // SoloSuccess AI is currently optimized for solo founders (1 member).
      // Enterprise/Team features are reserved for future infrastructure updates.
      current = 1;
      limit = subscription.features.maxTeamMembers;
      break;
    }
      
    case 'storage': {
      const [result] = await db.select({ value: sum(documents.size) })
        .from(documents)
        .where(eq(documents.user_id, userId));
      current = Number(result.value || 0);
      limit = subscription.features.storageLimitBytes;
      break;
    }
  }

  const isUnlimited = limit === -1;
  const allowed = isUnlimited || current < limit;

  return {
    allowed,
    current,
    limit
  }
}

/**
 * Update user subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  tier: string,
  status: string
): Promise<void> {
  await db.update(users)
    .set({
      subscription_tier: tier,
      subscription_status: status,
      updated_at: new Date()
    })
    .where(eq(users.id, userId));
}
