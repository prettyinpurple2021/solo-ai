
import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { logError } from '@/lib/logger'
import { learningModules } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const modules = await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.is_published, true))
      .orderBy(desc(learningModules.created_at))

    return NextResponse.json(modules)
  } catch (error) {
    logError('Error fetching learning modules:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
