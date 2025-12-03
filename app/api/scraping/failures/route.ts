import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { db } from '@/db'
import { scrapingJobResults } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admins = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com').split(',').map(e => e.trim()).filter(Boolean)
    if (!admins.includes(user.email)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50)

    const rows = await db
      .select()
      .from(scrapingJobResults)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq(scrapingJobResults.success, false as any))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .orderBy(scrapingJobResults.completed_at as any)
      .limit(limit)

    const data = rows
      .reverse()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        jobId: r.job_id,
        error: r.error,
        completedAt: r.completed_at,
        executionTime: r.execution_time,
        retryCount: r.retry_count
      }))

    return NextResponse.json({ items: data })
  } catch {
    return NextResponse.json({ error: 'Failed to load scraping failures' }, { status: 500 })
  }
}


