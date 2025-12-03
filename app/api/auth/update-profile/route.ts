import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'



export async function POST(request: NextRequest) {
  try {
    // verifyToken expects a NextRequest and returns Promise<string | null>
    const userId = await verifyToken(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Update user profile in database
    const db = getDb()
    await db
      .update(users)
      .set({
        full_name: name.trim(),
        updated_at: new Date()
      })
      .where(eq(users.id, userId))

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    logError('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
