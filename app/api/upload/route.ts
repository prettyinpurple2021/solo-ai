import { logError } from '@/lib/logger'
import '@/lib/server-polyfills'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'
import { rateLimitByIp } from '@/lib/rate-limit'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'



export const runtime = 'edge'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('upload', ip, 60_000, 30)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer()
    // Base64-encode using Web APIs for Edge
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(bytes)))

    // Save file metadata to database
    const url = process.env.DATABASE_URL
    if (!url) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    const sql = neon(url)

    // Idempotency support: use provided key
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reserved = await reserveIdempotencyKey(sql as any, key)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const rows = await sql`
      INSERT INTO documents (user_id, filename, content_type, file_size, content, category)
      VALUES (${user.id}, ${file.name}, ${file.type}, ${file.size}, ${base64Data}, ${category})
      RETURNING id, filename, content_type, file_size, category, created_at
    `

    return NextResponse.json({
      file: rows[0],
      message: 'File uploaded successfully'
    }, { status: 201 })
  } catch (error) {
    logError('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = process.env.DATABASE_URL
    if (!url) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    const sql = neon(url)
    const files = await sql`
      SELECT id, filename, content_type, file_size, category, created_at FROM documents WHERE user_id = ${user.id} ORDER BY created_at DESC
    `

    return NextResponse.json({ files })
  } catch (error) {
    logError('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
