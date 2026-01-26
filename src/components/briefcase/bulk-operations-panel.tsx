"use client"

import { logError,} from '@/lib/logger'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Input} from '@/components/ui/input'
import { Label} from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Checkbox} from '@/components/ui/checkbox'
import { Separator} from '@/components/ui/separator'
import { useToast} from '@/hooks/use-toast'
import { motion, AnimatePresence} from 'framer-motion'

import {
  Trash2, Move, Copy, Tag, Folder, Star, StarOff, Download, Share2, X, Check, AlertTriangle, Loader2,} from 'lucide-react'

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

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  parent_id?: string
  created_at: Date
  updated_at: Date
}

interface BulkOperationsPanelProps {
  selectedFiles: BriefcaseFile[]
  availableFolders: Folder[]
  onClose: () => void
  onOperationComplete: () => void
}

type BulkOperation = 
  | 'delete'
  | 'move'
  | 'copy'
  | 'tag'
  | 'category'
  | 'favorite'
  | 'unfavorite'
  | 'download'
  | 'share'

export default function BulkOperationsPanel({
  selectedFiles,
  availableFolders,
  onClose,
  onOperationComplete
}: BulkOperationsPanelProps) {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null)
  const [loading, setLoading] = useState(false)
  const [operationResult, setOperationResult] = useState<any>(null)
  
  // Operation-specific state
  const [targetFolder, setTargetFolder] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [tagOperation, setTagOperation] = useState<'add' | 'remove'>('add')
  const [category, setCategory] = useState<string>('')
  const [sharePermissions, setSharePermissions] = useState({
    permissions: 'view' as 'view' | 'comment' | 'edit',
    expiresIn: '7' as '1' | '7' | '30' | 'never',
    downloadEnabled: true,
    requireAuth: false
  })
  
  const { toast } = useToast()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0)
  }

  const getFileTypes = () => {
    const types = new Set(selectedFiles.map(file => file.file_type))
    return Array.from(types)
  }

  const getCategories = () => {
    const categories = new Set(selectedFiles.map(file => file.category))
    return Array.from(categories)
  }

  const executeOperation = async () => {
    if (!selectedOperation) return

    setLoading(true)
    setOperationResult(null)

    try {
      const fileIds = selectedFiles.map(file => file.id)
      let requestBody: any = {
        action: selectedOperation,
        fileIds
      }

      // Add operation-specific options
      switch (selectedOperation) {
        case 'move':
        case 'copy':
          if (!targetFolder || targetFolder === '__root__') {
            toast({
              title: "Error",
              description: "Please select a target folder",
              variant: "destructive"
            })
            setLoading(false)
            return
          }
          requestBody.options = { folderId: targetFolder }
          break
        case 'tag':
          if (!tags.trim()) {
            toast({
              title: "Error",
              description: "Please enter tags",
              variant: "destructive"
            })
            setLoading(false)
            return
          }
          requestBody.options = {
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            operation: tagOperation
          }
          break
        case 'category':
          if (!category.trim()) {
            toast({
              title: "Error",
              description: "Please enter a category",
              variant: "destructive"
            })
            setLoading(false)
            return
          }
          requestBody.options = { category: category.trim() }
          break
        case 'favorite':
          requestBody.options = { favorite: true }
          break
        case 'unfavorite':
          requestBody.options = { favorite: false }
          break
        case 'share':
          requestBody.options = { permissions: sharePermissions }
          break
      }

      const response = await fetch('/api/briefcase/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Operation failed')
      }

      setOperationResult(result)

      // Show success message
      const operationNames = {
        delete: 'deleted',
        move: 'moved',
        copy: 'copied',
        tag: 'tagged',
        category: 'categorized',
        favorite: 'added to favorites',
        unfavorite: 'removed from favorites',
        download: 'prepared for download',
        share: 'shared'
      }

      toast({
        title: "Operation completed",
        description: `${result.processed} files ${operationNames[selectedOperation]}. ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
      })

      // Handle special cases
      if (selectedOperation === 'download' && result.downloadUrls) {
        // Trigger downloads
        result.downloadUrls.forEach((url: string) => {
          const link = document.createElement('a')
          link.href = url
          link.download = ''
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      }

      if (selectedOperation === 'share' && result.shareLinks) {
        // Copy share links to clipboard
        const linksText = result.shareLinks.join('\n')
        await navigator.clipboard.writeText(linksText)
        toast({
          title: "Share links copied",
          description: "Share links have been copied to your clipboard",
        })
      }

      onOperationComplete()

    } catch (error) {
      logError('Bulk operation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getOperationIcon = (operation: BulkOperation) => {
    switch (operation) {
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'move': return <Move className="w-4 h-4" />
      case 'copy': return <Copy className="w-4 h-4" />
      case 'tag': return <Tag className="w-4 h-4" />
      case 'category': return <Folder className="w-4 h-4" />
      case 'favorite': return <Star className="w-4 h-4" />
      case 'unfavorite': return <StarOff className="w-4 h-4" />
      case 'download': return <Download className="w-4 h-4" />
      case 'share': return <Share2 className="w-4 h-4" />
    }
  }

  const getOperationDescription = (operation: BulkOperation) => {
    switch (operation) {
      case 'delete': return 'Permanently delete selected files'
      case 'move': return 'Move files to a different folder'
      case 'copy': return 'Create copies of files in a folder'
      case 'tag': return 'Add or remove tags from files'
      case 'category': return 'Change the category of files'
      case 'favorite': return 'Add files to favorites'
      case 'unfavorite': return 'Remove files from favorites'
      case 'download': return 'Download all selected files'
      case 'share': return 'Create share links for files'
    }
  }

  const operations: BulkOperation[] = [
    'move', 'copy', 'tag', 'category', 'favorite', 'unfavorite', 'download', 'share', 'delete'
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bulk Operations</h3>
          <p className="text-sm text-gray-600">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* File Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selection Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total size:</span>
              <p className="font-medium">{formatFileSize(getTotalSize())}</p>
            </div>
            <div>
              <span className="text-gray-600">File types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {getFileTypes().slice(0, 3).map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {getFileTypes().length > 3 && (
                  <span className="text-xs text-gray-500">+{getFileTypes().length - 3} more</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Categories:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {getCategories().slice(0, 2).map((cat, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {getCategories().length > 2 && (
                  <span className="text-xs text-gray-500">+{getCategories().length - 2} more</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Favorites:</span>
              <p className="font-medium">
                {selectedFiles.filter(f => f.is_favorite).length} of {selectedFiles.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {operations.map((operation) => (
              <Button
                key={operation}
                variant={selectedOperation === operation ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedOperation(operation)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  {getOperationIcon(operation)}
                  <div className="text-left">
                    <div className="font-medium capitalize">
                      {operation === 'unfavorite' ? 'Remove from Favorites' : operation}
                    </div>
                    <div className="text-xs text-gray-600">
                      {getOperationDescription(operation)}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation Configuration */}
      <AnimatePresence>
        {selectedOperation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {getOperationIcon(selectedOperation)}
                  Configure {selectedOperation === 'unfavorite' ? 'Remove from Favorites' : selectedOperation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedOperation === 'move' || selectedOperation === 'copy' ? (
                  <div>
                    <Label>Target Folder</Label>
                    <Select value={targetFolder} onValueChange={setTargetFolder}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select folder..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__root__">Root Level</SelectItem>
                        {availableFolders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`}}
                              />
                              {folder.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : selectedOperation === 'tag' ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Tag Operation</Label>
                      <Select value={tagOperation} onValueChange={(value: 'add' | 'remove') => setTagOperation(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Add Tags</SelectItem>
                          <SelectItem value="remove">Remove Tags</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags separated by commas..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : selectedOperation === 'category' ? (
                  <div>
                    <Label>New Category</Label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter category name..."
                      className="mt-1"
                    />
                  </div>
                ) : selectedOperation === 'share' ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Access Level</Label>
                      <Select 
                        value={sharePermissions.permissions} 
                        onValueChange={(value: 'view' | 'comment' | 'edit') => 
                          setSharePermissions(prev => ({ ...prev, permissions: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View only</SelectItem>
                          <SelectItem value="comment">View and comment</SelectItem>
                          <SelectItem value="edit">View, comment, and edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expires</Label>
                      <Select 
                        value={sharePermissions.expiresIn} 
                        onValueChange={(value: '1' | '7' | '30' | 'never') => 
                          setSharePermissions(prev => ({ ...prev, expiresIn: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">1 week</SelectItem>
                          <SelectItem value="30">1 month</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={sharePermissions.downloadEnabled}
                        onCheckedChange={(checked) => 
                          setSharePermissions(prev => ({ ...prev, downloadEnabled: !!checked }))
                        }
                      />
                      <Label>Allow downloads</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={sharePermissions.requireAuth}
                        onCheckedChange={(checked) => 
                          setSharePermissions(prev => ({ ...prev, requireAuth: !!checked }))
                        }
                      />
                      <Label>Require sign-in</Label>
                    </div>
                  </div>
                ) : selectedOperation === 'delete' ? (
                  <div className="p-4 bg-neon-magenta/10 border-2 border-neon-magenta/50 rounded-sm">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      This action will permanently delete {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}. 
                      This cannot be undone.
                    </p>
                  </div>
                ) : null}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={executeOperation}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {getOperationIcon(selectedOperation)}
                        <span className="ml-2">
                          {selectedOperation === 'unfavorite' ? 'Remove from Favorites' : `Execute ${selectedOperation}`}
                        </span>
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOperation(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operation Result */}
      <AnimatePresence>
        {operationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Operation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Processed:</span>
                    <span className="font-medium text-green-600">{operationResult.processed}</span>
                  </div>
                  {operationResult.failed > 0 && (
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{operationResult.failed}</span>
                    </div>
                  )}
                  {operationResult.errors && operationResult.errors.length > 0 && (
                    <div>
                      <span className="text-red-600">Errors:</span>
                      <ul className="list-disc list-inside text-red-600 mt-1">
                        {operationResult.errors.slice(0, 3).map((error: string, index: number) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                        {operationResult.errors.length > 3 && (
                          <li className="text-xs">... and {operationResult.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
