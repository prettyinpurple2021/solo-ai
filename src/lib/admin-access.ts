import type { SubscriptionTier } from '@/lib/subscription-gating'
import { normalizeSubscriptionTierLabel, TIER_HIERARCHY } from '@/lib/subscription-gating'

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Returns the immutable user-ID allowlist from the ADMIN_USER_IDS env var.
 * User IDs are immutable across email/name changes, making this the preferred
 * identifier for privileged internal operations. Returns an empty list when
 * ADMIN_USER_IDS is not set, failing closed by default.
 */
export function getAdminUserIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS || ''
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

/**
 * Returns true when the supplied user ID appears in the ADMIN_USER_IDS allowlist.
 * Prefer this over isAdminEmail() for authorization decisions because user IDs
 * are immutable and cannot be assumed by changing an account's email address.
 */
export function isAdminUserId(id?: string | null): boolean {
  if (!id) return false
  return getAdminUserIds().includes(id.trim())
}

// SCOPE: Safe only within the ENABLE_ADMIN_BYPASS internal-ops path (subscription
// tier elevation, usage-limit overrides, /dev tooling access). Email is a mutable
// identifier — when an immutable ID is available, prefer isAdminUserId() or the
// combined isAdminIdentity() check instead. Returns false when ADMIN_EMAILS is
// unset, failing closed by default.
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

// DEPRECATED: This alias exists only for backward compatibility. Do not use it
// (or `isAdminEmail`) for authorization or access-control decisions.
// Prefer a role/permission model keyed by an immutable user identifier.
export const isMasterAdminEmail = isAdminEmail

/**
 * Two-factor admin identity check.
 *
 * When ADMIN_USER_IDS is configured, the caller must match both the user-ID
 * allowlist (immutable) and the email allowlist (mutable). This prevents
 * privilege escalation via email reassignment.
 *
 * When ADMIN_USER_IDS is not configured, falls back to email-only so existing
 * deployments that only set ADMIN_EMAILS continue to work.
 *
 * Use this function everywhere ENABLE_ADMIN_BYPASS logic is applied instead of
 * calling isAdminEmail() directly.
 */
export function isAdminIdentity(email?: string | null, userId?: string | null): boolean {
  const adminUserIds = getAdminUserIds()
  if (adminUserIds.length > 0) {
    return isAdminUserId(userId) && isAdminEmail(email)
  }
  return isAdminEmail(email)
}

export function getEffectiveSubscriptionTier(
  tier?: string | null,
  email?: string | null,
  userId?: string | null,
): SubscriptionTier {
  const enableAdminBypass = process.env.ENABLE_ADMIN_BYPASS === 'true'
  if (enableAdminBypass && isAdminIdentity(email, userId)) return 'dominator'

  return normalizeSubscriptionTierLabel(tier)
}

export function hasTierAccess(
  effectiveTier: SubscriptionTier,
  requiredTier: 'accelerator' | 'dominator',
): boolean {
  return TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY[requiredTier]
}
