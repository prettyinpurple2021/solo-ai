import { createClient } from "@/lib/neon/client"

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export const uploadImage = async (file: File, filename: string, userId: string): Promise<UploadResult> => {
  const client = await createClient()
  
  try {
    // Convert file to base64 for storage in database
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const pathname = `users/${userId}/images/${Date.now()}-${filename}`

    // Store image data in database
    const { error } = await client.query(
      `INSERT INTO user_images (user_id, filename, pathname, content_type, data, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, filename, pathname, file.type, base64]
    )

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }

    // Return a data URL for the image
    const dataUrl = `data:${file.type};base64,${base64}`

    return {
      url: dataUrl,
      pathname: pathname,
      contentType: file.type,
      contentDisposition: `attachment; filename="${filename}"`,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (pathname: string): Promise<void> => {
  const client = await createClient()
  
  try {
    const { error } = await client.query(
      'DELETE FROM user_images WHERE pathname = $1',
      [pathname]
    )

    if (error) {
      console.error('Error deleting image:', error)
      throw new Error('Failed to delete image')
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

export const listUserImages = async (userId: string) => {
  const client = await createClient()
  
  try {
    const { rows, error } = await client.query(
      'SELECT filename, pathname, content_type, created_at FROM user_images WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    if (error) {
      console.error('Error listing images:', error)
      throw new Error('Failed to list images')
    }

    return rows.map((row: any) => ({
      name: row.filename,
      pathname: row.pathname,
      contentType: row.content_type,
      updatedAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error listing images:", error)
    throw new Error("Failed to list images")
  }
}

export const getImage = async (pathname: string): Promise<string | null> => {
  const client = await createClient()
  
  try {
    const { rows, error } = await client.query(
      'SELECT data, content_type FROM user_images WHERE pathname = $1',
      [pathname]
    )

    if (error || rows.length === 0) {
      return null
    }

    const row = rows[0]
    return `data:${row.content_type};base64,${row.data}`
  } catch (error) {
    console.error("Error getting image:", error)
    return null
  }
}
