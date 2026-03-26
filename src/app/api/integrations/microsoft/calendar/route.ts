import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { calendarConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common'
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/microsoft/calendar/callback`

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
            if (!CLIENT_ID) {
                return NextResponse.json({ error: 'Microsoft Client ID not configured' }, { status: 500 })
            }

            const scopes = [
                'openid',
                'profile',
                'email',
                'Calendars.ReadWrite',
                'offline_access'
            ].join(' ')

            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                response_type: 'code',
                redirect_uri: REDIRECT_URI,
                response_mode: 'query',
                scope: scopes,
                state: String(userId),
                prompt: 'consent'
            })

            const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`
            return NextResponse.json({ url })
        }

        if (action === 'status') {
            const connection = await db
                .select()
                .from(calendarConnections)
                .where(and(
                    eq(calendarConnections.user_id, userId),
                    eq(calendarConnections.provider, 'outlook'),
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

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        logError('Microsoft Calendar API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
