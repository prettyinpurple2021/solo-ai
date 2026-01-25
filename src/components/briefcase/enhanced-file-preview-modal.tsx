"use client"

import { logError,} from '@/lib/logger'
import, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { ScrollArea} from '@/components/ui/scroll-area'
import { useToast} from '@/hooks/use-toast'

import FileMetadataPanel from './file-metadata-panel'

import {
  X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, ChevronLeft, ChevronRight, FileText, Image, Music, Video, FileCode, Archive, Eye,} from 'lucide-react'

interface BriefcaseFile {
  id: string
  name: string
  original_name: string
  file_type: string
  mime_type: string
  size: number
  category: string
  tags: string[]
  description?: string
  folder_id?: string
  folder_name?: string
  folder_color?: string
  is_favorite: boolean
  download_count: number
  view_count: number
  last_accessed?: Date
  created_at: Date
  updated_at: Date
  ai_insights?: any
  metadata?: any
}

interface EnhancedFilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: BriefcaseFile | null
  files?: BriefcaseFile[]
  currentIndex?: number
  onNavigate?: (direction: 'prev' | 'next') => void
  onEdit?: (file: BriefcaseFile) => void
  onDelete?: (file: BriefcaseFile) => void
  onShare?: (file: BriefcaseFile) => void
  onDownload?: (file: BriefcaseFile) => void
  onToggleFavorite?: (file: BriefcaseFile) => void
  onAddTag?: (file: BriefcaseFile, tag: string) => void
  onRemoveTag?: (file: BriefcaseFile, tag: string) => void
  onUpdateDescription?: (file: BriefcaseFile, description: string) => void
  onUpdateCategory?: (file: BriefcaseFile, category: string) => void
}

interface PreviewState {
  loading: boolean
  error: string | null
  previewType: string | null
  content: string | null
  previewUrl: string | null
}

export default function EnhancedFilePreviewModal({
  isOpen,
  onClose,
  file,
  files = [],
  currentIndex = -1,
  onNavigate,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onToggleFavorite,
  onAddTag,
  onRemoveTag,
  onUpdateDescription,
  onUpdateCategory
}: EnhancedFilePreviewModalProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    loading: false,
    error: null,
    previewType: null,
    content: null,
    previewUrl: null
  })

  const [activeTab, setActiveTab] = useState<'preview' | 'metadata'>('preview')
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const {} = useToast()

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
      // Check if the file supports preview
      const token = localStorage.getItem('authToken')
      const headResponse = await fetch(`/api/briefcase/files/${fileToPreview.id}/preview`, {
        method: 'HEAD',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
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
      const previewResponse = await fetch(`/api/briefcase/files/${fileToPreview.id}/preview`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
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
          previewUrl: `/api/briefcase/files/${fileToPreview.id}/preview`
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
          previewUrl: `/api/briefcase/files/${fileToPreview.id}/preview`
        })
      } else if (previewType === 'audio' || previewType === 'video') {
        setPreviewState({
          loading: false,
          error: null,
          previewType,
          content: null,
          previewUrl: `/api/briefcase/files/${fileToPreview.id}/preview`
        })
      }
    } catch (error) {
      logError('Preview load error:', error)
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
      setActiveTab('preview')
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
        case 'm':
        case 'M':
          setActiveTab(prev => prev === 'preview' ? 'metadata' : 'preview')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNavigate, currentIndex, files.length, previewState.previewType])

  const getFileIcon = (filename: string, previewType: string | null) => {
    if (previewType === 'image') return <Image className="w-4 h-4" />
    if (previewType === 'text') return <FileCode className="w-4 h-4" />
    if (previewType === 'audio') return <Music className="w-4 h-4" />
    if (previewType === 'video') return <Video className="w-4 h-4" />
    if (previewType === 'pdf') return <FileText className="w-4 h-4" />
    return <Archive className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

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
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark-card border-2 border-neon-cyan/50 rounded-full shadow-[0_0_15px_rgba(11,228,236,0.3)] flex items-center justify-center mb-4">
            {getFileIcon(file?.name || '', null)}
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">Preview Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">{previewState.error}</p>
          {onDownload && file && (
            <Button onClick={() => onDownload(file)} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          )}
        </div>
      )
    }

    switch (previewState.previewType) {
      case 'image':
        return (
          <div className={`flex items-center justify-center ${contentHeight} relative overflow-hidden`}>
            <div className="relative">
              {previewState.previewUrl && (
                <img
                  src={previewState.previewUrl}
                  alt={file?.name || "File preview"}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 select-none`}
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  }}
                  onError={(e) => {
                    logError('Image load error:', e)
                    setPreviewState(prev => ({
                      ...prev,
                      error: 'Failed to load image'
                    }))
                  }}
                  draggable={false}
                />
              )}
            </div>
          </div>
        )

      case 'text':
        return (
          <ScrollArea className={contentHeight}>
            <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono p-3 sm:p-4 bg-gray-50 rounded-sm">
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
                className="w-full h-full border-0 rounded-sm"
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
                className="max-w-full max-h-full rounded-sm"
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark-card border-2 border-neon-cyan/50 rounded-full shadow-[0_0_15px_rgba(11,228,236,0.3)] flex items-center justify-center mb-4">
              {getFileIcon(file?.name || '', previewState.previewType)}
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Preview Not Supported</h3>
            <p className="text-sm text-gray-600 mb-4">This file type cannot be previewed in the browser.</p>
            {onDownload && file && (
              <Button onClick={() => onDownload(file)} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </Button>
            )}
          </div>
        )
    }
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl p-0 gap-0 ${isFullscreen ? 'w-screen h-screen max-w-none max-h-screen' : 'w-[95vw] max-w-6xl max-h-[90vh] sm:w-full'}`}>
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

            {onDownload && (
              <Button variant="outline" size="sm" onClick={() => onDownload(file)} className="p-1 sm:px-3">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="p-1 sm:px-3">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 p-4 overflow-hidden">
              {renderPreviewContent()}
            </TabsContent>

            <TabsContent value="metadata" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <FileMetadataPanel
                  file={file}
                  onEdit={onEdit ? () => onEdit(file) : undefined}
                  onDelete={onDelete ? () => onDelete(file) : undefined}
                  onShare={onShare ? () => onShare(file) : undefined}
                  onDownload={onDownload ? () => onDownload(file) : undefined}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(file) : undefined}
                  onAddTag={onAddTag ? (tag: string) => onAddTag(file, tag) : undefined}
                  onRemoveTag={onRemoveTag ? (tag: string) => onRemoveTag(file, tag) : undefined}
                  onUpdateDescription={onUpdateDescription ? (description: string) => onUpdateDescription(file, description) : undefined}
                  onUpdateCategory={onUpdateCategory ? (category: string) => onUpdateCategory(file, category) : undefined}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
