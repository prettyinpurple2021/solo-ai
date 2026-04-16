import 'server-only'

import webpush from 'web-push'

export interface VapidConfig {
  publicKey: string
  privateKey: string
  contactEmail: string
}

let cachedVapidFingerprint: string | null = null

function getDefaultVapidContactEmail(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (appUrl) {
    try {
      const hostname = new URL(appUrl).hostname
      if (hostname.length > 0) {
        return `admin@${hostname}`
      }
    } catch {
      // Fall through to generic default when URL is invalid
    }
  }

  return 'admin@example.com'
}

export function getVapidKeys(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    return null
  }

  const contactEmail = process.env.VAPID_CONTACT_EMAIL || getDefaultVapidContactEmail()

  return {
    publicKey,
    privateKey,
    contactEmail: contactEmail.startsWith('mailto:') ? contactEmail : `mailto:${contactEmail}`,
  }
}

export function ensureVapidConfigured(): boolean {
  const vapidConfig = getVapidKeys()
  if (!vapidConfig) {
    return false
  }

  const fingerprint = `${vapidConfig.contactEmail}:${vapidConfig.publicKey}:${vapidConfig.privateKey}`
  if (cachedVapidFingerprint === fingerprint) {
    return true
  }

  try {
    webpush.setVapidDetails(
      vapidConfig.contactEmail,
      vapidConfig.publicKey,
      vapidConfig.privateKey
    )
    cachedVapidFingerprint = fingerprint
    return true
  } catch {
    return false
  }
}
