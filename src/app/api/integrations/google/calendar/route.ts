import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { calendarConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_APP_URL + '/api/integrations/google/calendar/callback'
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
            const oauth2Client = getOAuth2Client()
            const url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [
                    'https://www.googleapis.com/auth/calendar.readonly',
                    'https://www.googleapis.com/auth/calendar.events'
                ],
                prompt: 'consent', // Force consent to get refresh token
                state: String(userId) // Pass user ID in state for security
            })
            return NextResponse.json({ url })
        }

        if (action === 'status') {
            // Check if user has connected calendar
            const connection = await db
                .select()
                .from(calendarConnections)
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'google'),
                    eq(calendarConnections.is_active, true)
                ))
                .limit(1)

            if (connection.length === 0) {
                return NextResponse.json({ connected: false })
            }

            const conn = connection[0]
            return NextResponse.json({
                connected: true,
                email: conn.email,
                name: conn.name,
                last_synced_at: conn.last_synced_at
            })
        }


        if (action === 'events') {
            // Retrieve stored token for user
            const connection = await db
                .select()
                .from(calendarConnections)
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'google'),
                    eq(calendarConnections.is_active, true)
                ))
                .limit(1)

            if (connection.length === 0) {
                return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
            }

            const conn = connection[0]
            const oauth2Client = getOAuth2Client()

            // Check if token needs refresh
            let accessToken = conn.access_token
            if (conn.refresh_token && conn.expires_at && new Date(conn.expires_at) < new Date()) {
                oauth2Client.setCredentials({
                    refresh_token: conn.refresh_token
                })

                try {
                    const { credentials } = await oauth2Client.refreshAccessToken()
                    accessToken = credentials.access_token || conn.access_token

                    // Update stored token
                    await db
                        .update(calendarConnections)
                        .set({
                            access_token: credentials.access_token || conn.access_token,
                            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : conn.expires_at,
                            updated_at: new Date()
                        })
                        .where(eq(calendarConnections.id, conn.id))
                } catch (refreshError) {
                    logError('Failed to refresh Google Calendar token:', refreshError)
                    return NextResponse.json({ error: 'Token refresh failed. Please reconnect.' }, { status: 401 })
                }
            }

            // Set credentials and fetch events
            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: conn.refresh_token
            })

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            const timeMin = searchParams.get('timeMin') || new Date().toISOString()
            const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            const maxResults = parseInt(searchParams.get('maxResults') || '50')

            // List calendars
            const calendarsList = await calendar.calendarList.list()
            const calendars = calendarsList.data.items || []

            // Fetch events from primary calendar and other active calendars
            const eventsPromises = calendars
                .filter(cal => cal.primary || cal.selected)
                .slice(0, 5) // Limit to 5 calendars
                .map(async (cal) => {
                    try {
                        const eventsResponse = await calendar.events.list({
                            calendarId: cal.id || 'primary',
                            timeMin,
                            timeMax,
                            maxResults,
                            singleEvents: true,
                            orderBy: 'startTime'
                        })
                        return {
                            calendarId: cal.id,
                            calendarName: cal.summary || cal.id || 'Calendar',
                            events: eventsResponse.data.items || []
                        }
                    } catch (error) {
                        logError(`Failed to fetch events from calendar ${cal.id}:`, error)
                        return { calendarId: cal.id, calendarName: cal.summary || cal.id || 'Calendar', events: [] }
                    }
                })

            const calendarsData = await Promise.all(eventsPromises)

            // Transform events to our format
            const allEvents = calendarsData.flatMap(calData =>
                calData.events.map(event => ({
                    id: event.id,
                    title: event.summary || 'No Title',
                    description: event.description || '',
                    startTime: event.start?.dateTime || event.start?.date || '',
                    endTime: event.end?.dateTime || event.end?.date || '',
                    calendarId: calData.calendarId || 'primary',
                    calendarName: calData.calendarName,
                    isRecurring: !!event.recurringEventId,
                    attendees: event.attendees?.map(a => a.email || '').filter(Boolean) || [],
                    location: event.location || '',
                    htmlLink: event.htmlLink || ''
                }))
            )

            // Update last synced timestamp
            await db
                .update(calendarConnections)
                .set({
                    last_synced_at: new Date(),
                    updated_at: new Date()
                })
                .where(eq(calendarConnections.id, conn.id))

            logInfo('Calendar events fetched successfully', { userId, eventCount: allEvents.length })

            return NextResponse.json({
                events: allEvents,
                calendars: calendars.map(cal => ({
                    id: cal.id,
                    name: cal.summary || cal.id || 'Calendar',
                    primary: cal.primary || false
                }))
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        logError('Google Calendar API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

const PostSchema = z.object({
    action: z.string().optional(),
    code: z.string().optional(),
    state: z.string().optional(),
    disconnect: z.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    calendarId: z.string().optional()
}).superRefine((data, ctx) => {
    // Provide specific field-level errors for create_event action
    if (data.action === 'create_event') {
        if (!data.title || (typeof data.title === 'string' && data.title.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Title is required when action is "create_event"',
                path: ['title']
            })
        }
        if (!data.startTime || (typeof data.startTime === 'string' && data.startTime.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'startTime is required when action is "create_event"',
                path: ['startTime']
            })
        }
        if (!data.endTime || (typeof data.endTime === 'string' && data.endTime.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'endTime is required when action is "create_event"',
                path: ['endTime']
            })
        }
    }
})

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
            // Check if validation failed due to missing required fields for create_event
            const hasCreateEventErrors = validation.error.errors.some(
                err => err.path[0] === 'title' || err.path[0] === 'startTime' || err.path[0] === 'endTime'
            )
            
            if (hasCreateEventErrors) {
                return NextResponse.json({ 
                    error: 'Missing required fields for event creation',
                    details: validation.error.errors,
                    message: 'The following fields are required when action is "create_event": title, startTime, endTime'
                }, { status: 400 })
            }
            
            return NextResponse.json({ 
                error: 'Invalid request', 
                details: validation.error.errors 
            }, { status: 400 })
        }

        const { action, code, state, disconnect, title, description, startTime, endTime, calendarId } = validation.data

        // Handle event creation
        // Note: Required fields are already validated by Zod schema, so if we reach here, all required fields are present
        if (action === 'create_event') {

            // Get calendar connection
            const connection = await db
                .select()
                .from(calendarConnections)
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'google'),
                    eq(calendarConnections.is_active, true)
                ))
                .limit(1)

            if (connection.length === 0) {
                return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
            }

            const conn = connection[0]
            const oauth2Client = getOAuth2Client()

            // Check if token needs refresh
            let accessToken = conn.access_token
            if (conn.refresh_token && conn.expires_at && new Date(conn.expires_at) < new Date()) {
                oauth2Client.setCredentials({
                    refresh_token: conn.refresh_token
                })

                try {
                    const { credentials } = await oauth2Client.refreshAccessToken()
                    accessToken = credentials.access_token || conn.access_token

                    // Update stored token
                    await db
                        .update(calendarConnections)
                        .set({
                            access_token: credentials.access_token || conn.access_token,
                            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : conn.expires_at,
                            updated_at: new Date()
                        })
                        .where(eq(calendarConnections.id, conn.id))
                } catch (refreshError) {
                    logError('Failed to refresh Google Calendar token:', refreshError)
                    return NextResponse.json({ error: 'Token refresh failed. Please reconnect.' }, { status: 401 })
                }
            }

            // Set credentials and create event
            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: conn.refresh_token
            })

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            const targetCalendarId = calendarId || 'primary'

            const event = {
                summary: title,
                description: description || '',
                start: {
                    dateTime: new Date(startTime!).toISOString(),
                    timeZone: 'UTC'
                },
                end: {
                    dateTime: new Date(endTime!).toISOString(),
                    timeZone: 'UTC'
                }
            }

            try {
                const createdEvent = await calendar.events.insert({
                    calendarId: targetCalendarId,
                    requestBody: event
                })

                logInfo('Calendar event created successfully', { 
                    userId, 
                    eventId: createdEvent.data.id,
                    title,
                    calendarId: targetCalendarId
                })

                return NextResponse.json({
                    success: true,
                    id: createdEvent.data.id,
                    htmlLink: createdEvent.data.htmlLink,
                    title: createdEvent.data.summary
                })
            } catch (error) {
                logError('Failed to create calendar event:', error)
                return NextResponse.json({ 
                    error: 'Failed to create calendar event',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 })
            }
        }

        if (disconnect) {
            // Disconnect calendar
            await db
                .update(calendarConnections)
                .set({
                    is_active: false,
                    updated_at: new Date()
                })
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'google')
                ))

            logInfo('Google Calendar disconnected', { userId })
            return NextResponse.json({ success: true, message: 'Calendar disconnected' })
        }

        if (code) {
            // Verify state matches user ID for security
            if (state && state !== String(userId)) {
                return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
            }

            const oauth2Client = getOAuth2Client()
            
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code)
            
            if (!tokens.access_token) {
                return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 400 })
            }

            // Get user info from Google
            oauth2Client.setCredentials(tokens)
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
            const userInfo = await oauth2.userinfo.get()

            // Calculate token expiry
            const expiresAt = tokens.expiry_date 
                ? new Date(tokens.expiry_date) 
                : new Date(Date.now() + 3600 * 1000) // Default 1 hour

            // Check if connection already exists
            const existing = await db
                .select()
                .from(calendarConnections)
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'google')
                ))
                .limit(1)

            if (existing.length > 0) {
                // Update existing connection
                await db
                    .update(calendarConnections)
                    .set({
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token || existing[0].refresh_token,
                        expires_at: expiresAt,
                        email: userInfo.data.email || existing[0].email,
                        name: userInfo.data.name || existing[0].name,
                        is_active: true,
                        last_synced_at: new Date(),
                        updated_at: new Date()
                    })
                    .where(eq(calendarConnections.id, existing[0].id))
            } else {
                // Create new connection
                await db.insert(calendarConnections).values({
                    user_id: userId,
                    provider: 'google',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token || null,
                    expires_at: expiresAt,
                    email: userInfo.data.email || null,
                    name: userInfo.data.name || null,
                    is_active: true,
                    last_synced_at: new Date()
                })
            }

            logInfo('Google Calendar connected successfully', { userId, email: userInfo.data.email })
            return NextResponse.json({ 
                success: true,
                email: userInfo.data.email,
                name: userInfo.data.name
            })
        }

        // If action was specified but not handled, return specific error
        if (action && action !== 'create_event') {
            return NextResponse.json({ error: `Invalid action: ${action}. Supported actions: 'create_event'` }, { status: 400 })
        }

        // If no valid action or code provided, return helpful error
        if (!code && !disconnect) {
            return NextResponse.json({ 
                error: 'Missing required parameter',
                details: 'Either provide "code" (for OAuth callback), "disconnect" (boolean), or "action" with required fields (e.g., action: "create_event" with title, startTime, endTime)'
            }, { status: 400 })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    } catch (error) {
        logError('Google Calendar Auth Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
