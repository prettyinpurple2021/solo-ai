"use client"

import { logError,} from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Textarea} from '@/components/ui/textarea'
import { Label} from '@/components/ui/label'
import { ScrollArea} from '@/components/ui/scroll-area'

import { useToast} from '@/hooks/use-toast'
import { motion, AnimatePresence} from 'framer-motion'

import {
  History, Download, RotateCcw, Trash2, Plus, Clock, User, FileText, CheckCircle,} from 'lucide-react'

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

interface DocumentVersion {
  id: string
  versionNumber: number
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: Date
  createdBy: string
  createdByName: string
  createdByAvatar?: string
  changelog: string
  isCurrent: boolean
}

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  file: BriefcaseFile | null
  currentUserId: string
}

export default function VersionHistoryModal({ 
  isOpen, 
  onClose, 
  file, 
  currentUserId 
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateVersion, setShowCreateVersion] = useState(false)
  const [newVersionChangelog, setNewVersionChangelog] = useState('')
  const [creatingVersion, setCreatingVersion] = useState(false)
  
  const { toast } = useToast()

  // Load versions when modal opens
  useEffect(() => {
    if (isOpen && file) {
      loadVersions()
    }
  }, [isOpen, file])

  const loadVersions = useCallback(async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions`)
      if (response.ok) {
        const versionsData = await response.json()
        setVersions(versionsData)
      } else {
        throw new Error('Failed to load versions')
      }
    } catch (error) {
      logError('Failed to load versions:', error)
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, toast])

  // Create new version
  const createVersion = useCallback(async () => {
    if (!file || !newVersionChangelog.trim()) return

    setCreatingVersion(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changelog: newVersionChangelog.trim()
        })
      })

      if (!response.ok) throw new Error('Failed to create version')

      const newVersion = await response.json()
      setVersions(prev => [newVersion, ...prev])
      setNewVersionChangelog('')
      setShowCreateVersion(false)

      toast({
        title: "Version created",
        description: `Version ${newVersion.versionNumber} created successfully`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create version",
        variant: "destructive"
      })
    } finally {
      setCreatingVersion(false)
    }
  }, [file, newVersionChangelog, toast])

  // Restore version
  const restoreVersion = useCallback(async (versionId: string, versionNumber: number) => {
    if (!file) return

    if (!confirm(`Are you sure you want to restore version ${versionNumber}? This will replace the current version.`)) {
      return
    }

    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' })
      })

      if (!response.ok) throw new Error('Failed to restore version')

      // Update versions to reflect the change
      setVersions(prev => prev.map(v => ({
        ...v,
        isCurrent: v.id === versionId
      })))

      toast({
        title: "Version restored",
        description: `Version ${versionNumber} has been restored`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Download version
  const downloadVersion = useCallback(async (versionId: string, fileName: string) => {
    if (!file) return

    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download' })
      })

      if (!response.ok) throw new Error('Failed to download version')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: `Downloading version of ${fileName}`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download version",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Delete version
  const deleteVersion = useCallback(async (versionId: string, versionNumber: number) => {
    if (!file) return

    if (!confirm(`Are you sure you want to delete version ${versionNumber}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions/${versionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete version')

      setVersions(prev => prev.filter(v => v.id !== versionId))

      toast({
        title: "Version deleted",
        description: `Version ${versionNumber} has been deleted`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete version",
        variant: "destructive"
      })
    }
  }, [file, toast])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Version History - &quot;{file.name}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Create Version Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {versions.length} version{versions.length !== 1 ? 's' : ''} available
            </div>
            <Button
              onClick={() => setShowCreateVersion(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Version
            </Button>
          </div>

          {/* Create Version Form */}
          <AnimatePresence>
            {showCreateVersion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-sm p-4 bg-dark-card"
              >
                <div className="space-y-3">
                  <Label htmlFor="changelog">Version Changelog</Label>
                  <Textarea
                    id="changelog"
                    placeholder="Describe what changed in this version..."
                    value={newVersionChangelog}
                    onChange={(e) => setNewVersionChangelog(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={createVersion}
                      disabled={!newVersionChangelog.trim() || creatingVersion}
                      size="sm"
                    >
                      {creatingVersion ? 'Creating...' : 'Create Version'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateVersion(false)
                        setNewVersionChangelog('')
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Versions List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading versions...</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No versions available</p>
                <p className="text-sm">Create your first version to start tracking changes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-sm ${
                      version.isCurrent 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-purple-100 rounded-sm flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white font-orbitron uppercase tracking-wider">
                              Version {version.versionNumber}
                            </h3>
                            {version.isCurrent && (
                              <Badge className="bg-purple-100 text-purple-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Current
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {version.changelog}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(version.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {version.createdByName}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {formatFileSize(version.fileSize)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadVersion(version.id, version.fileName)}
                          title="Download this version"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {!version.isCurrent && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => restoreVersion(version.id, version.versionNumber)}
                              title="Restore this version"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteVersion(version.id, version.versionNumber)}
                              title="Delete this version"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
