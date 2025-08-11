import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

// POST /api/tasks/bulk-update
// Body: { ids: string[], status?: string, priority?: string }
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids, status, priority } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    if (!status && !priority) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const client = await createClient()
    const fields: string[] = []
    const values: any[] = []

    if (status) {
      fields.push(`status = $${values.length + 1}`)
      values.push(status)
    }
    if (priority) {
      fields.push(`priority = $${values.length + 1}`)
      values.push(priority)
    }
    values.push(user.id)
    const idsParamIndex = values.length + 1

    const query = `UPDATE tasks SET ${fields.join(', ')}, updated_at = NOW()
                   WHERE user_id = $${values.length} AND id = ANY($${idsParamIndex})
                   RETURNING id, status, priority` as string

    const { rows } = await client.query(query, [...values, ids])
    return NextResponse.json({ updated: rows })
  } catch (error) {
    console.error('Bulk update tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


