import '@/lib/server-polyfills'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'

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
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Save file metadata to database
    const client = await createClient()

    // Idempotency support: use provided key
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, key)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const { rows } = await client.query(
      `INSERT INTO documents (user_id, filename, content_type, file_size, content, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, content_type, file_size, category, created_at`,
      [user.id, file.name, file.type, file.size, base64Data, category]
    )

    return NextResponse.json({ 
      file: rows[0],
      message: 'File uploaded successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
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

    const client = await createClient()
    const { rows: files } = await client.query(
      'SELECT id, filename, content_type, file_size, category, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
