"use client"

import { useState, useEffect, useCallback, useRef, RefObject } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music,
  Archive,
  Search,
  Filter,
  Grid3x3,
  List,
  Download,
  Share2,
  Trash2,
  Star,
  FolderPlus,
  Folder,
  Calendar,
  FileSpreadsheet,
  FileType,
  FileCode,
  MoreHorizontal,
  Crown,
  Sparkles,
  Eye,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  TrendingUp,
  Clock,
  HardDrive,
  Tag,
  Plus,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import FilePreviewModal from "@/components/file-preview-modal"

interface BriefcaseFile {
  id: string
  name: string
  type: string
  size: number
  category: string
  description?: string
  tags?: string
  createdAt: string
  updatedAt: string
}

interface Folder {
  id: string
  name: string
  description?: string
  created_at: string
  color: string
  file_count: number
}

export default function BriefcasePage() {
  const [files, setFiles] = useState<BriefcaseFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewFile, setPreviewFile] = useState<BriefcaseFile | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  
  // Mobile optimization state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastTouchY, setLastTouchY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Advanced search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type' | 'modified'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchFilters, setSearchFilters] = useState({
    fileSize: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    tags: [],
    showFavorites: false,
    fileTypes: [],
    folders: []
  })
  const [savedSearches, setSavedSearches] = useState<Array<{
    id: string
    name: string
    query: string
    category: string
    filters: typeof searchFilters
    sortBy: typeof sortBy
    sortOrder: typeof sortOrder
    createdAt: Date
  }>>([])
  
  // Search suggestions and autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const { toast } = useToast()

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/briefcase?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching files:', error)
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchTerm, toast])

  // Initial load
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      formData.append('category', selectedCategory)
      formData.append('description', '')
      formData.append('tags', '')

      const response = await fetch('/api/briefcase/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      
      toast({
        title: "Success!",
        description: `Uploaded ${result.files.length} file(s) successfully.`
      })

      setShowUploadDialog(false)
      fetchFiles() // Refresh the file list
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file preview
  const handleFilePreview = (file: BriefcaseFile, index: number) => {
    setPreviewFile(file)
    setPreviewIndex(index)
    setShowPreviewModal(true)
  }

  // Handle file download
  const handleFileDownload = async (file: BriefcaseFile) => {
    try {
      const response = await fetch(`/api/briefcase/${file.id}/download`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: `${file.name} is being downloaded.`
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle file deletion
  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/briefcase/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      toast({
        title: "File Deleted",
        description: "File has been deleted successfully."
      })

      fetchFiles() // Refresh the file list
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5" />
    if (type.includes('video')) return <Video className="w-5 h-5" />
    if (type.includes('audio')) return <Music className="w-5 h-5" />
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />
    if (type.includes('code') || type.includes('text')) return <FileCode className="w-5 h-5" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-5 h-5" />
    return <FileType className="w-5 h-5" />
  }

  // Filter files based on search and category
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 space-y-6" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
                Briefcase
              </h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Your secure document vault and content library</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFolderDialog(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="archive">Archives</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Files Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading files...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first file to get started'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={viewMode === 'grid' 
                ? "group relative bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                : "group flex items-center space-x-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer p-4"
              }
              onClick={() => handleFilePreview(file, index)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileDownload(file)
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileDownload(file)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileDelete(file.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Select files to upload to your briefcase
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">Files</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isUploading}
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        files={filteredFiles}
        currentIndex={previewIndex}
        onIndexChange={setPreviewIndex}
      />
    </div>
  )
}
