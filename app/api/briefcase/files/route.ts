import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'
import { uploadFile } from '@/lib/file-storage'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const folderId = url.searchParams.get('folderId')

    const sql = getSql()
    const offset = (page - 1) * limit

    // Query filters are now handled inline with conditional SQL

    // Get documents
    const documents = await sql`
      SELECT 
        id,
        name,
        original_name,
        file_type,
        mime_type,
        size,
        file_url,
        category,
        description,
        tags,
        is_favorite,
        is_public,
        download_count,
        view_count,
        last_accessed,
        created_at,
        updated_at,
        folder_id
      FROM documents 
      WHERE user_id = ${user.id}
        ${category && category !== 'all' ? sql`AND category = ${category}` : sql``}
        ${search ? sql`AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})` : sql``}
        ${folderId ? sql`AND folder_id = ${folderId}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM documents 
      WHERE user_id = ${user.id}
        ${category && category !== 'all' ? sql`AND category = ${category}` : sql``}
        ${search ? sql`AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})` : sql``}
        ${folderId ? sql`AND folder_id = ${folderId}` : sql``}
    `

    const total = parseInt(countResult[0]?.total || '0')

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logError('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderId = formData.get('folderId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const sql = getSql()
    const uploadedFiles = []

    for (const file of files) {
      // Generate unique ID
      const fileId = crypto.randomUUID()

      // Determine file category
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      let category = 'uncategorized'

      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)) {
        category = 'images'
      } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(fileType)) {
        category = 'documents'
      } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileType)) {
        category = 'videos'
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileType)) {
        category = 'audio'
      }

      try {
        // Upload file
        const blob = await uploadFile(file, `${fileId}-${file.name}`, user.id)

        // Insert document metadata into database (without file_data)
        const result = await sql`
          INSERT INTO documents (
            id,
            user_id,
            folder_id,
            name,
            original_name,
            file_type,
            mime_type,
            size,
            file_url,
            category,
            tags,
            is_favorite,
            is_public,
            download_count,
            view_count,
            created_at,
            updated_at
          ) VALUES (
            ${fileId},
            ${user.id},
            ${folderId || null},
            ${file.name},
            ${file.name},
            ${fileType},
            ${file.type},
            ${file.size},
            ${blob.url},
            ${category},
            ${JSON.stringify([])},
            false,
            false,
            0,
            0,
            NOW(),
            NOW()
          )
          RETURNING id, name, file_type, size, category, created_at
        `

        uploadedFiles.push(result[0])
      } catch (uploadError) {
        logError(`Error uploading file ${file.name}:`, uploadError)
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
  } catch (error) {
    logError('Error uploading files:', error)
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
  }
}