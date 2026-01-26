"use client"

import React, { useState,} from 'react'
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Button} from '@/components/ui/button'


import { useToast} from '@/hooks/use-toast'

import { 
  FileText, Calendar, Tag, Eye, Download, Share2, Edit, Trash2, Copy, Check, Clock, Folder, Hash, Image, File, Archive, Music, Video, Code, FileSpreadsheet} from 'lucide-react'

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

interface FileMetadataPanelProps {
  file: BriefcaseFile
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onDownload?: () => void
  onToggleFavorite?: () => void
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
  onUpdateDescription?: (description: string) => void
  onUpdateCategory?: (category: string) => void
}

export default function FileMetadataPanel({
  file,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onToggleFavorite,
  onAddTag,
  onRemoveTag,
  onUpdateDescription,
  onUpdateCategory
}: FileMetadataPanelProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [description, setDescription] = useState(file.description || '')
  const [category, setCategory] = useState(file.category || 'uncategorized')
  const [newTag, setNewTag] = useState('')
  const [copiedField, setCopiedField] = useState<string (null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.includes('image')) return <Image className="w-4 h-4" />
    if (type.includes('video')) return <Video className="w-4 h-4" />
    if (type.includes('audio')) return <Music className="w-4 h-4" />
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />
    if (type.includes('code') || type.includes('text')) return <Code className="w-4 h-4" />
    if (type.includes('archive') || type.includes('zip')) return <Archive className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      toast({
        title: "Copied",
        description: `${field} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleSaveDescription = async () => {
    if (onUpdateDescription && description !== file.description) {
      await onUpdateDescription(description)
    }
    setIsEditingDescription(false)
  }

  const handleAddTag = async () => {
    if (newTag.trim() && onAddTag) {
      await onAddTag(newTag.trim())
      setNewTag('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isEditingDescription) {
        handleSaveDescription()
      } else {
        handleAddTag()
      }
    } else if (e.key === 'Escape') {
      if (isEditingDescription) {
        setIsEditingDescription(false)
      } else if (isEditingCategory) {
        setCategory(file.category || 'uncategorized')
        setIsEditingCategory(false)
      }
    }
  }

  const handleSaveCategory = async () => {
    if (onUpdateCategory && category !== file.category) {
      await onUpdateCategory(category)
    }
    setIsEditingCategory(false)
  }

  return (
    <div className="space-y-4">
      {/* File Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-neon-purple/20 border-2 border-neon-purple/50 rounded-sm flex items-center justify-center flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                <p className="text-sm text-gray-600 truncate">{file.original_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFavorite}
                  className={file.is_favorite ? 'text-yellow-500' : 'text-gray-400'}
                >
                  ⭐
                </Button>
              )}
              {onShare && (
                <Button variant="ghost" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Size:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatFileSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatFileSize(file.size), 'File size')}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === 'File size' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{file.mime_type}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(file.mime_type, 'MIME type')}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === 'MIME type' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <div className="flex items-center gap-2">
                {isEditingCategory ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="h-6 w-32 px-1 text-xs border rounded"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={handleSaveCategory} className="h-6 w-6 p-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Badge variant="purple">{file.category}</Badge>
                    {onUpdateCategory && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingCategory(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">File ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-dark-card px-1 py-0.5 rounded font-mono">
                  {file.id.slice(0, 8)}...
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(file.id, 'File ID')}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === 'File ID' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Dates & Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Created:
              </span>
              <span className="font-medium">{formatDate(file.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Edit className="w-3 h-3" />
                Modified:
              </span>
              <span className="font-medium">{formatDate(file.updated_at)}</span>
            </div>
            {file.last_accessed && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Last accessed:
                </span>
                <span className="font-medium">{formatDate(file.last_accessed)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Eye className="w-3 h-3" />
                Views:
              </span>
              <span className="font-medium">{file.view_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Download className="w-3 h-3" />
                Downloads:
              </span>
              <span className="font-medium">{file.download_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Information */}
      {file.folder_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Folder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`}}
              />
              <span className="font-medium">{file.folder_name}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={3}
                placeholder="Add a description..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveDescription}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setDescription(file.description || '')
                    setIsEditingDescription(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-mono min-h-[1.5rem]">
                {file.description || 'No description provided'}
              </p>
              {onUpdateDescription && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditingDescription(true)}
                  className="h-6 text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  {file.description ? 'Edit' : 'Add description'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {file.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {tag}
                {onRemoveTag && (
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {onAddTag && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-2 py-1 text-sm border rounded-md"
              />
              <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {file.ai_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-4 h-4" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {file.ai_insights.summary && (
                <div>
                  <span className="text-gray-600">Summary:</span>
                  <p className="text-gray-300 font-mono mt-1">{file.ai_insights.summary}</p>
                </div>
              )}
              {file.ai_insights.keyPoints && file.ai_insights.keyPoints.length > 0 && (
                <div>
                  <span className="text-gray-600">Key Points:</span>
                  <ul className="list-disc list-inside text-gray-300 font-mono mt-1 space-y-1">
                    {file.ai_insights.keyPoints.map((point: string, index: number) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
