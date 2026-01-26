// @ts-nocheck
import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect } from 'react'


interface Avatar {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<Avatar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAvatar = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/avatar/upload')
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, this is expected
          setAvatar(null)
          return
        }
        throw new Error(result.error || 'Failed to fetch avatar')
      }

      setAvatar(result.avatar)

    } catch (error) {
      logError('Fetch avatar error:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch avatar')
    } finally {
      setLoading(false)
    }
  }

  const updateAvatar = (newAvatar: Avatar | null) => {
    setAvatar(newAvatar)
  }

  useEffect(() => {
    fetchAvatar()
  }, [])

  return {
    avatar,
    loading,
    error,
    refetch: fetchAvatar,
    updateAvatar
  }
}