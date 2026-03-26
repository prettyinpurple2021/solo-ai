import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { db } from '@/lib/database-client'
import { notifications } from '@/lib/shared/db/schema/users'
import { and, eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export async function POST(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Failed to mark all notifications as read', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
