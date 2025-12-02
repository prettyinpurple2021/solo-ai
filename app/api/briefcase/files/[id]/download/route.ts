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
        download_count
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

    // Increment download count
    await sql`
      UPDATE documents 
      SET download_count = download_count + 1, last_accessed = NOW()
      WHERE id = ${fileId}
    `

    // Fetch file from external storage
    const fileResponse = await fetch(document.file_url)

    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    const fileBuffer = await fileResponse.arrayBuffer()

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${document.original_name}"`,
        'Content-Length': document.size.toString(),
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    logError('Error downloading file:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}