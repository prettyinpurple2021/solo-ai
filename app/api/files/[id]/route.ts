import { NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'

// GET /api/files/:id → returns the binary file content with proper headers
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await createClient()
    const { rows } = await client.query(
      'SELECT id, content_type, content, filename FROM documents WHERE id = $1',
      [params.id]
    )

    if (rows.length === 0) {
      return new NextResponse('Not found', { status: 404 })
    }

    const file = rows[0] as {
      id: string
      content_type: string
      content: string
      filename: string
    }

    const buffer = Buffer.from(file.content, 'base64')
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': file.content_type,
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}

// DELETE /api/files/:id → deletes a file owned by the authenticated user
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    const { rowCount } = await client.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}


