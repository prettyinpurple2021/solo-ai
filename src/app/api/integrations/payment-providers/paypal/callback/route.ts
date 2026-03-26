import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { paymentProviderConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const TOKEN_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com/v1/oauth2/token'
  : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'

const USER_INFO_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com/v1/identity/openidconnect/userinfo'
  : 'https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // This is our userId

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=paypal_missing_code`)
  }

  try {
    // 1. Exchange code for access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${APP_URL}/api/integrations/payment-providers/paypal/callback`
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      logError('PayPal token exchange failed', errorData)
      return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=paypal_token_failed`)
    }

    const tokens = await tokenResponse.json()
    
    // 2. Fetch user info to get PayPal account details
    const userInfoResponse = await fetch(`${USER_INFO_URL}?schema=openid`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    let accountName = 'PayPal Account'
    let accountEmail = ''
    let accountId = ''

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      accountName = userInfo.name || accountName
      accountEmail = userInfo.email || ''
      accountId = userInfo.payer_id || userInfo.sub || ''
    }

    // 3. Save connection to database
    const userId = state
    const existing = await db
      .select()
      .from(paymentProviderConnections)
      .where(and(
        eq(paymentProviderConnections.user_id, userId),
        eq(paymentProviderConnections.provider, 'paypal')
      ))
      .limit(1)

    const expiresInSeconds = Number(tokens?.expires_in)
    const expiresAt =
      Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
        ? new Date(Date.now() + expiresInSeconds * 1000)
        : null

    const connectionData = {
      user_id: userId,
      provider: 'paypal',
      account_id: accountId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      account_email: accountEmail,
      account_name: accountName,
      is_active: true,
      updated_at: new Date()
    }

    if (existing.length > 0) {
      await db
        .update(paymentProviderConnections)
        .set(connectionData)
        .where(eq(paymentProviderConnections.id, existing[0].id))
    } else {
      await db.insert(paymentProviderConnections).values({
        ...connectionData,
        created_at: new Date()
      })
    }

    logInfo('PayPal connected successfully', { userId })
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?success=paypal_connected`)

  } catch (error) {
    logError('PayPal callback error', error)
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=paypal_callback_exception`)
  }
}
