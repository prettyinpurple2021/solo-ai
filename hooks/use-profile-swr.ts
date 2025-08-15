'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { toast } from 'sonner'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier?: string
  subscription_status?: string
  level?: number
  total_points?: number
}

interface ProfileUpdateData {
  full_name?: string
  avatar_url?: string
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
})

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ user: UserProfile }>('/api/profile', fetcher)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateProfile = async (profileData: ProfileUpdateData) => {
    setIsUpdating(true)
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedData = await res.json()
      
      // Optimistically update the local data
      mutate(
        prev => ({
          user: { ...prev?.user, ...profileData }
        }),
        { revalidate: false }
      )
      
      toast.success("Profile updated!", { 
        description: "Your profile information has been saved." 
      })
      
      setIsUpdating(false)
      return updatedData
    } catch (err) {
      console.error(err)
      toast.error("Failed to update profile", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      
      // Revalidate to ensure data is consistent
      mutate()
      
      setIsUpdating(false)
      throw err
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!file) return null
    
    setIsUpdating(true)
    
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await res.json()
      
      // Update the profile with the new avatar URL
      if (data.url) {
        await updateProfile({ avatar_url: data.url })
      }
      
      toast.success("Avatar uploaded!", { 
        description: "Your profile picture has been updated." 
      })
      
      setIsUpdating(false)
      return data.url
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload avatar", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      setIsUpdating(false)
      throw err
    }
  }

  const removeAvatar = async () => {
    setIsUpdating(true)
    
    try {
      // Update profile with null avatar_url
      await updateProfile({ avatar_url: null })
      
      toast.success("Avatar removed", { 
        description: "Your profile picture has been removed." 
      })
      
      setIsUpdating(false)
      return true
    } catch (err) {
      console.error(err)
      setIsUpdating(false)
      throw err
    }
  }

  return {
    profile: data?.user,
    isLoading,
    isError: !!error,
    error,
    isUpdating,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    mutate
  }
}
