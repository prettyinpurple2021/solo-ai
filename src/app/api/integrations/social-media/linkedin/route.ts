import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { socialMediaConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// LinkedIn OAuth endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'

const PostSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
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
      const clientId = searchParams.get('clientId')
      if (!clientId) {
        return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
      }

      // Generate OAuth URL
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/linkedin/callback`
      const state = userId // Pass user ID in state for security
      const scopes = 'openid profile email w_member_social r_organization_social'
      
      const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}`
      
      return NextResponse.json({ url: authUrl })
    }

    if (action === 'status') {
      const connection = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'linkedin'),
          eq(socialMediaConnections.is_active, true)
        ))
        .limit(1)

      if (connection.length === 0) {
        return NextResponse.json({ connected: false })
      }

      const conn = connection[0]
      return NextResponse.json({
        connected: true,
        accountHandle: conn.account_handle,
        accountName: conn.account_name,
        lastSyncedAt: conn.last_synced_at
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logError('LinkedIn API Error:', error)
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

    const { code, state, clientId, clientSecret, disconnect } = validation.data

    if (disconnect) {
      await db
        .update(socialMediaConnections)
        .set({
          is_active: false,
          updated_at: new Date()
        })
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'linkedin')
        ))

      logInfo('LinkedIn disconnected', { userId })
      return NextResponse.json({ success: true })
    }

    if (code && clientId && clientSecret) {
      if (state && state !== userId) {
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
      }

      // Exchange code for tokens
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/linkedin/callback`
      
      const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        logError('LinkedIn token exchange failed:', errorData)
        return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()

      // Get user info
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      let accountHandle = ''
      let accountName = ''
      let accountEmail = ''

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        accountHandle = userInfo.sub || ''
        accountName = userInfo.name || ''
        accountEmail = userInfo.email || ''
      }

      // Calculate expiry
      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null

      // Store connection
      const existing = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'linkedin')
        ))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(socialMediaConnections)
          .set({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || existing[0].refresh_token,
            expires_at: expiresAt,
            account_id: accountHandle,
            account_handle: accountHandle,
            account_email: accountEmail,
            account_name: accountName,
            scopes: tokens.scope || '',
            is_active: true,
            updated_at: new Date()
          })
          .where(eq(socialMediaConnections.id, existing[0].id))
      } else {
        await db.insert(socialMediaConnections).values({
          user_id: userId,
          platform: 'linkedin',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt,
          account_id: accountHandle,
          account_handle: accountHandle,
          account_email: accountEmail,
          account_name: accountName,
          scopes: tokens.scope || '',
          is_active: true
        })
      }

      logInfo('LinkedIn connected successfully', { userId, accountHandle })
      return NextResponse.json({ 
        success: true,
        accountHandle,
        accountName
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    logError('LinkedIn OAuth Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

