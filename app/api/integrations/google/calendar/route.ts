import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getToken } from 'next-auth/jwt'
import { logError, logInfo } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_APP_URL + '/api/integrations/google/calendar/callback'
)

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request })
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // In a real implementation, we would store the refresh token in the database
        // associated with the user. For now, we'll check if we have an access token
        // passed via query param or header (simplified for this step)

        // Check for action type
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'auth_url') {
            const url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
            })
            return NextResponse.json({ url })
        }

        if (action === 'events') {
            // This part requires a stored access token. 
            // Since we are migrating from mock, we'll return a specific error 
            // if no token is available, prompting the frontend to start the auth flow.

            // TODO: Retrieve stored token for user
            // const userToken = await db.query.calendarConnections.findFirst(...)

            // For now, return a "not connected" status if we can't find a token
            // This forces the UI to show the "Connect" button which will use 'auth_url'
            return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        logError('Google Calendar API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request })
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { code } = body

        if (code) {
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code)
            oauth2Client.setCredentials(tokens)

            // TODO: Save tokens to database for this user
            // await db.insert(calendarConnections).values({ ... })

            logInfo(`Google Calendar connected for user ${token.sub}`)
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    } catch (error) {
        logError('Google Calendar Auth Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
