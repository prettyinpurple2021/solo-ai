// Generic file storage interface - can be implemented with various providers
export interface FileUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export interface FileStorageProvider {
  upload(_file: File, _pathname: string): Promise<FileUploadResult>
  delete(pathname: string): Promise<void>
  list(_prefix: string): Promise<Array<{
    url: string
    pathname: string
    size: number
    uploadedAt: Date
  }>>
}

// Default implementation using local storage (for development)
class LocalFileStorage implements FileStorageProvider {
  async upload(file: File, pathname: string): Promise<FileUploadResult> {
    // For development, we'll create a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          pathname,
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async delete(pathname: string): Promise<void> {
    // No-op for local storage
    console.log(`Would delete file: ${pathname}`)
  }

  async list(prefix: string): Promise<Array<{
    url: string
    pathname: string
    size: number
    uploadedAt: Date
  }>> {
    // Return empty array for local storage
    return []
  }
}

// Initialize storage provider based on environment
const getStorageProvider = (): FileStorageProvider => {
  // You can implement different providers here based on your needs
  // For example: AWS S3, Cloudinary, etc.
  return new LocalFileStorage()
}

const storageProvider = getStorageProvider()

export const uploadFile = async (file: File, filename: string, userId: string): Promise<FileUploadResult> => {
  try {
    const pathname = `users/${userId}/${Date.now()}-${filename}`

    const result = await storageProvider.upload(file, pathname)

    return {
      url: result.url,
      pathname: result.pathname,
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
    await storageProvider.delete(pathname)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

export const listUserFiles = async (userId: string) => {
  try {
    const files = await storageProvider.list(`users/${userId}/`)

    return files.map((file) => ({
      url: file.url,
      pathname: file.pathname,
      size: file.size,
      uploadedAt: file.uploadedAt,
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
