import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { db } from '@/db'
import { calendarConnections } from '@/shared/db/schema'
import { and, eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const googleConnection = await db
      .select({ id: calendarConnections.id })
      .from(calendarConnections)
      .where(
        and(
          eq(calendarConnections.user_id, userId),
          eq(calendarConnections.provider, 'google'),
          eq(calendarConnections.is_active, true),
        ),
      )
      .limit(1)

    const connectedProviders: string[] = []
    if (googleConnection.length > 0) connectedProviders.push('google')

    // Slack integration endpoints are not implemented yet.
    // Keep response contract stable for the IntegrationHub UI.
    return NextResponse.json({ connectedProviders })
  } catch (error) {
    logError('Integrations status fetch failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

