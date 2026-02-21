import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { socialMediaConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Facebook OAuth endpoints
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth'
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token'

const PostSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  disconnect: z.boolean().optional()
})

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

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/facebook/callback`
      const state = userId
      const scopes = 'pages_read_engagement,pages_read_user_content,pages_show_list,read_insights'
      
      const authUrl = `${FACEBOOK_AUTH_URL}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}&response_type=code`
      
      return NextResponse.json({ url: authUrl })
    }

    if (action === 'status') {
      const connection = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'facebook'),
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
    logError('Facebook API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

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
          eq(socialMediaConnections.platform, 'facebook')
        ))

      logInfo('Facebook disconnected', { userId })
      return NextResponse.json({ success: true })
    }

    if (code && clientId && clientSecret) {
      if (state && state !== userId) {
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/facebook/callback`
      
      // Exchange code for tokens
      const tokenResponse = await fetch(
        `${FACEBOOK_TOKEN_URL}?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`,
        {
          method: 'GET'
        }
      )

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        logError('Facebook token exchange failed:', errorData)
        return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()

      // Get user info and pages
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokens.access_token}`
      )

      let accountHandle = ''
      let accountName = ''
      let accountId = ''
      let accountEmail = ''

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        accountId = userInfo.id || ''
        accountName = userInfo.name || ''
        accountEmail = userInfo.email || ''
        
        // Get pages user manages
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokens.access_token}`
        )
        
        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json()
          if (pagesData.data && pagesData.data.length > 0) {
            // Use first page (user can select which page later if needed)
            accountHandle = pagesData.data[0].id || accountId
          }
        }
      }

      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null

      // Store connection
      const existing = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'facebook')
        ))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(socialMediaConnections)
          .set({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || existing[0].refresh_token,
            expires_at: expiresAt,
            account_id: accountId,
            account_handle: accountHandle || accountId,
            account_email: accountEmail,
            account_name: accountName,
            scopes: 'pages_read_engagement,pages_read_user_content,pages_show_list,read_insights',
            is_active: true,
            updated_at: new Date()
          })
          .where(eq(socialMediaConnections.id, existing[0].id))
      } else {
        await db.insert(socialMediaConnections).values({
          user_id: userId,
          platform: 'facebook',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt,
          account_id: accountId,
          account_handle: accountHandle || accountId,
          account_email: accountEmail,
          account_name: accountName,
          scopes: 'pages_read_engagement,pages_read_user_content,pages_show_list,read_insights',
          is_active: true
        })
      }

      logInfo('Facebook connected successfully', { userId, accountHandle })
      return NextResponse.json({ 
        success: true,
        accountHandle: accountHandle || accountId,
        accountName
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    logError('Facebook OAuth Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

