import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface UploadResult {
  url?: string
  error?: string
}

export async function uploadProfileImage(file: File, userId: string): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return { error: "Please upload an image file" }
    }

    if (file.size > 2 * 1024 * 1024) {
      return { error: "Image must be less than 2MB" }
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("profile-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return { error: "Failed to upload image" }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload image" }
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `avatars/${fileName}`

    await supabase.storage.from("profile-images").remove([filePath])
  } catch (error) {
    console.error("Delete error:", error)
  }
}
