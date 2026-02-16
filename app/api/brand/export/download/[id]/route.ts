import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { documents } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'

export const runtime = 'edge'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const db = getDb()
    const id = params.id

    const rows = await db
      .select({
        id: documents.id,
        original_name: documents.original_name,
        mime_type: documents.mime_type,
        size: documents.size,
        file_url: documents.file_url
      })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.user_id, user.id)))
      .limit(1)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }

    const doc = rows[0]
    if (!doc.file_url) {
      return NextResponse.json({ error: 'Export file not available' }, { status: 404 })
    }

    const res = await fetch(doc.file_url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Stored export not accessible' }, { status: 404 })
    }
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': doc.mime_type,
        'Content-Disposition': `attachment; filename="${doc.original_name}"`,
        'Content-Length': doc.size.toString(),
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    logError('Error downloading brand export:', error)
    return NextResponse.json({ error: 'Failed to download export' }, { status: 500 })
  }
}
