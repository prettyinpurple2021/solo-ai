import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const fileId = params.id
    const sql = getSql()

    // Get file metadata
    const documents = await sql`
      SELECT 
        id,
        name,
        original_name,
        file_type,
        mime_type,
        size,
        file_url,
        view_count
      FROM documents 
      WHERE id = ${fileId} AND user_id = ${user.id}
      LIMIT 1
    `

    if (documents.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const document = documents[0]

    if (!document.file_url) {
      return NextResponse.json({ error: 'File not available' }, { status: 404 })
    }

    // Increment view count
    await sql`
      UPDATE documents 
      SET view_count = view_count + 1, last_accessed = NOW()
      WHERE id = ${fileId}
    `

    // For images, return the file directly
    if (document.mime_type.startsWith('image/')) {
      const fileResponse = await fetch(document.file_url)

      if (!fileResponse.ok) {
        return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
      }

      const fileBuffer = await fileResponse.arrayBuffer()

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': document.mime_type,
          'Content-Length': document.size.toString(),
          'Cache-Control': 'private, max-age=3600'
        }
      })
    }

    // For other file types, return metadata for preview
    return NextResponse.json({
      file: {
        id: document.id,
        name: document.name,
        originalName: document.original_name,
        fileType: document.file_type,
        mimeType: document.mime_type,
        size: document.size,
        url: document.file_url,
        viewCount: document.view_count + 1
      },
      preview: {
        type: 'metadata',
        message: 'Preview not available for this file type. Click download to view the file.'
      }
    })
  } catch (error) {
    logError('Error previewing file:', error)
    return NextResponse.json({ error: 'Failed to preview file' }, { status: 500 })
  }
}