import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { db } from '@/lib/database-client'
import { notifications } from '@/lib/shared/db/schema/users'
import { and, eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
    }

    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)))
      .returning({ id: notifications.id })

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Failed to mark notification as read', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
