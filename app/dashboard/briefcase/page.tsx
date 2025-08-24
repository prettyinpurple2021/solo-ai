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
  Tag
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import FilePreviewModal from "@/components/file-preview-modal"

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
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    type: 'file' | 'tag' | 'category' | 'history' | 'description' | 'content'
    value: string
    count?: number
    icon?: string
    fileId?: string
    snippet?: string
  }>>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Full-text search state
  const [enableFullTextSearch, setEnableFullTextSearch] = useState(true)
  const [fileContentIndex, setFileContentIndex] = useState<Record<string, {
    content: string
    indexed: boolean
    lastIndexed: Date
  }>>({})
  
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
  
  // Full-text content indexing using real document parsing
  const indexFileContent = useCallback(async (file: BriefcaseFile): Promise<string | null> => {
    try {
      // Check if we already have cached content
      const cachedContent = fileContentIndex[file.id]
      if (cachedContent && cachedContent.indexed && 
          (Date.now() - cachedContent.lastIndexed.getTime()) < 3600000) { // 1 hour cache
        return cachedContent.content
      }

      // Call the parsing API
      const formData = new FormData()
      formData.append('fileId', file.id)
      formData.append('filePath', file.storage_path)
      formData.append('mimeType', file.mime_type)
      formData.append('fileName', file.name)
      
      const response = await fetch('/api/briefcase/parse-content', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        console.error(`Failed to parse content for ${file.name}: ${response.statusText}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.content) {
        return result.content.toLowerCase()
      } else {
        console.warn(`Content parsing failed for ${file.name}: ${result.error}`)
        return null
      }
      
    } catch (error) {
      console.error(`Failed to index content for ${file.name}:`, error)
      return null
    }
  }, [fileContentIndex])
  
  // Index all files on load and when files change
  useEffect(() => {
    if (!enableFullTextSearch) return
    
    const indexFiles = async () => {
      const newIndex = { ...fileContentIndex }
      let hasChanges = false
      
      for (const file of files) {
        // Skip if already indexed recently (within 1 hour)
        const existing = fileContentIndex[file.id]
        if (existing && existing.indexed && 
            (Date.now() - existing.lastIndexed.getTime()) < 3600000) {
          continue
        }
        
        const content = await indexFileContent(file)
        if (content !== null) {
          newIndex[file.id] = {
            content,
            indexed: true,
            lastIndexed: new Date()
          }
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        setFileContentIndex(newIndex)
      }
    }
    
    if (files.length > 0) {
      indexFiles()
    }
  }, [files, enableFullTextSearch, indexFileContent])
  
  // Generate search suggestions based on files and search term
  const generateSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      // Show recent searches when no query
      const suggestions = searchHistory.slice(0, 5).map(term => ({
        type: 'history' as const,
        value: term,
        icon: '🕐'
      }))
      setSearchSuggestions(suggestions)
      return
    }
    
    const lowerQuery = query.toLowerCase()
    const suggestions: Array<{
      type: 'file' | 'tag' | 'category' | 'history' | 'description' | 'content'
      value: string
      count?: number
      icon?: string
      fileId?: string
      snippet?: string
    }> = []
    
    // File name suggestions
    const fileMatches = files
      .filter(file => file.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .map(file => ({
        type: 'file' as const,
        value: file.name,
        icon: getFileTypeIcon(file.mime_type)
      }))
    
    // Tag suggestions
    const allTags = Array.from(new Set(files.flatMap(f => f.tags)))
    const tagMatches = allTags
      .filter(tag => tag.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(tag => {
        const count = files.filter(f => f.tags.includes(tag)).length
        return {
          type: 'tag' as const,
          value: tag,
          count,
          icon: '🏷️'
        }
      })
    
    // Category suggestions
    const categories = Array.from(new Set(files.map(f => f.category)))
    const categoryMatches = categories
      .filter(category => category.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .map(category => {
        const count = files.filter(f => f.category === category).length
        return {
          type: 'category' as const,
          value: category,
          count,
          icon: getCategoryIcon(category)
        }
      })
    
    // Description suggestions
    const descriptionMatches = files
      .filter(file => file.description?.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(file => ({
        type: 'description' as const,
        value: file.description || '',
        icon: '📝'
      }))
    
    // Content suggestions (full-text search matches)
    const contentMatches = enableFullTextSearch ? files
      .filter(file => {
        const content = fileContentIndex[file.id]
        return content?.indexed && content.content.includes(lowerQuery)
      })
      .slice(0, 3)
      .map(file => {
        const content = fileContentIndex[file.id].content
        const matchIndex = content.indexOf(lowerQuery)
        const start = Math.max(0, matchIndex - 20)
        const end = Math.min(content.length, matchIndex + lowerQuery.length + 20)
        const snippet = content.substring(start, end)
        
        return {
          type: 'content' as const,
          value: file.name,
          fileId: file.id,
          snippet: `...${snippet}...`,
          icon: '🔍'
        }
      }) : []
    
    // History suggestions that match
    const historyMatches = searchHistory
      .filter(term => term.toLowerCase().includes(lowerQuery) && term !== query)
      .slice(0, 2)
      .map(term => ({
        type: 'history' as const,
        value: term,
        icon: '🕐'
      }))
    
    // Combine all suggestions with priority: files > content > tags > categories > descriptions > history
    suggestions.push(...fileMatches, ...contentMatches, ...tagMatches, ...categoryMatches, ...descriptionMatches, ...historyMatches)
    
    setSearchSuggestions(suggestions.slice(0, 8))
  }, [files, searchHistory])
  
  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.trim()) {
      generateSearchSuggestions(value)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSearchSuggestions([])
    }
  }, [generateSearchSuggestions])
  
  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    if (searchTerm.trim()) {
      generateSearchSuggestions(searchTerm)
      setShowSuggestions(true)
    } else if (searchHistory.length > 0) {
      generateSearchSuggestions('')
      setShowSuggestions(true)
    }
  }, [searchTerm, searchHistory, generateSearchSuggestions])
  
  // Handle search input blur (with delay to allow clicks)
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 150)
  }, [])
  
  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: typeof searchSuggestions[0]) => {
    if (suggestion.type === 'tag') {
      // Add to tag filter instead of search term
      setSearchFilters(prev => ({
        ...prev,
        tags: prev.tags.includes(suggestion.value) 
          ? prev.tags 
          : [...prev.tags, suggestion.value]
      }))
      setSearchTerm('')
    } else if (suggestion.type === 'category') {
      // Set category filter
      setSelectedCategory(suggestion.value)
      setSearchTerm('')
    } else {
      // Set search term
      setSearchTerm(suggestion.value)
      
      // Add to search history if not already there
      if (!searchHistory.includes(suggestion.value)) {
        setSearchHistory(prev => [suggestion.value, ...prev.slice(0, 9)]) // Keep last 10
      }
    }
    
    setShowSuggestions(false)
    searchInputRef.current?.blur()
  }, [searchHistory, setSearchFilters, setSelectedCategory])
  
  // Save current search
  const handleSaveSearch = useCallback(() => {
    const hasFilters = searchTerm.trim() || 
                      selectedCategory !== 'all' || 
                      searchFilters.showFavorites ||
                      searchFilters.fileSize.min || 
                      searchFilters.fileSize.max ||
                      searchFilters.dateRange.start ||
                      searchFilters.dateRange.end ||
                      searchFilters.tags.length > 0
    
    if (!hasFilters) {
      toast({
        title: "No Search to Save",
        description: "Please enter a search term or apply filters before saving.",
        variant: "destructive"
      })
      return
    }
    
    const searchName = prompt('Enter a name for this saved search:')
    if (!searchName?.trim()) return
    
    const newSavedSearch = {
      id: crypto.randomUUID(),
      name: searchName.trim(),
      query: searchTerm,
      category: selectedCategory,
      filters: { ...searchFilters },
      sortBy,
      sortOrder,
      createdAt: new Date()
    }
    
    setSavedSearches(prev => [newSavedSearch, ...prev])
    
    toast({
      title: "Search Saved",
      description: `"${searchName}" has been saved successfully.`
    })
  }, [searchTerm, selectedCategory, searchFilters, sortBy, sortOrder, toast])
  
  // Apply saved search
  const handleApplySavedSearch = useCallback((savedSearch: typeof savedSearches[0]) => {
    setSearchTerm(savedSearch.query)
    setSelectedCategory(savedSearch.category)
    setSearchFilters(savedSearch.filters)
    setSortBy(savedSearch.sortBy)
    setSortOrder(savedSearch.sortOrder)
    
    toast({
      title: "Search Applied",
      description: `Applied saved search: "${savedSearch.name}"`
    })
  }, [setSearchFilters])
  
  // Delete saved search
  const handleDeleteSavedSearch = useCallback((searchId: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== searchId))
    
    toast({
      title: "Search Deleted",
      description: "Saved search has been removed."
    })
  }, [])
  
  // Load search history and saved searches from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('briefcase-search-history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
    
    const savedSearchesData = localStorage.getItem('briefcase-saved-searches')
    if (savedSearchesData) {
      const parsed = JSON.parse(savedSearchesData)
      // Convert date strings back to Date objects
      const searches = parsed.map((search: any) => ({
        ...search,
        createdAt: new Date(search.createdAt)
      }))
      setSavedSearches(searches)
    }
  }, [])
  
  // Save search history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('briefcase-search-history', JSON.stringify(searchHistory))
  }, [searchHistory])
  
  // Save saved searches to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('briefcase-saved-searches', JSON.stringify(savedSearches))
  }, [savedSearches])
  
  // Helper functions for suggestion icons
  const getFileTypeIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation')) return '📈'
    if (mimeType.includes('document')) return '📝'
    if (mimeType.includes('archive') || mimeType.includes('zip')) return '🗄️'
    return '📄'
  }
  
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'document': '📄',
      'image': '🖼️',
      'video': '🎥',
      'audio': '🎵',
      'presentation': '📊',
      'spreadsheet': '📈',
      'other': '📁'
    }
    return icons[category] || '📄'
  }
  
  // Pull to refresh handler
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setLastTouchY(e.touches[0].clientY)
  }, [])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const containerElement = containerRef.current
    
    if (containerElement && containerElement.scrollTop === 0) {
      const deltaY = currentY - lastTouchY
      
      if (deltaY > 100 && !isRefreshing) {
        // Trigger refresh
        handlePullToRefresh()
      }
    }
  }, [lastTouchY, isRefreshing])
  
  const handlePullToRefresh = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await Promise.all([fetchFiles(), fetchFolders()])
      toast({
        title: "Refreshed",
        description: "Files and folders updated successfully."
      })
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, toast])
  
  // Add touch event listeners for pull-to-refresh
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleTouchStart, handleTouchMove])

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

  // Preview file
  const handlePreviewFile = (file: BriefcaseFile) => {
    const convertedFile = {
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.mime_type,
      category: file.category,
      createdAt: new Date(file.upload_date),
      modifiedAt: new Date(file.last_modified),
      tags: file.tags,
      description: file.description,
      folderId: file.folder_id,
      favorite: file.is_favorite
    }
    
    setPreviewFile(convertedFile)
    setPreviewIndex(filteredFiles.findIndex(f => f.id === file.id))
    setShowPreviewModal(true)
  }

  // Navigate preview
  const navigatePreview = (direction: 'prev' | 'next') => {
    const currentIndex = previewIndex
    let newIndex: number
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredFiles.length - 1
    } else {
      newIndex = currentIndex < filteredFiles.length - 1 ? currentIndex + 1 : 0
    }
    
    const newFile = filteredFiles[newIndex]
    if (newFile) {
      const convertedFile = {
        id: newFile.id,
        name: newFile.name,
        size: newFile.size,
        type: newFile.mime_type,
        category: newFile.category,
        createdAt: new Date(newFile.upload_date),
        modifiedAt: new Date(newFile.last_modified),
        tags: newFile.tags,
        description: newFile.description,
        folderId: newFile.folder_id,
        favorite: newFile.is_favorite
      }
      
      setPreviewFile(convertedFile)
      setPreviewIndex(newIndex)
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

  // Filter and sort files
  const filteredFiles = (() => {
    let filtered = files.filter(file => {
      // Enhanced search with full-text content
      let matchesSearch = false
      
      if (!searchTerm.trim()) {
        matchesSearch = true
      } else {
        const lowerSearchTerm = searchTerm.toLowerCase()
        
        // Basic metadata search
        const basicMatches = file.name.toLowerCase().includes(lowerSearchTerm) ||
                           file.description?.toLowerCase().includes(lowerSearchTerm) ||
                           file.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        
        // Full-text content search (if enabled and content is indexed)
        let contentMatches = false
        if (enableFullTextSearch && fileContentIndex[file.id]?.indexed) {
          const fileContent = fileContentIndex[file.id].content
          contentMatches = fileContent.includes(lowerSearchTerm)
        }
        
        matchesSearch = basicMatches || contentMatches
      }
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || file.category === selectedCategory
      
      // Folder filter
      const matchesFolder = selectedFolder === null || file.folder_id === selectedFolder
      
      // Favorites filter
      const matchesFavorites = !searchFilters.showFavorites || file.is_favorite
      
      // File size filter
      let matchesFileSize = true
      if (searchFilters.fileSize.min || searchFilters.fileSize.max) {
        const fileSizeMB = file.size / (1024 * 1024)
        const minSize = searchFilters.fileSize.min ? parseFloat(searchFilters.fileSize.min) : 0
        const maxSize = searchFilters.fileSize.max ? parseFloat(searchFilters.fileSize.max) : Infinity
        matchesFileSize = fileSizeMB >= minSize && fileSizeMB <= maxSize
      }
      
      // Date range filter
      let matchesDateRange = true
      if (searchFilters.dateRange.start || searchFilters.dateRange.end) {
        const fileDate = new Date(file.upload_date)
        const startDate = searchFilters.dateRange.start ? new Date(searchFilters.dateRange.start) : new Date(0)
        const endDate = searchFilters.dateRange.end ? new Date(searchFilters.dateRange.end) : new Date()
        matchesDateRange = fileDate >= startDate && fileDate <= endDate
      }
      
      // Tags filter
      const matchesTags = searchFilters.tags.length === 0 || 
                         searchFilters.tags.some(tag => file.tags.includes(tag))
      
      return matchesSearch && matchesCategory && matchesFolder && 
             matchesFavorites && matchesFileSize && matchesDateRange && matchesTags
    })
    
    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
          break
        case 'modified':
          comparison = new Date(a.last_modified).getTime() - new Date(b.last_modified).getTime()
          break
        case 'type':
          comparison = a.category.localeCompare(b.category)
          break
        default:
          comparison = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return filtered
  })()

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (mimeType.includes('pdf')) return <FileType className="w-5 h-5" />
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
    <div ref={containerRef} className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
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
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 hover:border-purple-300 text-xs sm:text-sm">
                <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
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
              <Button className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white text-xs sm:text-sm">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Upload Files</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg sm:text-xl">Upload Files</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">Upload documents, images, and other files to your briefcase</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium">Files</Label>
                  <div className="mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="*/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      disabled={isUploading}
                      className="h-12 sm:h-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Select one or more files to upload</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="upload-category" className="text-sm font-medium">Category</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                      <SelectTrigger className="mt-2 h-12 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">📄 Document</SelectItem>
                        <SelectItem value="image">🖼️ Image</SelectItem>
                        <SelectItem value="video">🎥 Video</SelectItem>
                        <SelectItem value="audio">🎵 Audio</SelectItem>
                        <SelectItem value="presentation">📊 Presentation</SelectItem>
                        <SelectItem value="spreadsheet">📈 Spreadsheet</SelectItem>
                        <SelectItem value="other">📁 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="upload-folder" className="text-sm font-medium">Folder <span className="text-gray-400">(Optional)</span></Label>
                    <Select value={uploadForm.folder_id} onValueChange={(value) => setUploadForm({...uploadForm, folder_id: value})}>
                      <SelectTrigger className="mt-2 h-12 sm:h-10">
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>📂 {folder.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="upload-description" className="text-sm font-medium">Description <span className="text-gray-400">(Optional)</span></Label>
                  <Textarea
                    id="upload-description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="Describe these files..."
                    className="mt-2 min-h-[80px] resize-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="upload-tags" className="text-sm font-medium">Tags <span className="text-gray-400">(Optional)</span></Label>
                  <Input
                    id="upload-tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="Enter tags separated by commas"
                    className="mt-2 h-12 sm:h-10"
                  />
                </div>
                
                {isUploading && (
                  <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Uploading...</span>
                      <span className="text-sm text-purple-600 font-semibold">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-3" />
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

      {/* Advanced Search and Filters */}
      <Card className="border-purple-200">
        <CardContent className="p-4 space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search files, descriptions, and tags..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="pl-10 pr-12 h-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setShowSuggestions(false)
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              
              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="py-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.value}-${index}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                          <span className="text-base">{suggestion.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{suggestion.value}</span>
                              {suggestion.count && (
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.count}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {suggestion.type === 'content' && suggestion.snippet ? (
                                <span className="truncate italic">{suggestion.snippet}</span>
                              ) : (
                                <span className="capitalize">
                                  {suggestion.type === 'history' ? 'Recent search' : suggestion.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              variant={showAdvancedSearch ? 'default' : 'outline'}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Advanced</span>
              {showAdvancedSearch ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="document">📄 Documents</SelectItem>
                <SelectItem value="image">🖼️ Images</SelectItem>
                <SelectItem value="video">🎥 Videos</SelectItem>
                <SelectItem value="audio">🎵 Audio</SelectItem>
                <SelectItem value="presentation">📊 Presentations</SelectItem>
                <SelectItem value="spreadsheet">📈 Spreadsheets</SelectItem>
                <SelectItem value="other">📁 Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={searchFilters.showFavorites ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchFilters(prev => ({ ...prev, showFavorites: !prev.showFavorites }))}
            >
              <Star className="w-4 h-4 mr-2" />
              Favorites
            </Button>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [sort, order] = value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(sort)
              setSortOrder(order)
            }}>
              <SelectTrigger className="w-32">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="size-desc">Largest First</SelectItem>
                <SelectItem value="size-asc">Smallest First</SelectItem>
                <SelectItem value="type-asc">Type A-Z</SelectItem>
                <SelectItem value="modified-desc">Recently Modified</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 ml-auto">
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
          
          {/* Advanced Search Panel */}
          <AnimatePresence>
            {showAdvancedSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t pt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* File Size Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      File Size
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Min (MB)"
                        value={searchFilters.fileSize.min}
                        onChange={(e) => setSearchFilters(prev => ({
                          ...prev,
                          fileSize: { ...prev.fileSize, min: e.target.value }
                        }))}
                        className="text-xs"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <Input
                        placeholder="Max (MB)"
                        value={searchFilters.fileSize.max}
                        onChange={(e) => setSearchFilters(prev => ({
                          ...prev,
                          fileSize: { ...prev.fileSize, max: e.target.value }
                        }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Range
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={searchFilters.dateRange.start}
                        onChange={(e) => setSearchFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="text-xs"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <Input
                        type="date"
                        value={searchFilters.dateRange.end}
                        onChange={(e) => setSearchFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(files.flatMap(f => f.tags))).slice(0, 8).map(tag => (
                        <Button
                          key={tag}
                          variant={searchFilters.tags.includes(tag) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSearchFilters(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag)
                                ? prev.tags.filter(t => t !== tag)
                                : [...prev.tags, tag]
                            }))
                          }}
                          className="text-xs h-7"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchFilters({
                          fileSize: { min: '', max: '' },
                          dateRange: { start: '', end: '' },
                          tags: [],
                          showFavorites: false,
                          fileTypes: [],
                          folders: []
                        })
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveSearch}>
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      Save Search
                    </Button>
                    <span className="text-sm text-gray-500">
                      {filteredFiles.length} results
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

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
                        
                        <h3 
                          className="font-medium text-sm mb-2 truncate cursor-pointer hover:text-purple-600 transition-colors" 
                          title={file.name}
                          onClick={() => handlePreviewFile(file)}
                        >
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePreviewFile(file)}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
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

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={previewFile}
        files={filteredFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.mime_type,
          category: f.category,
          createdAt: new Date(f.upload_date),
          modifiedAt: new Date(f.last_modified),
          tags: f.tags,
          description: f.description,
          folderId: f.folder_id,
          favorite: f.is_favorite
        }))}
        currentIndex={previewIndex}
        onNavigate={navigatePreview}
      />
    </div>
  )
}
