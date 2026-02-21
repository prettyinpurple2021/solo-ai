import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { socialMediaConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

const PostSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  disconnect: z.boolean().optional()
})

function getOAuth2Client(clientId?: string, clientSecret?: string) {
  return new google.auth.OAuth2(
    clientId || '',
    clientSecret || '',
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/youtube/callback`
  )
}

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

      // For YouTube, we can generate OAuth URL with just clientId
      // Client secret is only needed for token exchange
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/social-media/youtube/callback`
      const scopes = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube'
      const state = userId
      
      // Generate OAuth URL manually (Google allows this)
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        state: state
      })
      
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      
      return NextResponse.json({ url })
    }

    if (action === 'status') {
      const connection = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'youtube'),
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
    logError('YouTube API Error:', error)
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
          eq(socialMediaConnections.platform, 'youtube')
        ))

      logInfo('YouTube disconnected', { userId })
      return NextResponse.json({ success: true })
    }

    if (code && clientId && clientSecret) {
      if (state && state !== userId) {
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
      }

      const oauth2Client = getOAuth2Client(clientId, clientSecret)
      const { tokens } = await oauth2Client.getToken(code)
      
      if (!tokens.access_token) {
        return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 400 })
      }

      // Get channel info
      oauth2Client.setCredentials(tokens)
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
      
      const channelResponse = await youtube.channels.list({
        part: ['snippet', 'id'],
        mine: true
      })

      let accountHandle = ''
      let accountName = ''
      let accountId = ''

      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
        const channel = channelResponse.data.items[0]
        accountId = channel.id || ''
        accountName = channel.snippet?.title || ''
        accountHandle = channel.snippet?.customUrl || channel.id || ''
      }

      const expiresAt = tokens.expiry_date 
        ? new Date(tokens.expiry_date) 
        : null

      // Store connection
      const existing = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.user_id, userId),
          eq(socialMediaConnections.platform, 'youtube')
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
            account_handle: accountHandle,
            account_name: accountName,
            scopes: tokens.scope || 'https://www.googleapis.com/auth/youtube.readonly',
            is_active: true,
            updated_at: new Date()
          })
          .where(eq(socialMediaConnections.id, existing[0].id))
      } else {
        await db.insert(socialMediaConnections).values({
          user_id: userId,
          platform: 'youtube',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt,
          account_id: accountId,
          account_handle: accountHandle,
          account_name: accountName,
          scopes: tokens.scope || 'https://www.googleapis.com/auth/youtube.readonly',
          is_active: true
        })
      }

      logInfo('YouTube connected successfully', { userId, accountHandle })
      return NextResponse.json({ 
        success: true,
        accountHandle,
        accountName
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    logError('YouTube OAuth Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

