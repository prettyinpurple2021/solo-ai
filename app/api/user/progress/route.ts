import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { authenticateRequest } from '@/lib/auth-server'
import { logError } from '@/lib/logger'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const ProgressUpdateSchema = z.object({
  xp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  totalActions: z.number().int().nonnegative()
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = ProgressUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: result.error.extractErrors() },
        { status: 400 }
      )
    }

    const { xp, level, totalActions } = result.data
    const db = getDb()

    await db.update(users)
      .set({ 
        xp, 
        level, 
        total_actions: totalActions,
        updated_at: new Date()
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ success: true })

  } catch (error) {
    logError('Error updating user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
