// Placeholder image upload functions for Stack Auth integration
// TODO: Implement proper image upload functionality with Stack Auth

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export const uploadImage = async (file: File, filename: string, userId: string): Promise<UploadResult> => {
  // Placeholder implementation - returns a data URL
  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const pathname = `users/${userId}/images/${Date.now()}-${filename}`

  return {
    url: `data:${file.type};base64,${base64}`,
    pathname: pathname,
    contentType: file.type,
    contentDisposition: `attachment; filename="${filename}"`,
  }
}

export const deleteImage = async (pathname: string): Promise<void> => {
  // Placeholder implementation
  console.log('Delete image:', pathname)
}

export const listUserImages = async (_userId: string) => {
  // Placeholder implementation
  return []
}

export const getImage = async (_pathname: string): Promise<string | null> => {
  // Placeholder implementation
  return null
}
