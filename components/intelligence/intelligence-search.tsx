"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  X,
  Save,
  Star,
  Download,
  Tag,
  Calendar,
  Users,
  Globe,
  Activity,
  Briefcase,
  Smartphone,
  FileText,
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Clock,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  Bookmark,
  History,
  Trash2,
  Edit,
  Plus,
  Check,
  Loader2
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IntelligenceSearchFilters {
  query?: string
  competitorIds?: number[]
  sourceTypes?: string[]
  dataTypes?: string[]
  importance?: string[]
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
  agentAnalysis?: string[]
  confidenceRange?: {
    min: number
    max: number
  }
  hasAnalysis?: boolean
  sortBy?: string
  sortOrder?: string
}

interface SavedSearch {
  id: number
  name: string
  description?: string
  searchParams: IntelligenceSearchFilters
  isFavorite: boolean
  lastUsed?: string
  useCount: number
  createdAt: string
  updatedAt: string
}

interface Competitor {
  id: number
  name: string
  domain?: string
  threatLevel: string
}

interface Tag {
  tag: string
  usageCount: number
}

interface IntelligenceSearchProps {
  onSearch: (filters: IntelligenceSearchFilters) => void
  onExport: (filters: IntelligenceSearchFilters, format: string) => void
  competitors: Competitor[]
  loading?: boolean
  initialFilters?: IntelligenceSearchFilters
}

const sourceTypeOptions = [
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'social_media', label: 'Social Media', icon: Users },
  { value: 'news', label: 'News', icon: Activity },
  { value: 'job_posting', label: 'Job Postings', icon: Briefcase },
  { value: 'app_store', label: 'App Store', icon: Smartphone },
  { value: 'manual', label: 'Manual Entry', icon: FileText },
]

const importanceOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
]

const agentOptions = [
  { value: 'echo', label: 'Echo', color: 'text-pink-600' },
  { value: 'blaze', label: 'Blaze', color: 'text-orange-600' },
  { value: 'nova', label: 'Nova', color: 'text-blue-600' },
  { value: 'lexi', label: 'Lexi', color: 'text-purple-600' },
  { value: 'roxy', label: 'Roxy', color: 'text-red-600' },
  { value: 'glitch', label: 'Glitch', color: 'text-green-600' },
  { value: 'vex', label: 'Vex', color: 'text-indigo-600' },
  { value: 'lumi', label: 'Lumi', color: 'text-yellow-600' },
]

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'collectedAt', label: 'Collection Date' },
  { value: 'processedAt', label: 'Processing Date' },
  { value: 'importance', label: 'Importance' },
  { value: 'confidence', label: 'Confidence' },
]

export function IntelligenceSearch({
  onSearch,
  onExport,
  competitors,
  loading = false,
  initialFilters = {}
}: IntelligenceSearchProps) {
  const [filters, setFilters] = useState<IntelligenceSearchFilters>(initialFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [availableDataTypes, setAvailableDataTypes] = useState<string[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [saveSearchName, setSaveSearchName] = useState("")
  const [saveSearchDescription, setSaveSearchDescription] = useState("")
  const [saveSearchFavorite, setSaveSearchFavorite] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [loadingSavedSearches, setLoadingSavedSearches] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)

  // Debounce search query
  const debouncedQuery = useDebounce(filters.query || "", 300)

  // Load saved searches and tags on mount
  useEffect(() => {
    loadSavedSearches()
    loadTags()
    loadDataTypes()
  }, [])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== (initialFilters.query || "")) {
      handleSearch()
    }
  }, [debouncedQuery])

  const loadSavedSearches = async () => {
    try {
      setLoadingSavedSearches(true)
      const response = await fetch('/api/intelligence/saved-searches')
      if (response.ok) {
        const data = await response.json()
        setSavedSearches(data.savedSearches || [])
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    } finally {
      setLoadingSavedSearches(false)
    }
  }

  const loadTags = async (query?: string) => {
    try {
      setLoadingTags(true)
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      
      const response = await fetch(`/api/intelligence/tags?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableTags([...data.userTags, ...data.suggestedTags])
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoadingTags(false)
    }
  }

  const loadDataTypes = async () => {
    // This would typically come from an API endpoint
    // For now, we'll use common data types
    setAvailableDataTypes([
      'pricing_update',
      'product_launch',
      'job_posting',
      'social_post',
      'news_mention',
      'website_change',
      'funding_announcement',
      'partnership',
      'acquisition',
      'leadership_change',
      'marketing_campaign',
      'technical_update',
      'customer_review',
      'competitor_analysis',
    ])
  }

  const handleSearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleFilterChange = (key: keyof IntelligenceSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayFilterToggle = (key: keyof IntelligenceSearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = (prev[key] as string[]) || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [key]: newArray.length > 0 ? newArray : undefined
      }
    })
  }

  const clearFilters = () => {
    setFilters({ query: filters.query }) // Keep search query, clear everything else
  }

  const clearAllFilters = () => {
    setFilters({})
  }

  const saveSearch = async () => {
    if (!saveSearchName.trim()) return

    try {
      const response = await fetch('/api/intelligence/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveSearchName.trim(),
          description: saveSearchDescription.trim() || undefined,
          searchParams: filters,
          isFavorite: saveSearchFavorite,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSavedSearches(prev => [data.savedSearch, ...prev])
        setShowSaveDialog(false)
        setSaveSearchName("")
        setSaveSearchDescription("")
        setSaveSearchFavorite(false)
      }
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  const loadSavedSearch = async (searchId: number) => {
    try {
      const response = await fetch(`/api/intelligence/saved-searches/${searchId}`)
      if (response.ok) {
        const data = await response.json()
        setFilters(data.savedSearch.searchParams)
        setShowSavedSearches(false)
        // Update the saved search in the list with new usage stats
        setSavedSearches(prev => 
          prev.map(search => 
            search.id === searchId 
              ? { ...search, lastUsed: data.savedSearch.lastUsed, useCount: data.savedSearch.useCount }
              : search
          )
        )
      }
    } catch (error) {
      console.error('Error loading saved search:', error)
    }
  }

  const deleteSavedSearch = async (searchId: number) => {
    try {
      const response = await fetch(`/api/intelligence/saved-searches/${searchId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedSearches(prev => prev.filter(search => search.id !== searchId))
      }
    } catch (error) {
      console.error('Error deleting saved search:', error)
    }
  }

  const handleExport = (format: string) => {
    onExport(filters, format)
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.competitorIds?.length) count++
    if (filters.sourceTypes?.length) count++
    if (filters.dataTypes?.length) count++
    if (filters.importance?.length) count++
    if (filters.dateRange) count++
    if (filters.tags?.length) count++
    if (filters.agentAnalysis?.length) count++
    if (filters.confidenceRange) count++
    if (filters.hasAnalysis !== undefined) count++
    return count
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <EmpowermentCard>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search intelligence data... (e.g., 'pricing changes', 'product launch', 'hiring')"
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-12 pr-4 h-12 text-lg"
            />
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('query', "")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedSearches(true)}
              className="flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Saved Searches
              {savedSearches.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {savedSearches.length}
                </Badge>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>

                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                      <DialogDescription>
                        Save your current search filters for quick access later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input
                          id="search-name"
                          placeholder="e.g., 'Critical Pricing Updates'"
                          value={saveSearchName}
                          onChange={(e) => setSaveSearchName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="search-description">Description (Optional)</Label>
                        <Textarea
                          id="search-description"
                          placeholder="Describe what this search is for..."
                          value={saveSearchDescription}
                          onChange={(e) => setSaveSearchDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="favorite"
                          checked={saveSearchFavorite}
                          onCheckedChange={(checked) => setSaveSearchFavorite(checked as boolean)}
                        />
                        <Label htmlFor="favorite">Mark as favorite</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <BossButton onClick={saveSearch} disabled={!saveSearchName.trim()}>
                        Save Search
                      </BossButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('json')}
                    className="w-full justify-start"
                  >
                    Export as JSON
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    className="w-full justify-start"
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('xlsx')}
                    className="w-full justify-start"
                  >
                    Export as Excel
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            <BossButton
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </BossButton>
          </div>
        </div>
      </EmpowermentCard>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmpowermentCard>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gradient">Advanced Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Competitors Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Competitors</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {filters.competitorIds?.length 
                            ? `${filters.competitorIds.length} selected`
                            : "All competitors"
                          }
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <Command>
                          <CommandInput placeholder="Search competitors..." />
                          <CommandList>
                            <CommandEmpty>No competitors found.</CommandEmpty>
                            <CommandGroup>
                              {competitors.map((competitor) => (
                                <CommandItem
                                  key={competitor.id}
                                  onSelect={() => handleArrayFilterToggle('competitorIds', competitor.id.toString())}
                                >
                                  <Checkbox
                                    checked={filters.competitorIds?.includes(competitor.id) || false}
                                    className="mr-2"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">{competitor.name}</div>
                                    {competitor.domain && (
                                      <div className="text-sm text-gray-500">{competitor.domain}</div>
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      competitor.threatLevel === 'critical' ? 'border-red-200 text-red-800' :
                                      competitor.threatLevel === 'high' ? 'border-orange-200 text-orange-800' :
                                      competitor.threatLevel === 'medium' ? 'border-yellow-200 text-yellow-800' :
                                      'border-green-200 text-green-800'
                                    }`}
                                  >
                                    {competitor.threatLevel}
                                  </Badge>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Source Types Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Source Types</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {filters.sourceTypes?.length 
                            ? `${filters.sourceTypes.length} selected`
                            : "All sources"
                          }
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          {sourceTypeOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`source-${option.value}`}
                                checked={filters.sourceTypes?.includes(option.value) || false}
                                onCheckedChange={() => handleArrayFilterToggle('sourceTypes', option.value)}
                              />
                              <Label
                                htmlFor={`source-${option.value}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <option.icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Importance Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Importance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {filters.importance?.length 
                            ? `${filters.importance.length} selected`
                            : "All levels"
                          }
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48">
                        <div className="space-y-2">
                          {importanceOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`importance-${option.value}`}
                                checked={filters.importance?.includes(option.value) || false}
                                onCheckedChange={() => handleArrayFilterToggle('importance', option.value)}
                              />
                              <Label
                                htmlFor={`importance-${option.value}`}
                                className="cursor-pointer"
                              >
                                <Badge className={option.color}>
                                  {option.label}
                                </Badge>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {filters.tags?.length 
                            ? `${filters.tags.length} selected`
                            : "All tags"
                          }
                          <Tag className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <Command>
                          <CommandInput 
                            placeholder="Search tags..." 
                            value={tagSearchQuery}
                            onValueChange={(value) => {
                              setTagSearchQuery(value)
                              loadTags(value)
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {loadingTags ? "Loading tags..." : "No tags found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableTags.map((tag) => (
                                <CommandItem
                                  key={tag.tag}
                                  onSelect={() => handleArrayFilterToggle('tags', tag.tag)}
                                >
                                  <Checkbox
                                    checked={filters.tags?.includes(tag.tag) || false}
                                    className="mr-2"
                                  />
                                  <div className="flex-1">
                                    <span>{tag.tag}</span>
                                    {tag.usageCount > 0 && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        {tag.usageCount}
                                      </Badge>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Agent Analysis Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Analyzed By</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {filters.agentAnalysis?.length 
                            ? `${filters.agentAnalysis.length} agents`
                            : "All agents"
                          }
                          <Brain className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48">
                        <div className="space-y-2">
                          {agentOptions.map((agent) => (
                            <div key={agent.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`agent-${agent.value}`}
                                checked={filters.agentAnalysis?.includes(agent.value) || false}
                                onCheckedChange={() => handleArrayFilterToggle('agentAnalysis', agent.value)}
                              />
                              <Label
                                htmlFor={`agent-${agent.value}`}
                                className={`cursor-pointer font-medium ${agent.color}`}
                              >
                                {agent.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <div className="flex gap-2">
                      <Select
                        value={filters.sortBy || 'relevance'}
                        onValueChange={(value) => handleFilterChange('sortBy', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filters.sortOrder || 'desc'}
                        onValueChange={(value) => handleFilterChange('sortOrder', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">↓ Desc</SelectItem>
                          <SelectItem value="asc">↑ Asc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.dateRange?.start?.split('T')[0] || ''}
                        onChange={(e) => {
                          const start = e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined
                          handleFilterChange('dateRange', start ? {
                            start,
                            end: filters.dateRange?.end || `${e.target.value}T23:59:59.999Z`
                          } : undefined)
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={filters.dateRange?.end?.split('T')[0] || ''}
                        onChange={(e) => {
                          const end = e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined
                          handleFilterChange('dateRange', end ? {
                            start: filters.dateRange?.start || `${e.target.value}T00:00:00.000Z`,
                            end
                          } : undefined)
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Confidence Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confidence Range</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="Min"
                        value={filters.confidenceRange?.min || ''}
                        onChange={(e) => {
                          const min = e.target.value ? parseFloat(e.target.value) : undefined
                          handleFilterChange('confidenceRange', min !== undefined ? {
                            min,
                            max: filters.confidenceRange?.max || 1
                          } : undefined)
                        }}
                        className="flex-1"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="Max"
                        value={filters.confidenceRange?.max || ''}
                        onChange={(e) => {
                          const max = e.target.value ? parseFloat(e.target.value) : undefined
                          handleFilterChange('confidenceRange', max !== undefined ? {
                            min: filters.confidenceRange?.min || 0,
                            max
                          } : undefined)
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Has Analysis */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Analysis Status</Label>
                    <Select
                      value={
                        filters.hasAnalysis === true ? 'analyzed' :
                        filters.hasAnalysis === false ? 'unanalyzed' : 'all'
                      }
                      onValueChange={(value) => 
                        handleFilterChange('hasAnalysis', 
                          value === 'analyzed' ? true :
                          value === 'unanalyzed' ? false : undefined
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Intelligence</SelectItem>
                        <SelectItem value="analyzed">With AI Analysis</SelectItem>
                        <SelectItem value="unanalyzed">Without Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </EmpowermentCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <EmpowermentCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Active Filters ({activeFilterCount})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.competitorIds?.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Competitors: {filters.competitorIds.length}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('competitorIds', undefined)}
                  />
                </Badge>
              )}
              {filters.sourceTypes?.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sources: {filters.sourceTypes.length}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('sourceTypes', undefined)}
                  />
                </Badge>
              )}
              {filters.importance?.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Importance: {filters.importance.length}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('importance', undefined)}
                  />
                </Badge>
              )}
              {filters.tags?.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tags: {filters.tags.length}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('tags', undefined)}
                  />
                </Badge>
              )}
              {filters.agentAnalysis?.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Agents: {filters.agentAnalysis.length}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('agentAnalysis', undefined)}
                  />
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date Range
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('dateRange', undefined)}
                  />
                </Badge>
              )}
              {filters.confidenceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Confidence: {filters.confidenceRange.min}-{filters.confidenceRange.max}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('confidenceRange', undefined)}
                  />
                </Badge>
              )}
              {filters.hasAnalysis !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.hasAnalysis ? 'With Analysis' : 'Without Analysis'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('hasAnalysis', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        </EmpowermentCard>
      )}

      {/* Saved Searches Dialog */}
      <Dialog open={showSavedSearches} onOpenChange={setShowSavedSearches}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Searches</DialogTitle>
            <DialogDescription>
              Quickly access your frequently used search filters.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {loadingSavedSearches ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : savedSearches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No saved searches yet. Create your first saved search by applying filters and clicking "Save Search".
                </div>
              ) : (
                savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => loadSavedSearch(search.id)}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{search.name}</h4>
                        {search.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      {search.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {search.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" />
                          Used {search.useCount} times
                        </span>
                        {search.lastUsed && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(search.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedSearch(search.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}