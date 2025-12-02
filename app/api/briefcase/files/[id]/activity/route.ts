import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = id
    const sql = getSql()

    // Verify document ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    if (documentRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activity = await sql`
      SELECT 
        da.id,
        da.user_id,
        da.action,
        da.details,
        da.created_at,
        u.name as user_name,
        u.avatar_url
      FROM document_activity da
      LEFT JOIN users u ON da.user_id = u.id
      WHERE da.document_id = ${documentId}
      ORDER BY da.created_at DESC
      LIMIT 50
    ` as any[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(activity.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.user_name || 'Unknown User',
      userAvatar: item.avatar_url,
      action: item.action,
      timestamp: item.created_at,
      details: typeof item.details === 'string' ? JSON.parse(item.details) : (item.details || null)
    })))

  } catch (error) {
    logError('Get activity error:', error)
    return NextResponse.json({
      error: 'Failed to get activity'
    }, { status: 500 })
  }
}
