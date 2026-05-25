/**
 * @deprecated Resend removed — use `@/lib/mail-transport` (Zoho Mail SMTP).
 * Kept so older imports of FROM_EMAIL keep working during migration.
 */
export { getDefaultFromAddress as FROM_EMAIL, sendTransactionalEmail } from '@/lib/mail-transport'
