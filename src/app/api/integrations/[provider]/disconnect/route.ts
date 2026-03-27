import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { db } from '@/db'
import { calendarConnections } from '@/shared/db/schema'
import { and, eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params
    const authResult = await verifyAuth()
    if (!authResult.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authResult.user.id

    if (provider !== 'google') {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    await db
      .update(calendarConnections)
      .set({ is_active: false, updated_at: new Date() })
      .where(
        and(
          eq(calendarConnections.user_id, userId),
          eq(calendarConnections.provider, 'google'),
        ),
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Integration disconnect failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

