
export type SubscriptionTier = 'free' | 'launch' | 'accelerator' | 'dominator';

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  'free': 0,
  'launch': 1,
  'accelerator': 2,
  'dominator': 3,
};

/** Normalize billing/API/hook tier strings to a canonical SubscriptionTier (single ordering for all gates). */
export function normalizeSubscriptionTierLabel(
  input: string | undefined | null,
): SubscriptionTier {
  const p = (input || 'free').toLowerCase().trim();
  if (p === 'free') return 'free';
  if (p === 'launch' || p === 'launchpad') return 'launch';
  if (p === 'accelerator') return 'accelerator';
  if (p === 'dominator') return 'dominator';
  return 'free';
}

export const FEATURE_GATES = {
  // Routes
  '/dashboard/competitors': 'accelerator',
  '/dashboard/collaboration': 'dominator',
  '/dashboard/strategy-nexus': 'dominator',
  '/dashboard/compliance-grid': 'dominator',
  
  // Specific features (can be used in code)
  'competitor-stalker': 'accelerator',
  'multi-agent-collaboration': 'dominator',
  'custom-agent-builder': 'dominator',
  'rag-citations': 'accelerator',
} as const;

export function canAccess(userTier: string | undefined, featureOrPath: string): boolean {
  const tier = normalizeSubscriptionTierLabel(userTier);
  const requiredTier = (FEATURE_GATES as any)[featureOrPath] as SubscriptionTier | undefined;
  
  if (!requiredTier) return true; // No gate defined
  
  return TIER_HIERARCHY[tier] >= TIER_HIERARCHY[requiredTier];
}
