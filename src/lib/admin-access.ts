const DEFAULT_ADMIN_EMAIL = 'prettyinpurple2021@gmail.com'

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

// Backward-compatible alias used by earlier modules.
export const isMasterAdminEmail = isAdminEmail

const TIER_RANK: Record<'free' | 'launch' | 'accelerator' | 'dominator', number> = {
  free: 0,
  launch: 1,
  accelerator: 2,
  dominator: 3,
}

export function getEffectiveSubscriptionTier(
  tier?: string | null,
  email?: string | null,
): 'free' | 'launch' | 'accelerator' | 'dominator' {
  if (isAdminEmail(email)) return 'dominator'

  const normalized = (tier || 'free').toLowerCase()
  if (
    normalized === 'free' ||
    normalized === 'launch' ||
    normalized === 'accelerator' ||
    normalized === 'dominator'
  ) {
    return normalized
  }

  return 'free'
}

export function hasTierAccess(
  effectiveTier: 'free' | 'launch' | 'accelerator' | 'dominator',
  requiredTier: 'accelerator' | 'dominator',
): boolean {
  return TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]
}

