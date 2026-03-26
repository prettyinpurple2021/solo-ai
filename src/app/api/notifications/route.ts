import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { db } from '@/lib/database-client'
import { notifications } from '@/lib/shared/db/schema/users'
import { desc, eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    })

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        createdAt: row.createdAt,
        read: Boolean(row.isRead),
        type: row.type,
      })),
    )
  } catch (error) {
    logError('Failed to fetch notifications', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
