export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

// WARNING: Admin status is derived solely from the email allowlist configured
// via the ADMIN_EMAILS environment variable. Email is a mutable identifier and
// MUST NOT be the sole gate for security-sensitive operations. For authorization
// decisions that affect billing, data access, or privileged actions, pair this
// check with an immutable server-side attribute (e.g., a user-id allowlist or
// a role flag stored in the database). This function returns false when
// ADMIN_EMAILS is not set, failing closed by default.
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

// DEPRECATED: This alias exists only for backward compatibility. Do not use it
// (or `isAdminEmail`) for authorization or access-control decisions.
// Prefer a role/permission model keyed by an immutable user identifier.
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
  const enableAdminBypass = process.env.ENABLE_ADMIN_BYPASS === 'true'
  if (enableAdminBypass && isAdminEmail(email)) return 'dominator'

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

