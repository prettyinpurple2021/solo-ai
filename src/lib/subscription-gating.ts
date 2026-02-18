
export type SubscriptionTier = 'launch' | 'accelerator' | 'dominator';

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  'launch': 0,
  'accelerator': 1,
  'dominator': 2,
};

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
  const tier = (userTier || 'launch') as SubscriptionTier;
  const requiredTier = (FEATURE_GATES as any)[featureOrPath] as SubscriptionTier | undefined;
  
  if (!requiredTier) return true; // No gate defined
  
  return TIER_HIERARCHY[tier] >= TIER_HIERARCHY[requiredTier];
}
