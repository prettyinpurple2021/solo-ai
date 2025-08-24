"use client"

import React, { useState, useEffect, useCallback, TouchEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Image,
  Music,
  Video,
  FileCode,
  Archive
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BriefcaseFile {
  id: string
  name: string
  size: number
  type: string
  category: string
  createdAt: Date
  modifiedAt: Date
  tags: string[]
  description?: string
  folderId?: string
  favorite: boolean
}

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: BriefcaseFile | null
  files?: BriefcaseFile[] // For navigation between files
  currentIndex?: number
  onNavigate?: (direction: 'prev' | 'next') => void
}

interface PreviewState {
  loading: boolean
  error: string | null
  previewType: string | null
  content: string | null
  previewUrl: string | null
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  files = [],
  currentIndex = -1,
  onNavigate
}) => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    loading: false,
    error: null,
    previewType: null,
    content: null,
    previewUrl: null
  })

  // Image viewer state
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Media player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance?: number } | null>(null)
  const [isTouching, setIsTouching] = useState(false)

  // Load file preview
  const loadPreview = useCallback(async (fileToPreview: BriefcaseFile) => {
    if (!fileToPreview) return

    setPreviewState({
      loading: true,
      error: null,
      previewType: null,
      content: null,
      previewUrl: null
    })

    try {
      // First, check if the file supports preview
      const headResponse = await fetch(`/api/briefcase/preview/${fileToPreview.id}`, {
        method: 'HEAD'
      })

      if (!headResponse.ok) {
        throw new Error('Preview not available')
      }

      const previewSupported = headResponse.headers.get('X-File-Preview') === 'true'
      const previewType = headResponse.headers.get('X-Preview-Type')

      if (!previewSupported || !previewType) {
        throw new Error('File type not supported for preview')
      }

      // Load the actual preview content
      const previewResponse = await fetch(`/api/briefcase/preview/${fileToPreview.id}`)
      
      if (!previewResponse.ok) {
        throw new Error('Failed to load preview')
      }

      // Handle different content types
      if (previewType === 'image') {
        setPreviewState({
          loading: false,
          error: null,
          previewType,
          content: null,
          previewUrl: `/api/briefcase/preview/${fileToPreview.id}`
        })
      } else if (previewType === 'text') {
        const textContent = await previewResponse.text()
        setPreviewState({
          loading: false,
          error: null,
          previewType,
          content: textContent,
          previewUrl: null
        })
      } else if (previewType === 'pdf') {
        setPreviewState({
          loading: false,
          error: null,
          previewType,
          content: null,
          previewUrl: `/api/briefcase/preview/${fileToPreview.id}`
        })
      } else if (previewType === 'audio' || previewType === 'video') {
        setPreviewState({
          loading: false,
          error: null,
          previewType,
          content: null,
          previewUrl: `/api/briefcase/preview/${fileToPreview.id}`
        })
      }
    } catch (error) {
      console.error('Preview load error:', error)
      setPreviewState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load preview',
        previewType: null,
        content: null,
        previewUrl: null
      })
    }
  }, [])

  // Load preview when file changes
  useEffect(() => {
    if (file && isOpen) {
      loadPreview(file)
      // Reset viewer state
      setImageZoom(1)
      setImageRotation(0)
      setIsFullscreen(false)
      setIsPlaying(false)
      setIsMuted(false)
    }
  }, [file, isOpen, loadPreview])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (onNavigate && currentIndex > 0) {
            onNavigate('prev')
          }
          break
        case 'ArrowRight':
          if (onNavigate && currentIndex < files.length - 1) {
            onNavigate('next')
          }
          break
        case '+':
        case '=':
          if (previewState.previewType === 'image') {
            setImageZoom(prev => Math.min(prev + 0.25, 3))
          }
          break
        case '-':
          if (previewState.previewType === 'image') {
            setImageZoom(prev => Math.max(prev - 0.25, 0.25))
          }
          break
        case 'r':
        case 'R':
          if (previewState.previewType === 'image') {
            setImageRotation(prev => (prev + 90) % 360)
          }
          break
        case 'f':
        case 'F':
          if (previewState.previewType === 'image') {
            setIsFullscreen(prev => !prev)
          }
          break
        case ' ':
          if (previewState.previewType === 'video' || previewState.previewType === 'audio') {
            e.preventDefault()
            setIsPlaying(prev => !prev)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNavigate, currentIndex, files.length, previewState.previewType])

  // Get file icon
  const getFileIcon = (filename: string, previewType: string | null) => {
    if (previewType === 'image') return <Image className="w-4 h-4" />
    if (previewType === 'text') return <FileCode className="w-4 h-4" />
    if (previewType === 'audio') return <Music className="w-4 h-4" />
    if (previewType === 'video') return <Video className="w-4 h-4" />
    if (previewType === 'pdf') return <FileText className="w-4 h-4" />
    return <Archive className="w-4 h-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Download file
  const handleDownload = () => {
    if (!file) return
    // In a real implementation, this would trigger a file download
    console.log('Download file:', file.name)
  }

  // Share file
  const handleShare = () => {
    if (!file) return
    // In a real implementation, this would open a share dialog
    console.log('Share file:', file.name)
  }

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (previewState.previewType !== 'image') return
    
    const touch = e.touches[0]
    if (e.touches.length === 1) {
      setTouchStart({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch.clientX - touch2.clientX,
        touch.clientY - touch2.clientY
      )
      setTouchStart({ x: touch.clientX, y: touch.clientY, distance })
    }
    setIsTouching(true)
  }, [previewState.previewType])

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart || previewState.previewType !== 'image') return
    
    e.preventDefault() // Prevent scrolling
    
    if (e.touches.length === 2 && touchStart.distance) {
      // Pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )
      
      const scale = currentDistance / touchStart.distance
      const newZoom = Math.min(Math.max(imageZoom * scale, 0.25), 3)
      setImageZoom(newZoom)
      
      // Update distance for next calculation
      setTouchStart(prev => prev ? { ...prev, distance: currentDistance } : null)
    }
  }, [touchStart, imageZoom, previewState.previewType])

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart || previewState.previewType !== 'image') return
    
    if (e.touches.length === 0) {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const distance = Math.hypot(deltaX, deltaY)
      
      // Swipe gestures for navigation (only if not zooming)
      if (distance > 50 && Math.abs(deltaX) > Math.abs(deltaY) && !touchStart.distance) {
        if (deltaX > 0 && onNavigate && currentIndex > 0) {
          // Swipe right - previous
          onNavigate('prev')
        } else if (deltaX < 0 && onNavigate && currentIndex < files.length - 1) {
          // Swipe left - next
          onNavigate('next')
        }
      }
      
      // Double tap to zoom
      if (distance < 10 && !touchStart.distance) {
        // This would need a more sophisticated double-tap detection
        // For now, we'll skip this feature
      }
    }
    
    setTouchStart(null)
    setIsTouching(false)
  }, [touchStart, onNavigate, currentIndex, files.length, previewState.previewType])

  // Render preview content based on type
  const renderPreviewContent = () => {
    const contentHeight = isFullscreen ? 'h-screen' : 'h-64 sm:h-80 md:h-96'
    
    if (previewState.loading) {
      return (
        <div className={`flex items-center justify-center ${contentHeight}`}>
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading preview...</span>
        </div>
      )
    }

    if (previewState.error) {
      return (
        <div className={`flex flex-col items-center justify-center ${contentHeight} text-center px-4`}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {getFileIcon(file?.name || '', null)}
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">Preview Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">{previewState.error}</p>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      )
    }

    switch (previewState.previewType) {
      case 'image':
        return (
          <div 
            className={`flex items-center justify-center ${contentHeight} relative overflow-hidden`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative touch-pan-x touch-pan-y">
              {previewState.previewUrl && (
                <img
                  src={previewState.previewUrl}
                  alt={file?.name}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 select-none ${
                    isTouching ? 'duration-0' : 'duration-200'
                  }`}
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    touchAction: 'none'
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e)
                    setPreviewState(prev => ({
                      ...prev,
                      error: 'Failed to load image'
                    }))
                  }}
                  draggable={false}
                />
              )}
              
              {/* Mobile image controls overlay */}
              {previewState.previewType === 'image' && !previewState.loading && !previewState.error && (
                <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.25))}
                    disabled={imageZoom <= 0.25}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                    disabled={imageZoom >= 3}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 'text':
        return (
          <ScrollArea className={contentHeight}>
            <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono p-3 sm:p-4 bg-gray-50 rounded-lg">
              {previewState.content}
            </pre>
          </ScrollArea>
        )

      case 'pdf':
        return (
          <div className={`${contentHeight} w-full`}>
            {previewState.previewUrl && (
              <iframe
                src={previewState.previewUrl}
                className="w-full h-full border-0 rounded-lg"
                title={`PDF preview: ${file?.name}`}
              />
            )}
          </div>
        )

      case 'audio':
        return (
          <div className={`flex flex-col items-center justify-center ${contentHeight} px-4`}>
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Music className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            {previewState.previewUrl && (
              <audio
                controls
                className="w-full max-w-xs sm:max-w-md"
                preload="metadata"
              >
                <source src={previewState.previewUrl} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        )

      case 'video':
        return (
          <div className={`flex items-center justify-center ${contentHeight} px-2`}>
            {previewState.previewUrl && (
              <video
                controls
                className="max-w-full max-h-full rounded-lg"
                preload="metadata"
                playsInline
              >
                <source src={previewState.previewUrl} />
                Your browser does not support the video element.
              </video>
            )}
          </div>
        )

      default:
        return (
          <div className={`flex flex-col items-center justify-center ${contentHeight} text-center px-4`}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {getFileIcon(file?.name || '', previewState.previewType)}
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Preview Not Supported</h3>
            <p className="text-sm text-gray-600 mb-4">This file type cannot be previewed in the browser.</p>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download to View
            </Button>
          </div>
        )
    }
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl p-0 gap-0 ${isFullscreen ? 'w-screen h-screen max-w-none max-h-screen' : 'w-[95vw] max-w-4xl max-h-[90vh] sm:w-full'}`}>
        <DialogHeader className="flex-row items-center justify-between space-y-0 p-4 border-b">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {getFileIcon(file.name, previewState.previewType)}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-lg truncate pr-2">{file.name}</DialogTitle>
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                <span>{formatFileSize(file.size)}</span>
                <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                {previewState.previewType && (
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">{previewState.previewType}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Image controls */}
            {previewState.previewType === 'image' && !previewState.loading && !previewState.error && (
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.25))}
                  disabled={imageZoom <= 0.25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                  disabled={imageZoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFullscreen(prev => !prev)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            )}

            {/* Navigation controls */}
            {files.length > 1 && onNavigate && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('prev')}
                  disabled={currentIndex <= 0}
                  className="p-1 sm:px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs sm:text-sm text-gray-600 px-1">
                  {currentIndex + 1}/{files.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('next')}
                  disabled={currentIndex >= files.length - 1}
                  className="p-1 sm:px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleDownload} className="p-1 sm:px-3">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="p-1 sm:px-3">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-hidden">
          {renderPreviewContent()}
        </div>

        {/* File metadata */}
        {!isFullscreen && (
          <div className="border-t pt-3 mt-0 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600 text-xs">Created:</span>
                <p className="font-medium text-xs sm:text-sm truncate">{file.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Modified:</span>
                <p className="font-medium text-xs sm:text-sm truncate">{file.modifiedAt.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Type:</span>
                <p className="font-medium text-xs sm:text-sm truncate">{file.type}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Size:</span>
                <p className="font-medium text-xs sm:text-sm">{formatFileSize(file.size)}</p>
              </div>
            </div>
            {file.description && (
              <div className="mt-3">
                <span className="text-gray-600 text-xs">Description:</span>
                <p className="text-xs sm:text-sm mt-1 line-clamp-2">{file.description}</p>
              </div>
            )}
            {file.tags.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-600 text-xs">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {file.tags.slice(0, 6).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 6 && (
                    <span className="text-xs text-gray-500 px-1">+{file.tags.length - 6} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default FilePreviewModal
