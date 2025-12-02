import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/api-utils'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

// POST /api/tasks/bulk-update
// Body: { ids: string[], status?: string, priority?: string }
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      ids: z.array(z.union([z.string(), z.number()])).min(1),
      status: z.string().min(1).optional(),
      priority: z.string().min(1).optional(),
    }).refine((data) => !!(data.status || data.priority), {
      message: 'Nothing to update',
      path: ['status'],
    })

    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { ids, status, priority } = parsed.data

    const sql = getSql()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[] = []

    if (status && priority) {
      rows = await sql`
        UPDATE tasks 
        SET status = ${status}, priority = ${priority}, updated_at = NOW()
        WHERE user_id = ${user.id} AND id = ANY(${ids})
        RETURNING id, status, priority
      `
    } else if (status) {
      rows = await sql`
        UPDATE tasks 
        SET status = ${status}, updated_at = NOW()
        WHERE user_id = ${user.id} AND id = ANY(${ids})
        RETURNING id, status, priority
      `
    } else if (priority) {
      rows = await sql`
        UPDATE tasks 
        SET priority = ${priority}, updated_at = NOW()
        WHERE user_id = ${user.id} AND id = ANY(${ids})
        RETURNING id, status, priority
      `
    }

    return NextResponse.json({ updated: rows })
  } catch (error) {
    logError('Bulk update tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
