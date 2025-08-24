"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  Plus,
  Star,
  FolderPlus,
  Folder,
  Calendar,
  User,
  FileSpreadsheet,
  FilePdf,
  FileCode,
  MoreHorizontal,
  Crown,
  Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface BriefcaseFile {
  id: string
  name: string
  file_type: string
  size: number
  upload_date: string
  last_modified: string
  category: string
  tags: string[]
  description?: string
  is_favorite: boolean
  folder_id?: string
  storage_path: string
  mime_type: string
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
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    category: "document",
    description: "",
    tags: "",
    folder_id: ""
  })
  
  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    color: "#8B5CF6"
  })
  
  const { toast } = useToast()

  // Fetch files and folders
  useEffect(() => {
    fetchFiles()
    fetchFolders()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/briefcase/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
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
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/briefcase/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    
    // Add all files
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    
    // Add metadata
    formData.append('category', uploadForm.category)
    formData.append('description', uploadForm.description)
    formData.append('tags', uploadForm.tags)
    formData.append('folder_id', uploadForm.folder_id)
    
    try {
      const response = await fetch('/api/briefcase/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        await fetchFiles()
        setShowUploadDialog(false)
        setUploadForm({
          category: "document",
          description: "",
          tags: "",
          folder_id: ""
        })
        toast({
          title: "Success",
          description: `Uploaded ${files.length} file(s) successfully!`
        })
      } else {
        throw new Error('Upload failed')
      }
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
  }, [uploadForm, toast])

  // Create folder
  const createFolder = async () => {
    try {
      const response = await fetch('/api/briefcase/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderForm)
      })
      
      if (response.ok) {
        await fetchFolders()
        setShowFolderDialog(false)
        setFolderForm({ name: "", description: "", color: "#8B5CF6" })
        toast({
          title: "Success",
          description: "Folder created successfully!"
        })
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Toggle favorite
  const toggleFavorite = async (fileId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/briefcase/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentStatus })
      })
      
      if (response.ok) {
        setFiles(files.map(file => 
          file.id === fileId 
            ? { ...file, is_favorite: !currentStatus }
            : file
        ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Delete file
  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/briefcase/files/${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFiles(files.filter(file => file.id !== fileId))
        toast({
          title: "Success",
          description: "File deleted successfully."
        })
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive"
      })
    }
  }

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory
    const matchesFolder = selectedFolder === null || file.folder_id === selectedFolder
    
    return matchesSearch && matchesCategory && matchesFolder
  })

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (mimeType.includes('pdf')) return <FilePdf className="w-5 h-5" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return <FileCode className="w-5 h-5" />
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Calculate storage stats
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  const storageLimit = 5 * 1024 * 1024 * 1024 // 5GB limit
  const storagePercentage = (totalSize / storageLimit) * 100

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              className="w-10 h-10 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Briefcase className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
                Briefcase
              </h1>
              <p className="text-gray-600">Your secure document vault and content library</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 hover:border-purple-300">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Organize your files into folders</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={folderForm.name}
                    onChange={(e) => setFolderForm({...folderForm, name: e.target.value})}
                    placeholder="Enter folder name"
                  />
                </div>
                <div>
                  <Label htmlFor="folder-description">Description (Optional)</Label>
                  <Textarea
                    id="folder-description"
                    value={folderForm.description}
                    onChange={(e) => setFolderForm({...folderForm, description: e.target.value})}
                    placeholder="Describe this folder"
                  />
                </div>
                <div>
                  <Label htmlFor="folder-color">Folder Color</Label>
                  <Input
                    id="folder-color"
                    type="color"
                    value={folderForm.color}
                    onChange={(e) => setFolderForm({...folderForm, color: e.target.value})}
                  />
                </div>
                <Button onClick={createFolder} className="w-full" disabled={!folderForm.name.trim()}>
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>Upload documents, images, and other files to your briefcase</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <Label htmlFor="upload-category">Category</Label>
                  <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upload-folder">Folder (Optional)</Label>
                  <Select value={uploadForm.folder_id} onValueChange={(value) => setUploadForm({...uploadForm, folder_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upload-description">Description (Optional)</Label>
                  <Textarea
                    id="upload-description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="Describe these files"
                  />
                </div>
                <div>
                  <Label htmlFor="upload-tags">Tags (Optional)</Label>
                  <Input
                    id="upload-tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Storage Stats */}
      <Card className="border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Storage Usage</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatFileSize(totalSize)} / {formatFileSize(storageLimit)}
            </span>
          </div>
          <Progress 
            value={storagePercentage} 
            className="h-2"
            style={{
              background: storagePercentage > 80 ? 'linear-gradient(to right, #ef4444, #f97316)' : 'linear-gradient(to right, #8b5cf6, #14b8a6, #ec4899)'
            }}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{files.length} files</span>
            <span>{folders.length} folders</span>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files, descriptions, and tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="presentation">Presentations</SelectItem>
            <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Folders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {folders.map((folder) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
              >
                <Card className={`transition-all hover:shadow-md ${
                  selectedFolder === folder.id ? 'ring-2 ring-purple-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: folder.color }}
                      >
                        <Folder className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{folder.name}</h3>
                        <p className="text-sm text-gray-500">{folder.file_count} files</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Files ({filteredFiles.length})
          </h2>
          {selectedFolder && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
              Show All Files
            </Button>
          )}
        </div>
        
        {filteredFiles.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Briefcase className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Your Briefcase is Empty</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedFolder ? (
                  "No files match your current filters."
                ) : (
                  "Upload your first files to get started with your secure document vault."
                )}
              </p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Files
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="group hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.mime_type)}
                            <Badge variant="secondary" className="text-xs">
                              {file.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorite(file.id, file.is_favorite)}
                            >
                              <Star className={`w-4 h-4 ${
                                file.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                              }`} />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-sm mb-2 truncate" title={file.name}>
                          {file.name}
                        </h3>
                        
                        {file.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {file.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(file.upload_date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {file.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{file.tags.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteFile(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <ScrollArea className="h-96">
                  <div className="divide-y">
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-4 hover:bg-gray-50 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFileIcon(file.mime_type)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{file.name}</h3>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(file.size)} • {file.category} • {new Date(file.upload_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorite(file.id, file.is_favorite)}
                            >
                              <Star className={`w-4 h-4 ${
                                file.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                              }`} />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteFile(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
