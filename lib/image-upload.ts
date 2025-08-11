import { createClient } from '@/lib/neon/server'

export interface UploadResult {
  url: string
  id: string
}

// Persists image to documents table and returns a URL to fetch it back via /api/files/:id
export const uploadImage = async (file: File, filename: string, userId: string): Promise<UploadResult> => {
  const client = await createClient()

  const bytes = await file.arrayBuffer()
  const base64Data = Buffer.from(bytes).toString('base64')

  const { rows } = await client.query(
    `INSERT INTO documents (user_id, filename, content_type, file_size, content, category, folder)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [userId, filename, file.type, file.size, base64Data, 'profile', '/']
  )

  const id = rows[0].id as string
  return {
    url: `/api/files/${id}`,
    id,
  }
}

export const deleteImage = async (documentId: string, userId: string): Promise<void> => {
  const client = await createClient()
  await client.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [documentId, userId])
}

export const listUserImages = async (userId: string) => {
  const client = await createClient()
  const { rows } = await client.query(
    `SELECT id, filename, content_type, file_size, created_at FROM documents 
     WHERE user_id = $1 AND category = 'profile' ORDER BY created_at DESC`,
    [userId]
  )
  return rows.map((r) => ({
    id: r.id as string,
    filename: r.filename as string,
    url: `/api/files/${r.id}`,
    contentType: r.content_type as string,
    fileSize: r.file_size as number,
    createdAt: r.created_at as string,
  }))
}

export const getImage = async (documentId: string): Promise<string | null> => {
  const client = await createClient()
  const { rows } = await client.query(
    'SELECT id FROM documents WHERE id = $1',
    [documentId]
  )
  if (rows.length === 0) return null
  return `/api/files/${documentId}`
}
