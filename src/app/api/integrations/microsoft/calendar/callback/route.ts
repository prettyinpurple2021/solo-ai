import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { calendarConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common'
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/microsoft/calendar/callback`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // This is our userId

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=outlook_missing_code`)
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'openid profile email Calendars.ReadWrite offline_access'
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      logError('Microsoft token exchange failed', errorData)
      return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=outlook_token_failed`)
    }

    const tokens = await tokenResponse.json()
    
    // 2. Fetch user info from Microsoft Graph
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    let accountName = 'Outlook Account'
    let accountEmail = ''

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      accountName = userInfo.displayName || accountName
      accountEmail = userInfo.mail || userInfo.userPrincipalName || ''
    }

    // 3. Save connection to database
    const userId = state
    const existing = await db
      .select()
      .from(calendarConnections)
      .where(and(
        eq(calendarConnections.user_id, userId),
        eq(calendarConnections.provider, 'outlook')
      ))
      .limit(1)

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    const connectionData = {
      user_id: userId,
      provider: 'outlook',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      email: accountEmail,
      name: accountName,
      is_active: true,
      updated_at: new Date()
    }

    if (existing.length > 0) {
      await db
        .update(calendarConnections)
        .set(connectionData)
        .where(eq(calendarConnections.id, existing[0].id))
    } else {
      await db.insert(calendarConnections).values({
        ...connectionData,
        created_at: new Date()
      })
    }

    logInfo('Outlook connected successfully', { userId })
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?success=outlook_connected`)

  } catch (error) {
    logError('Microsoft callback error', error)
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=outlook_callback_exception`)
  }
}
