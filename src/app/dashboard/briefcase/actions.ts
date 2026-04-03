'use server'

import { logError } from '@/lib/logger'
import { neon } from '@neondatabase/serverless'
import { authenticateAction } from '@/lib/auth-server'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export interface CreatedFolder {
  id: number
  name: string
  description: string | null
  color: string
  icon: string | null
  file_count: number
  total_size: number
  created_at: string
  updated_at: string
}

export interface CreateFolderResult {
  success: boolean
  folder?: CreatedFolder
  error?: string
}

export async function createFolderAction(name: string): Promise<CreateFolderResult> {
  const { user, error: authError } = await authenticateAction()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!name.trim()) {
    return { success: false, error: 'Folder name is required' }
  }

  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO document_folders (
        user_id, name, color, file_count, total_size, created_at, updated_at
      ) VALUES (
        ${user.id}, ${name.trim()}, '#8B5CF6', 0, 0, NOW(), NOW()
      )
      RETURNING
        id,
        name,
        description,
        color,
        icon,
        file_count,
        total_size,
        created_at::text AS created_at,
        updated_at::text AS updated_at
    `

    return { success: true, folder: result[0] as CreatedFolder }
  } catch (err) {
    logError('createFolderAction: DB error', err)
    return { success: false, error: 'Failed to create folder' }
  }
}
