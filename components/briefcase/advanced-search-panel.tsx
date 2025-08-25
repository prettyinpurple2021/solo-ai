"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  FileType, 
  Hash, 
  User, 
  HardDrive,
  Sparkles,
  Folder,
  Clock,
  Star,
  Download,
  Eye,
  Edit,
  Share2,
  RotateCcw,
  SlidersHorizontal,
  Brain,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

export interface SearchFilters {
  query: string
  semantic: boolean
  fileTypes: string[]
  categories: string[]
  tags: string[]
  dateRange?: DateRange
  sizeRange: [number, number]
  authors: string[]
  favorites: boolean
  folders: string[]
  sortBy: 'relevance' | 'date' | 'name' | 'size'
  sortOrder: 'asc' | 'desc'
  includeContent: boolean
  includeComments: boolean
}

interface SearchSuggestion {
  type: 'query' | 'tag' | 'author' | 'folder' | 'fileType'
  value: string
  label: string
  count?: number
  icon?: React.ReactNode
}

interface AdvancedSearchPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: (filters: SearchFilters) => void
  availableFileTypes: string[]
  availableCategories: string[]
  availableTags: { name: string; count: number }[]
  availableAuthors: { name: string; id: string; count: number }[]
  availableFolders: { name: string; id: string; count: number }[]
  totalFiles: number
  className?: string
}

export default function AdvancedSearchPanel({
  filters,
  onFiltersChange,
  onSearch,
  availableFileTypes,
  availableCategories,
  availableTags,
  availableAuthors,
  availableFolders,
  totalFiles,
  className = ""
}: AdvancedSearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [savedSearches, setSavedSearches] = useState<Array<{
    name: string
    filters: SearchFilters
    created: Date
  }>>([])
  
  const { toast } = useToast()

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (filters.query.trim()) count++
    if (filters.fileTypes.length > 0) count++
    if (filters.categories.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    if (filters.sizeRange[0] > 0 || filters.sizeRange[1] < 1000) count++
    if (filters.authors.length > 0) count++
    if (filters.favorites) count++
    if (filters.folders.length > 0) count++
    setActiveFiltersCount(count)
  }, [filters])

  // Generate search suggestions based on query
  const generateSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([])
      return
    }

    const suggestions: SearchSuggestion[] = []

    // Tag suggestions
    availableTags
      .filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(tag => {
        suggestions.push({
          type: 'tag',
          value: tag.name,
          label: `Tag: ${tag.name}`,
          count: tag.count,
          icon: <Hash className="w-4 h-4" />
        })
      })

    // Author suggestions
    availableAuthors
      .filter(author => author.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(author => {
        suggestions.push({
          type: 'author',
          value: author.id,
          label: `Author: ${author.name}`,
          count: author.count,
          icon: <User className="w-4 h-4" />
        })
      })

    // Folder suggestions
    availableFolders
      .filter(folder => folder.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(folder => {
        suggestions.push({
          type: 'folder',
          value: folder.id,
          label: `Folder: ${folder.name}`,
          count: folder.count,
          icon: <Folder className="w-4 h-4" />
        })
      })

    // File type suggestions
    availableFileTypes
      .filter(type => type.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(type => {
        suggestions.push({
          type: 'fileType',
          value: type,
          label: `File type: ${type.toUpperCase()}`,
          icon: <FileType className="w-4 h-4" />
        })
      })

    // If semantic search is enabled, add AI suggestions
    if (filters.semantic && query.length > 5) {
      try {
        const response = await fetch('/api/briefcase/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, semantic: true })
        })
        
        if (response.ok) {
          const aiSuggestions = await response.json()
          aiSuggestions.forEach((suggestion: any) => {
            suggestions.unshift({
              type: 'query',
              value: suggestion.query,
              label: suggestion.label,
              icon: <Brain className="w-4 h-4" />
            })
          })
        }
      } catch (error) {
        console.error('Failed to get AI suggestions:', error)
      }
    }

    setSearchSuggestions(suggestions.slice(0, 8))
  }, [filters.semantic, availableTags, availableAuthors, availableFolders, availableFileTypes])

  // Handle query change with debounced suggestions
  const handleQueryChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, query: value })
    
    // Debounce suggestions
    const timer = setTimeout(() => {
      generateSuggestions(value)
      setShowSuggestions(value.length > 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, onFiltersChange, generateSuggestions])

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: SearchSuggestion) => {
    const newFilters = { ...filters }
    
    switch (suggestion.type) {
      case 'query':
        newFilters.query = suggestion.value
        break
      case 'tag':
        if (!newFilters.tags.includes(suggestion.value)) {
          newFilters.tags = [...newFilters.tags, suggestion.value]
        }
        break
      case 'author':
        if (!newFilters.authors.includes(suggestion.value)) {
          newFilters.authors = [...newFilters.authors, suggestion.value]
        }
        break
      case 'folder':
        if (!newFilters.folders.includes(suggestion.value)) {
          newFilters.folders = [...newFilters.folders, suggestion.value]
        }
        break
      case 'fileType':
        if (!newFilters.fileTypes.includes(suggestion.value)) {
          newFilters.fileTypes = [...newFilters.fileTypes, suggestion.value]
        }
        break
    }
    
    onFiltersChange(newFilters)
    setShowSuggestions(false)
    onSearch(newFilters)
  }, [filters, onFiltersChange, onSearch])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      semantic: false,
      fileTypes: [],
      categories: [],
      tags: [],
      dateRange: undefined,
      sizeRange: [0, 1000],
      authors: [],
      favorites: false,
      folders: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeContent: true,
      includeComments: false
    }
    onFiltersChange(clearedFilters)
    onSearch(clearedFilters)
  }, [onFiltersChange, onSearch])

  // Save current search
  const saveCurrentSearch = useCallback(() => {
    const name = prompt('Enter a name for this search:')
    if (name) {
      const newSearch = {
        name,
        filters: { ...filters },
        created: new Date()
      }
      setSavedSearches(prev => [newSearch, ...prev.slice(0, 4)]) // Keep only 5 recent
      
      toast({
        title: "Search saved",
        description: `Saved search "${name}" successfully`,
      })
    }
  }, [filters, toast])

  // Load saved search
  const loadSavedSearch = useCallback((savedFilters: SearchFilters) => {
    onFiltersChange(savedFilters)
    onSearch(savedFilters)
    
    toast({
      title: "Search loaded",
      description: "Applied saved search filters",
    })
  }, [onFiltersChange, onSearch, toast])

  // Format file size for display
  const formatFileSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(1)} GB`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={filters.semantic ? "Search with AI (describe what you're looking for)..." : "Search files..."}
                  value={filters.query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(filters.query.length > 1)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 pr-12"
                />
                {filters.query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQueryChange('')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, semantic: !filters.semantic })}
                    className={`h-6 w-6 p-0 ${filters.semantic ? 'text-purple-600' : 'text-gray-400'}`}
                    title={filters.semantic ? 'AI Search enabled' : 'Enable AI Search'}
                  >
                    {filters.semantic ? <Brain className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Button onClick={() => onSearch(filters)} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto"
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                    >
                      {suggestion.icon}
                      <div>
                        <div className="text-sm font-medium">{suggestion.label}</div>
                        {suggestion.count && (
                          <div className="text-xs text-gray-500">{suggestion.count} files</div>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {filters.fileTypes.map((type) => (
                <Badge key={type} variant="outline" className="flex items-center gap-1">
                  <FileType className="w-3 h-3" />
                  {type}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({
                      ...filters,
                      fileTypes: filters.fileTypes.filter(t => t !== type)
                    })}
                  />
                </Badge>
              ))}
              
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({
                      ...filters,
                      tags: filters.tags.filter(t => t !== tag)
                    })}
                  />
                </Badge>
              ))}
              
              {filters.favorites && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Favorites
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, favorites: false })}
                  />
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Advanced Search Filters
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
                        <Star className="w-3 h-3 mr-1" />
                        Save Search
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Refine your search with detailed filters and sorting options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                  </TabsList>

                  {/* Basic Filters */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>File Types</Label>
                        <Select 
                          onValueChange={(value) => {
                            if (!filters.fileTypes.includes(value)) {
                              onFiltersChange({
                                ...filters,
                                fileTypes: [...filters.fileTypes, value]
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select file types" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFileTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Categories</Label>
                        <Select 
                          onValueChange={(value) => {
                            if (!filters.categories.includes(value)) {
                              onFiltersChange({
                                ...filters,
                                categories: [...filters.categories, value]
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select categories" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Date Range</Label>
                      <DatePickerWithRange
                        date={filters.dateRange}
                        setDate={(range) => onFiltersChange({ ...filters, dateRange: range })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>File Size Range (MB): {formatFileSize(filters.sizeRange[0])} - {formatFileSize(filters.sizeRange[1])}</Label>
                      <Slider
                        value={filters.sizeRange}
                        onValueChange={(value) => onFiltersChange({ ...filters, sizeRange: value as [number, number] })}
                        max={1000}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.favorites}
                        onCheckedChange={(checked) => onFiltersChange({ ...filters, favorites: checked })}
                      />
                      <Label>Favorites only</Label>
                    </div>
                  </TabsContent>

                  {/* Content Filters */}
                  <TabsContent value="content" className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.includeContent}
                        onCheckedChange={(checked) => onFiltersChange({ ...filters, includeContent: checked })}
                      />
                      <Label>Search inside file content</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.includeComments}
                        onCheckedChange={(checked) => onFiltersChange({ ...filters, includeComments: checked })}
                      />
                      <Label>Include comments and annotations</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.semantic}
                        onCheckedChange={(checked) => onFiltersChange({ ...filters, semantic: checked })}
                      />
                      <Label className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI-powered semantic search
                      </Label>
                    </div>

                    {filters.semantic && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">AI Search Active</span>
                        </div>
                        <p className="text-sm text-purple-700">
                          Describe what you're looking for in natural language. AI will understand context and find semantically relevant files.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Metadata Filters */}
                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Sort by</Label>
                        <Select 
                          value={filters.sortBy} 
                          onValueChange={(value: any) => onFiltersChange({ ...filters, sortBy: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">
                              <div className="flex items-center gap-2">
                                <Target className="w-3 h-3" />
                                Relevance
                              </div>
                            </SelectItem>
                            <SelectItem value="date">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Date Modified
                              </div>
                            </SelectItem>
                            <SelectItem value="name">
                              <div className="flex items-center gap-2">
                                <FileType className="w-3 h-3" />
                                Name
                              </div>
                            </SelectItem>
                            <SelectItem value="size">
                              <div className="flex items-center gap-2">
                                <HardDrive className="w-3 h-3" />
                                File Size
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Sort order</Label>
                        <Select 
                          value={filters.sortOrder} 
                          onValueChange={(value: any) => onFiltersChange({ ...filters, sortOrder: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Popular Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableTags.slice(0, 10).map((tag) => (
                          <Button
                            key={tag.name}
                            variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newTags = filters.tags.includes(tag.name)
                                ? filters.tags.filter(t => t !== tag.name)
                                : [...filters.tags, tag.name]
                              onFiltersChange({ ...filters, tags: newTags })
                            }}
                            className="text-xs"
                          >
                            <Hash className="w-3 h-3 mr-1" />
                            {tag.name} ({tag.count})
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Saved Searches */}
                  <TabsContent value="saved" className="space-y-4">
                    {savedSearches.length > 0 ? (
                      <div className="space-y-2">
                        {savedSearches.map((search, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{search.name}</div>
                              <div className="text-sm text-gray-500">
                                Saved {search.created.toLocaleDateString()}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadSavedSearch(search.filters)}
                            >
                              Load
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No saved searches yet</p>
                        <p className="text-sm">Save your complex searches for quick access</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Statistics */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''} applied
              </span>
              <span>
                Searching {totalFiles.toLocaleString()} files
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
