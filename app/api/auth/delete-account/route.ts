import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'



export async function DELETE(request: NextRequest) {
  try {
    // verifyToken expects a NextRequest and returns Promise<string | null>
    const userId = await verifyToken(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user account from database
    const db = getDb()
    await db
      .delete(users)
      .where(eq(users.id, userId))

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    logError('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
