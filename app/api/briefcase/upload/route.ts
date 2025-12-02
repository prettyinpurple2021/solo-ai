import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'
import { v4 as uuidv4 } from 'uuid'
import { headers } from 'next/headers'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// File type validation
const ALLOWED_FILE_TYPES = {
  'image/': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  'application/pdf': ['pdf'],
  'text/': ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'video/': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  'audio/': ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
  'application/zip': ['zip'],
  'application/x-rar-compressed': ['rar'],
  'application/x-7z-compressed': ['7z'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB


function getFileTypeFromMime(mimeType: string): string {
  for (const [mime, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (mimeType.startsWith(mime)) {
      return extensions[0] || 'unknown'
    }
  }
  return 'unknown'
}

function isFileTypeAllowed(mimeType: string): boolean {
  for (const mime of Object.keys(ALLOWED_FILE_TYPES)) {
    if (mimeType.startsWith(mime)) {
      return true
    }
  }
  return false
}

async function saveFile(params: {
  userId: string,
  file: File,
  folderId?: string | null,
  category?: string,
  description?: string | null,
  tags?: string,
}) {
  const { userId, file, folderId, category = 'uncategorized', description = null, tags } = params

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }
  if (!isFileTypeAllowed(file.type)) {
    throw new Error('File type not allowed')
  }

  const fileId = uuidv4()
  const fileBuffer = await file.arrayBuffer()
  const fileData = Buffer.from(fileBuffer)
  const sql = getSql()
  const parsedTags = tags ? JSON.parse(tags) : []
  const tagsJson = JSON.stringify(parsedTags)
  const userAgent = (await headers()).get('user-agent')
  const metadataJson = JSON.stringify({
    originalSize: file.size,
    uploadedAt: new Date().toISOString(),
    userAgent: userAgent,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const documentRows = await sql`
      INSERT INTO documents (
        id, user_id, folder_id, name, original_name, file_type, mime_type,
        size, file_data, category, description, tags,
        metadata, created_at, updated_at
      ) VALUES (${fileId}, ${userId}, ${folderId || null}, ${file.name}, ${file.name}, 
      ${getFileTypeFromMime(file.type)}, ${file.type}, ${file.size}, ${fileData}, 
      ${category}, ${description || null}, ${tagsJson}::jsonb, ${metadataJson}::jsonb, NOW(), NOW())
      RETURNING *
    ` as any[]

  const document = documentRows[0]

  if (folderId) {
    await sql`
        UPDATE document_folders
        SET file_count = file_count + 1,
            total_size = total_size + ${file.size},
            updated_at = NOW()
        WHERE id = ${folderId} AND user_id = ${userId}
      `
  }

  const activityDetailsJson = JSON.stringify({
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    category,
    folderId: folderId || null,
  })
  await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${fileId}, ${userId}, ${'uploaded'}, ${activityDetailsJson}::jsonb, NOW())
    `

  return {
    id: document.id,
    name: document.name,
    type: document.file_type,
    size: document.size,
    category: document.category,
    description: document.description,
    tags: parsedTags,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    downloadUrl: `/api/briefcase/files/${fileId}/download`,
    previewUrl: `/api/briefcase/files/${fileId}/preview`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    // Accept either 'file' or 'files'
    const directFile = formData.get('file') as File | null
    const filesList = formData.getAll('files') as File[]
    const file = directFile || (filesList && filesList.length > 0 ? filesList[0] : null)
    const folderId = (formData.get('folderId') as string) || null
    const category = (formData.get('category') as string) || 'uncategorized'
    const description = (formData.get('description') as string) || null
    const rawTags = (formData.get('tags') as string) || ''
    // Accept either JSON array string or comma separated string
    let tags = '[]'
    try {
      if (rawTags.trim().startsWith('[')) {
        const parsed = JSON.parse(rawTags)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tags = JSON.stringify(Array.isArray(parsed) ? parsed.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean) : [])
      } else if (rawTags.trim().length > 0) {
        const arr = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        tags = JSON.stringify(arr)
      }
    } catch {
      tags = '[]'
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const saved = await saveFile({ userId: user.id, file, folderId, category, description, tags })
    return NextResponse.json({ success: true, document: saved })
  } catch (error) {
    logError('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload file'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = (formData.getAll('files') as File[]).filter(Boolean)
    const folderId = (formData.get('folderId') as string) || null
    const category = (formData.get('category') as string) || 'uncategorized'
    const description = (formData.get('description') as string) || null
    const rawTags = (formData.get('tags') as string) || ''
    let tags = '[]'
    try {
      if (rawTags.trim().startsWith('[')) {
        const parsed = JSON.parse(rawTags)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tags = JSON.stringify(Array.isArray(parsed) ? parsed.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean) : [])
      } else if (rawTags.trim().length > 0) {
        const arr = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        tags = JSON.stringify(arr)
      }
    } catch {
      tags = '[]'
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const results = await Promise.allSettled(
      files.map((file) => saveFile({ userId: user.id, file, folderId, category, description, tags }))
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successes = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>[]
    const failures = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[]

    return NextResponse.json({
      success: failures.length === 0,
      uploaded: successes.length,
      failed: failures.length,
      results: successes.map(r => r.value),
      errors: failures.map(f => (f.reason instanceof Error ? f.reason.message : String(f.reason))),
    })
  } catch (error) {
    logError('Bulk upload error:', error)
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
  }
}