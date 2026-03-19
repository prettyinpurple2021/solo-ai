'use client'
import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useRef } from 'react'
import { Upload, Camera, X, Crown, Heart, Sparkles } from 'lucide-react'
import Image from 'next/image'


interface Avatar {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

interface AvatarUploadProps {
  currentAvatar?: Avatar | null
  onAvatarChange?: (avatar: Avatar | null) => void
  className?: string
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onAvatarChange,
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear any previous errors
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: {
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {})
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Notify parent component of the new avatar
      onAvatarChange?.(result.avatar)
      
      // Clear preview URL since we have the real URL now
      URL.revokeObjectURL(url)
      setPreviewUrl(null)

    } catch (error) {
      logError('Avatar upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      
      // Clean up preview on error
      URL.revokeObjectURL(url)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatar) return

    try {
      setIsUploading(true)
      
      const response = await fetch(`/api/unified-briefcase?id=${currentAvatar.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove avatar')
      }

      onAvatarChange?.(null)

    } catch (error) {
      logError('Avatar removal error:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const displayUrl = previewUrl || currentAvatar?.url
  const showPlaceholder = !displayUrl && !isUploading

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-dark-card border-2 border-neon-cyan shadow-[0_0_15px_rgba(11,228,236,0.3)] overflow-hidden group cursor-pointer hover:shadow-[0_0_25px_rgba(11,228,236,0.5)] transition-all duration-300 hover:scale-105">
          {showPlaceholder ? (
            <div 
              className="w-full h-full flex items-center justify-center text-gray-500 group-hover:text-neon-cyan transition-colors relative bg-dark-bg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Crown size={28} className="relative z-10" />
              <Sparkles size={16} className="absolute top-2 right-2 text-neon-purple animate-pulse" />
              <Heart size={12} className="absolute bottom-2 left-2 text-neon-magenta animate-bounce" />
            </div>
          ) : displayUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={displayUrl}
                alt="Profile avatar"
                fill
                className="object-cover"
                sizes="96px"
              />
              <div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-1">
                  <Camera 
                    size={18} 
                    className="text-neon-cyan drop-shadow-[0_0_5px_rgba(11,228,236,1)]" 
                  />
                  <Sparkles size={14} className="text-neon-purple animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-bg">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-neon-cyan border-l-neon-purple rounded-full"></div>
            </div>
          )}
        </div>

        {/* Remove avatar button */}
        {currentAvatar && !isUploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-900/80 border border-red-500 text-red-200 rounded-full flex items-center justify-center transition-all duration-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-800 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-110"
            title="Remove avatar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Upload controls */}
      <div className="mt-4 flex flex-col items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded-full transition-all duration-300 text-sm font-medium shadow-[0_0_10px_rgba(11,228,236,0.2)] hover:shadow-[0_0_15px_rgba(11,228,236,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group font-mono uppercase tracking-wider"
        >
          <Upload size={16} className="group-hover:animate-bounce" />
          {currentAvatar ? 'Change Avatar' : 'Upload Avatar'}
          <Crown size={14} className="opacity-70" />
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center font-mono">
          JPG, PNG or WebP • Max 5MB
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/50 rounded-sm shadow-sm">
          <p className="text-sm text-red-400 font-medium flex items-center gap-2 font-mono">
            <Heart size={14} className="text-red-500" />
            {error}
          </p>
        </div>
      )}
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        aria-label="Upload avatar image"
        title="Upload avatar image"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

export default AvatarUpload
