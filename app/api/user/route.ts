import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { authenticateRequest } from '@/lib/auth-server'
import { logError } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    const userRecords = await db.select().from(users).where(eq(users.id, user.id))
    
    if (userRecords.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userRecords[0]

    // Return specific fields needed by the frontend/storageService
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      xp: userData.xp,
      level: userData.level,
      totalActions: userData.total_actions,
      achievements: [] // Achievements are in a separate table, returning empty array for now or could join if needed
    })

  } catch (error) {
    logError('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
