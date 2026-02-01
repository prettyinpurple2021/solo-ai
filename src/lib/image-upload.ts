import { getSql } from '@/lib/api-utils'

export interface UploadResult {
  url: string
  id: string
}

// Persists image to documents table and returns a URL to fetch it back via /api/files/:id
export const uploadImage = async (file: File, filename: string, userId: string): Promise<UploadResult> => {
  const sql = getSql()

  const bytes = await file.arrayBuffer()
  const base64Data = Buffer.from(bytes).toString('base64')

  const rows = await sql`
    INSERT INTO documents (user_id, filename, content_type, file_size, content, category, folder)
     VALUES (${userId}, ${filename}, ${file.type}, ${file.size}, ${base64Data}, ${'profile'}, ${'/'})
     RETURNING id
  ` as any[]

  const id = rows[0].id as string
  return {
    url: `/api/files/${id}`,
    id,
  }
}

export const deleteImage = async (documentId: string, userId: string): Promise<void> => {
  const sql = getSql()
  await sql`
    DELETE FROM documents WHERE id = ${documentId} AND user_id = ${userId}
  `
}

export const listUserImages = async (userId: string) => {
  const sql = getSql()
  const rows = await sql`
    SELECT id, filename, content_type, file_size, created_at FROM documents 
     WHERE user_id = ${userId} AND category = 'profile' ORDER BY created_at DESC
  ` as any[]
  return rows.map((r: any) => ({
    id: r.id as string,
    filename: r.filename as string,
    url: `/api/files/${r.id}`,
    contentType: r.content_type as string,
    fileSize: r.file_size as number,
    createdAt: r.created_at as string,
  }))
}

export const getImage = async (documentId: string): Promise<string | null> => {
  const sql = getSql()
  const rows = await sql`
    SELECT id FROM documents WHERE id = ${documentId}
  ` as any[]
  if (rows.length === 0) return null
  return `/api/files/${documentId}`
}
