import { put, del, list } from "@vercel/blob"

export interface FileUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export const uploadFile = async (file: File, filename: string, userId: string): Promise<FileUploadResult> => {
  try {
    const pathname = `users/${userId}/${Date.now()}-${filename}`

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `attachment; filename="${filename}"`,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

export const deleteFile = async (pathname: string): Promise<void> => {
  try {
    await del(pathname)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

export const listUserFiles = async (userId: string) => {
  try {
    const { blobs } = await list({
      prefix: `users/${userId}/`,
    })

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }))
  } catch (error) {
    console.error("Error listing files:", error)
    throw new Error("Failed to list files")
  }
}

export const getFileQuota = (subscriptionTier: string): number => {
  const quotas = {
    launchpad: 5 * 1024 * 1024 * 1024, // 5GB
    accelerator: 50 * 1024 * 1024 * 1024, // 50GB
    dominator: -1, // Unlimited
  }

  return quotas[subscriptionTier as keyof typeof quotas] || quotas.launchpad
}

export const checkFileQuota = async (
  userId: string,
  subscriptionTier: string,
): Promise<{
  used: number
  limit: number
  available: number
  canUpload: boolean
}> => {
  try {
    const files = await listUserFiles(userId)
    const used = files.reduce((total, file) => total + (file.size || 0), 0)
    const limit = getFileQuota(subscriptionTier)
    const available = limit === -1 ? Number.POSITIVE_INFINITY : limit - used
    const canUpload = limit === -1 || used < limit

    return {
      used,
      limit,
      available,
      canUpload,
    }
  } catch (error) {
    console.error("Error checking file quota:", error)
    return {
      used: 0,
      limit: getFileQuota(subscriptionTier),
      available: getFileQuota(subscriptionTier),
      canUpload: true,
    }
  }
}
