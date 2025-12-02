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

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getSql()

    // Get folders with file counts
    const folders = await sql`
      SELECT 
        df.id,
        df.name,
        df.description,
        df.color,
        df.icon,
        df.file_count,
        df.total_size,
        df.created_at,
        df.updated_at,
        COUNT(d.id) as actual_file_count
      FROM document_folders df
      LEFT JOIN documents d ON d.folder_id = df.id
      WHERE df.user_id = ${user.id}
      GROUP BY df.id, df.name, df.description, df.color, df.icon, df.file_count, df.total_size, df.created_at, df.updated_at
      ORDER BY df.created_at DESC
    `

    return NextResponse.json({ folders })
  } catch (error) {
    logError('Error fetching folders:', error)
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, color, icon, parentId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    const sql = getSql()

    // Create folder
    const result = await sql`
      INSERT INTO document_folders (
        user_id,
        parent_id,
        name,
        description,
        color,
        icon,
        file_count,
        total_size,
        created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${parentId || null},
        ${name},
        ${description || null},
        ${color || '#8B5CF6'},
        ${icon || null},
        0,
        0,
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      folder: result[0]
    })
  } catch (error) {
    logError('Error creating folder:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}