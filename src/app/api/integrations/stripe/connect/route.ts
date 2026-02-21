import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { paymentProviderConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Stripe Connect OAuth endpoints
const STRIPE_CONNECT_AUTH_URL = 'https://connect.stripe.com/oauth/authorize'
const STRIPE_CONNECT_TOKEN_URL = 'https://connect.stripe.com/oauth/token'

const PostSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  disconnect: z.boolean().optional()
})

/**
 * GET: Get OAuth URL or connection status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'auth_url') {
      // Stripe Connect requires your platform's Stripe account Client ID
      // Users will connect their Stripe accounts to your platform
      const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
      
      if (!clientId) {
        return NextResponse.json({ 
          error: 'Stripe Connect not configured',
          message: 'STRIPE_CONNECT_CLIENT_ID environment variable is required. See docs/user-guides/STRIPE_CONNECT_SETUP.md for setup instructions.'
        }, { status: 400 })
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/stripe/connect/callback`
      const state = userId.toString() // Pass user ID in state for security
      const scopes = 'read_write' // Full access to user's Stripe account
      
      const authUrl = `${STRIPE_CONNECT_AUTH_URL}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}`
      
      return NextResponse.json({ url: authUrl })
    }

    if (action === 'status') {
      const connection = await db
        .select()
        .from(paymentProviderConnections)
        .where(and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.provider, 'stripe'),
          eq(paymentProviderConnections.is_active, true)
        ))
        .limit(1)

      if (connection.length === 0) {
        return NextResponse.json({ connected: false })
      }

      const conn = connection[0]
      return NextResponse.json({
        connected: true,
        accountId: conn.account_id,
        accountName: conn.account_name,
        accountEmail: conn.account_email,
        lastSyncedAt: conn.last_synced_at
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logError('Stripe Connect API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST: Handle OAuth callback or disconnect
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const body = await request.json()
    const validation = PostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.errors }, { status: 400 })
    }

    const { code, state, disconnect } = validation.data

    if (disconnect) {
      await db
        .update(paymentProviderConnections)
        .set({
          is_active: false,
          updated_at: new Date()
        })
        .where(and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.provider, 'stripe')
        ))

      logInfo('Stripe disconnected', { userId })
      return NextResponse.json({ success: true })
    }

    if (code) {
      if (state && state !== userId) {
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
      }

      const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
      const clientSecret = process.env.STRIPE_SECRET_KEY // Use platform's secret key

      if (!clientId || !clientSecret) {
        return NextResponse.json({ 
          error: 'Stripe Connect not configured',
          message: 'STRIPE_CONNECT_CLIENT_ID and STRIPE_SECRET_KEY are required'
        }, { status: 400 })
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/stripe/connect/callback`
      
      // Exchange code for Stripe Connect access token
      // Stripe OAuth requires: grant_type, code, client_id, and client_secret
      const tokenResponse = await fetch(STRIPE_CONNECT_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        logError('Stripe Connect token exchange failed:', errorData)
        return NextResponse.json({ error: 'Failed to connect Stripe account' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()

      // Get connected account info using the access token
      const accountResponse = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      let accountId = ''
      let accountEmail = ''
      let accountName = ''

      if (accountResponse.ok) {
        const accountData = await accountResponse.json()
        accountId = accountData.id || ''
        accountEmail = accountData.email || ''
        accountName = accountData.business_profile?.name || accountData.settings?.dashboard?.display_name || ''
      }

      // Calculate expiry (Stripe Connect tokens typically don't expire, but store it anyway)
      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null

      // Store connection
      const existing = await db
        .select()
        .from(paymentProviderConnections)
        .where(and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.provider, 'stripe')
        ))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(paymentProviderConnections)
          .set({
            account_id: accountId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || existing[0].refresh_token,
            expires_at: expiresAt,
            account_email: accountEmail,
            account_name: accountName,
            is_active: true,
            updated_at: new Date()
          })
          .where(eq(paymentProviderConnections.id, existing[0].id))
      } else {
        await db.insert(paymentProviderConnections).values({
          user_id: userId,
          provider: 'stripe',
          account_id: accountId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt,
          account_email: accountEmail,
          account_name: accountName,
          is_active: true
        })
      }

      logInfo('Stripe connected successfully', { userId, accountId })
      return NextResponse.json({ 
        success: true,
        accountId,
        accountName
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    logError('Stripe Connect OAuth Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

