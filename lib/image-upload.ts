import { createClient } from "@/lib/supabase/client"

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export const uploadImage = async (file: File, filename: string, userId: string): Promise<UploadResult> => {
  const supabase = await createClient()
  
  try {
    const pathname = `users/${userId}/images/${Date.now()}-${filename}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(pathname, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(pathname)

    return {
      url: publicUrl,
      pathname: data.path,
      contentType: file.type,
      contentDisposition: `attachment; filename="${filename}"`,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (pathname: string): Promise<void> => {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([pathname])

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
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(`users/${userId}/images/`)

    if (error) {
      console.error('Error listing images:', error)
      throw new Error('Failed to list images')
    }

    return data.map((file) => ({
      name: file.name,
      pathname: `users/${userId}/images/${file.name}`,
      size: file.metadata?.size || 0,
      updatedAt: file.updated_at,
    }))
  } catch (error) {
    console.error("Error listing images:", error)
    throw new Error("Failed to list images")
  }
}
