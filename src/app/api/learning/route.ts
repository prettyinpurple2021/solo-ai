import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { learningPaths, userLearningProgress } from '@/shared/db/schema/content'
import { eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch learning paths
    const paths = await db.query.learningPaths.findMany({
      where: eq(learningPaths.is_public, true),
      with: {
        modules: {
          orderBy: (modules, { asc }) => [asc(modules.order)]
        }
      }
    })

    // Fetch user progress
    const progress = await db.query.userLearningProgress.findMany({
      where: eq(userLearningProgress.user_id, userId)
    })

    return NextResponse.json({ paths, progress })
  } catch (error) {
    logError(
      'Error in GET /api/learning',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

