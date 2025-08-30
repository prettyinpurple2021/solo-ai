"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  History, 
  RotateCcw, 
  RotateCw, 
  CalendarClock, 
  FileText, 
  Save, 
  Check, 
  ArrowLeft,
  ArrowRight,
  Download,
  Lock,
  Unlock
} from 'lucide-react'

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

interface VersionHistory {
  id: string
  versionNumber: number
  createdAt: Date
  createdBy: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  fileSize: number
  changeDescription?: string
  changeType: 'minor' | 'major' | 'restore'
  isLocked: boolean
  tags: string[]
}

interface VersionCompare {
  previousVersionId?: string
  currentVersionId: string
  differences: {
    type: 'addition' | 'deletion' | 'modification'
    description: string
  }[]
}

interface DocumentVersioningModalProps {
  isOpen: boolean
  onClose: () => void
  file: BriefcaseFile | null
  currentUserId: string
  _currentUserName: string
}

export default function DocumentVersioningModal({
  isOpen,
  onClose,
  file,
  currentUserId,
  _currentUserName
}: DocumentVersioningModalProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'compare'>('history')
  const [versions, setVersions] = useState<VersionHistory[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [compareVersion, setCompareVersion] = useState<string | null>(null)
  const [versionCompare, setVersionCompare] = useState<VersionCompare | null>(null)
  const [loading, setLoading] = useState(false)
  const [newVersionNote, setNewVersionNote] = useState('')
  const [newVersionType, setNewVersionType] = useState<'minor' | 'major'>('minor')
  
  const { toast } = useToast()

  // Load version history when modal opens
  useEffect(() => {
    if (isOpen && file) {
      loadVersionHistory()
    }
  }, [isOpen, file, loadVersionHistory])

  const loadVersionHistory = useCallback(async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions`)
      if (response.ok) {
        const versionsData = await response.json()
        setVersions(versionsData)
        
        // Select the latest version by default
        if (versionsData.length > 0) {
          setSelectedVersion(versionsData[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load version history:', error)
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, toast])

  // Load version comparison data
  const loadVersionCompare = useCallback(async () => {
    if (!selectedVersion || !compareVersion) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file?.id}/versions/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId1: selectedVersion,
          versionId2: compareVersion
        })
      })
      
      if (response.ok) {
        const compareData = await response.json()
        setVersionCompare(compareData)
      }
    } catch (error) {
      console.error('Failed to load version comparison:', error)
      toast({
        title: "Error",
        description: "Failed to compare versions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, selectedVersion, compareVersion, toast])

  // Trigger comparison when both versions are selected
  useEffect(() => {
    if (activeTab === 'compare' && selectedVersion && compareVersion) {
      loadVersionCompare()
    }
  }, [activeTab, selectedVersion, compareVersion, loadVersionCompare])

  // Create new version
  const createNewVersion = useCallback(async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeDescription: newVersionNote,
          changeType: newVersionType,
          createdBy: currentUserId
        })
      })
      
      if (response.ok) {
        const newVersion = await response.json()
        setVersions(prev => [newVersion, ...prev])
        setSelectedVersion(newVersion.id)
        setNewVersionNote('')
        
        toast({
          title: "Success",
          description: `Created version ${newVersion.versionNumber}`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, newVersionNote, newVersionType, currentUserId, toast])

  // Restore version
  const restoreVersion = useCallback(async (versionId: string) => {
    if (!file) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions/${versionId}/restore`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const restoredVersion = await response.json()
        
        // Refresh version history
        loadVersionHistory()
        
        toast({
          title: "Success",
          description: `Restored to version ${restoredVersion.versionNumber}`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, loadVersionHistory, toast])

  // Toggle version lock
  const toggleVersionLock = useCallback(async (versionId: string, isLocked: boolean) => {
    if (!file) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/versions/${versionId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !isLocked })
      })
      
      if (response.ok) {
        // Update version in the list
        setVersions(prev => prev.map(v => 
          v.id === versionId ? { ...v, isLocked: !isLocked } : v
        ))
        
        toast({
          title: "Success",
          description: `Version ${isLocked ? 'unlocked' : 'locked'}`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${isLocked ? 'unlock' : 'lock'} version`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, toast])

  // Download version
  const downloadVersion = useCallback(async (versionId: string) => {
    if (!file) return
    
    try {
      // Initiate download
      window.open(`/api/briefcase/files/${file.id}/versions/${versionId}/download`, '_blank')
      
      toast({
        title: "Download started",
        description: "Your file will download shortly",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to download version",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  // Get version by ID
  const getVersionById = (versionId: string) => {
    return versions.find(v => v.id === versionId)
  }

  // Get comparison label
  const getComparisonLabel = () => {
    const selected = getVersionById(selectedVersion || '')
    const compare = getVersionById(compareVersion || '')
    
    if (!selected || !compare) return ''
    
    if (selected.versionNumber > compare.versionNumber) {
      return `Changes from v${compare.versionNumber} to v${selected.versionNumber}`
    } else {
      return `Changes from v${selected.versionNumber} to v${compare.versionNumber}`
    }
  }

  // Get change type badge color
  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case 'major': return 'bg-blue-100 text-blue-700'
      case 'minor': return 'bg-green-100 text-green-700'
      case 'restore': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Get diff type badge color
  const getDiffTypeBadge = (diffType: string) => {
    switch (diffType) {
      case 'addition': return 'bg-green-100 text-green-700'
      case 'deletion': return 'bg-red-100 text-red-700'
      case 'modification': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Version History for &quot;{file.name}&quot;
          </DialogTitle>
          <DialogDescription>
            Track, compare, and restore previous versions of this document
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: 'history' | 'compare') => setActiveTab(value)} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="w-3 h-3" />
              Version History ({versions.length})
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              Compare Versions
            </TabsTrigger>
          </TabsList>

          {/* Version History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Create New Version</CardTitle>
                <CardDescription>Save the current state as a new version</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Version Type</Label>
                    <Select 
                      value={newVersionType} 
                                                onValueChange={(value: 'minor' | 'major') => setNewVersionType(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor Change</SelectItem>
                        <SelectItem value="major">Major Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Change Description</Label>
                    <Input
                      value={newVersionNote}
                      onChange={(e) => setNewVersionNote(e.target.value)}
                      placeholder="What changed in this version?"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={createNewVersion}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Current Version
                </Button>
              </CardFooter>
            </Card>

            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 border rounded-lg transition-all ${
                      selectedVersion === version.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">v{version.versionNumber}</Badge>
                        <Badge className={getChangeTypeBadge(version.changeType)}>
                          {version.changeType.charAt(0).toUpperCase() + version.changeType.slice(1)}
                        </Badge>
                        {version.isLocked && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadVersion(version.id)
                          }}
                          title="Download this version"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVersionLock(version.id, version.isLocked)
                          }}
                          title={version.isLocked ? "Unlock version" : "Lock version"}
                        >
                          {version.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            restoreVersion(version.id)
                          }}
                          title="Restore this version"
                          disabled={version.versionNumber === versions[0]?.versionNumber}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-1">
                        <AvatarImage src={version.createdBy.avatar} />
                        <AvatarFallback>
                          {version.createdBy.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{version.createdBy.name}</span> created this version
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {new Date(version.createdAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {formatFileSize(version.fileSize)}
                          </span>
                        </div>
                        
                        {version.changeDescription && (
                          <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                            {version.changeDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {versions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No version history yet</p>
                    <p className="text-sm">Create your first version to start tracking changes</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Compare Versions Tab */}
          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Version 1</Label>
                <Select 
                  value={selectedVersion || ''} 
                  onValueChange={setSelectedVersion}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.versionNumber} - {new Date(version.createdAt).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Version 2</Label>
                <Select 
                  value={compareVersion || ''} 
                  onValueChange={setCompareVersion}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.versionNumber} - {new Date(version.createdAt).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedVersion && compareVersion ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{getComparisonLabel()}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Comparing versions...</p>
                    </div>
                  ) : versionCompare?.differences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p>No differences found between these versions</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-3">
                        {versionCompare?.differences.map((diff, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getDiffTypeBadge(diff.type)}>
                                {diff.type.charAt(0).toUpperCase() + diff.type.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm">{diff.description}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ArrowLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select two versions to compare</p>
                <p className="text-sm">Choose from the dropdowns above</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <div>
            {activeTab === 'history' && selectedVersion && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveTab('compare')
                  // Set the compare version to the previous version if possible
                  const _selectedVersionObj = versions.find(v => v.id === selectedVersion)
                  const selectedIndex = versions.findIndex(v => v.id === selectedVersion)
                  if (selectedIndex < versions.length - 1) {
                    setCompareVersion(versions[selectedIndex + 1].id)
                  } else if (selectedIndex > 0) {
                    setCompareVersion(versions[selectedIndex - 1].id)
                  }
                }}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Compare Selected
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
