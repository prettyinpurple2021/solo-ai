import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Unified route that handles both ID-based and pathname-based file serving
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ param: string }> }
) {
  try {
    const params = await context.params
    const param = params.param
    
    if (!param) return new NextResponse('Not found', { status: 404 })

    // Check if param is a UUID (ID-based) or a pathname
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)
    
    if (isUuid) {
      // Handle ID-based file serving (documents table)
      return await handleIdBasedFile(param)
    } else {
      // Handle pathname-based file serving (file_storage table)
      return await handlePathnameBasedFile(param)
    }
  } catch (error) {
    logError('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Convert base64 string to Uint8Array (Edge-safe)
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i)
  return bytes
}

// Normalize various binary formats (hex string from bytea, ArrayBuffer, Uint8Array) to Uint8Array
function normalizeBinary(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (typeof data === 'string') {
    // Handle Postgres bytea hex format "\\x..."
    if (data.startsWith('\\x') || data.startsWith('\\X')) {
      const hex = data.slice(2)
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
      }
      return bytes
    }
    // Assume base64 otherwise
    return base64ToUint8Array(data)
  }
  if (data && typeof data === 'object' && 'data' in (data as any)) {
    const arr = (data as any).data as number[]
    return new Uint8Array(arr)
  }
  throw new Error('Unsupported binary format from database')
}

// Handle ID-based file serving from documents table (Edge-safe via Neon HTTP)
async function handleIdBasedFile(id: string) {
  try {
    const sql = getSql()
    const rows = await sql`
      SELECT id, content_type, content, filename FROM documents WHERE id = ${id}
    `

    if (rows.length === 0) {
      return new NextResponse('Not found', { status: 404 })
    }

    const file = rows[0] as {
      id: string
      content_type: string
      content: unknown
      filename: string
    }

    const bytes = normalizeBinary(file.content)
    return new NextResponse(bytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': file.content_type,
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    logError('Error serving ID-based file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Handle pathname-based file serving from file_storage table
async function handlePathnameBasedFile(pathname: string) {
  try {
    const decodedPathname = decodeURIComponent(pathname)
    const sql = getSql()
    
    // Fetch file from database
    const result = await sql`
      SELECT filename, content_type, file_size, file_data
      FROM file_storage
      WHERE pathname = ${decodedPathname}
    `
    
    if (result.length === 0) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    const file = result[0]
    
    // Convert buffer back to response
    const bytes = normalizeBinary(file.file_data)
    
    return new NextResponse(bytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': file.content_type,
        'Content-Length': file.file_size.toString(),
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    logError('Error serving pathname-based file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE endpoint - handles both ID-based and pathname-based deletion
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ param: string }> }
) {
  try {
    const params = await context.params
    const param = params.param
    
    if (!param) return new NextResponse('Not found', { status: 404 })

    // Check if param is a UUID (ID-based) or a pathname
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)
    
    if (isUuid) {
      // Handle ID-based file deletion (documents table)
      return await handleIdBasedFileDeletion(param)
    } else {
      // Handle pathname-based file deletion (file_storage table)
      return await handlePathnameBasedFileDeletion(param)
    }
  } catch (error) {
    logError('Error deleting file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Handle ID-based file deletion from documents table
async function handleIdBasedFileDeletion(id: string) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getSql()
    const deletedRows = await sql`
      DELETE FROM documents WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    ` as any[]

    if (deletedRows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logError('Error deleting ID-based file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

// Handle pathname-based file deletion from file_storage table
async function handlePathnameBasedFileDeletion(pathname: string) {
  try {
    const decodedPathname = decodeURIComponent(pathname)
    const sql = getSql()
    
    // Delete file from database
    const result = await sql`
      DELETE FROM file_storage
      WHERE pathname = ${decodedPathname}
      RETURNING filename
    `
    
    if (result.length === 0) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'File deleted successfully',
      filename: result[0].filename
    })
  } catch (error) {
    logError('Error deleting pathname-based file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
