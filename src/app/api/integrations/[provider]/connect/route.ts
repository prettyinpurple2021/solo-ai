import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { google } from 'googleapis'
import { logError } from '@/lib/logger'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getProviderAuthUrl(provider: string, userId: string): string | null {
  switch (provider) {
    case 'google': {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        `${APP_URL}/api/integrations/google/calendar/callback`,
      )

      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events',
        ],
        prompt: 'consent',
        state: userId,
      })
    }
    default:
      return null
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params
    const authResult = await verifyAuth()
    if (!authResult.user?.id) {
      return NextResponse.redirect(`${APP_URL}/login`)
    }
    const authUrl = getProviderAuthUrl(provider, authResult.user.id)

    if (!authUrl) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/integrations?error=unsupported_provider&provider=${encodeURIComponent(provider)}`,
      )
    }

    return NextResponse.redirect(authUrl)
  } catch (error) {
    logError('Integration connect redirect failed', error)
    const safeProvider = 'unknown'
    return NextResponse.redirect(
      `${APP_URL}/dashboard/integrations?error=connect_exception&provider=${safeProvider}`,
    )
  }
}

