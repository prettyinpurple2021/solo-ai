"use client"

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search,
  Star,
  Clock,
  Users,
  Zap,
  TrendingUp,
  Briefcase,
  Filter,
  Download,
  Eye,
  Play,
  Crown,
  Heart,
  Bookmark,
  Share2,
  BarChart3,
  Target,
  CheckCircle,
  Plus,
  Info
} from 'lucide-react'
import { PrimaryButton } from '@/components/ui/button'

import { useToast } from '@/hooks/use-toast'
import { logError, logInfo } from '@/lib/logger'
import type { Workflow } from '@/lib/workflow-engine'

// Types
interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  popularity: number
  rating: number
  reviews: number
  author: {
    name: string
    avatar?: string
    verified: boolean
  }
  preview: {
    nodeCount: number
    estimatedExecutionTime: string
    requiredIntegrations: string[]
  }
  workflow: Workflow
  metadata: {
    createdAt: Date
    updatedAt: Date
    downloads: number
    likes: number
    featured: boolean
    trending: boolean
    verified: boolean
  }
}

interface WorkflowTemplatesProps {
  onSelectTemplate?: (template: WorkflowTemplate) => void
  onCreateCustom?: () => void
  className?: string
}

// Category icons
const CATEGORY_ICONS = {
  'Marketing': TrendingUp,
  'Customer Success': Users,
  'Content Marketing': Briefcase,
  'Sales': Target,
  'Social Media': Share2,
  'Customer Analytics': BarChart3
}

// Complexity colors
const COMPLEXITY_COLORS = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444'
}

export function WorkflowTemplates({ 
  onSelectTemplate, 
  onCreateCustom, 
  className = "" 
}: WorkflowTemplatesProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'newest' | 'name'>('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/workflows/templates')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
           const mappedTemplates: WorkflowTemplate[] = data.data.map((t: any) => {
             let parsedWorkflow = {} as Workflow
             try {
                parsedWorkflow = typeof t.content === 'string' ? JSON.parse(t.content) : t.content
             } catch (e) {
               logError('Failed to parse workflow content', e instanceof Error ? e : new Error(String(e)))
             }
             
             return {
               id: t.id,
               name: t.title,
               description: t.description || '',
               category: t.category || 'General',
               tags: Array.isArray(t.tags) ? t.tags : [],
               complexity: (t.difficulty?.toLowerCase() || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
               estimatedTime: `${t.estimated_minutes || 15} min`,
               popularity: Math.min(100, (t.usage_count || 0) * 10 + 50),
               rating: Number(t.rating) || 4.5,
               reviews: 0,
               author: { 
                 name: 'SoloSuccess AI', 
                 verified: true 
               },
               preview: {
                 nodeCount: parsedWorkflow.nodes ? parsedWorkflow.nodes.length : 0,
                 estimatedExecutionTime: 'Dynamic',
                 requiredIntegrations: []
               },
               workflow: parsedWorkflow,
               metadata: {
                 createdAt: new Date(t.created_at || Date.now()),
                 updatedAt: new Date(t.updated_at || Date.now()),
                 downloads: t.usage_count || 0,
                 likes: 0,
                 featured: t.is_premium || false,
                 trending: (t.usage_count || 0) > 10,
                 verified: true
               }
             }
           })
           setTemplates(mappedTemplates)
        }
      } catch (error) {
        logError('Failed to fetch templates', error)
        toast({
          title: 'Error Loading Templates',
          description: 'Could not load workflow templates. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [toast])

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  // Filter and sort templates
  useEffect(() => {
    let filtered = [...templates]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Complexity filter
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(template => template.complexity === selectedComplexity)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory, selectedComplexity, sortBy])

  // Handle template selection
  const handleSelectTemplate = useCallback((template: WorkflowTemplate) => {
    onSelectTemplate?.(template)
    logInfo('Workflow template selected', { templateId: template.id, name: template.name })
    
    toast({
      title: 'Template Selected',
      description: `${template.name} has been loaded into the workflow builder`,
      variant: 'success'
    })
  }, [onSelectTemplate, toast])

  // Handle template like
  const handleLikeTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? {
            ...template,
            metadata: {
              ...template.metadata,
              likes: template.metadata.likes + 1
            }
          }
        : template
    ))
    
    logInfo('Template liked', { templateId })
  }, [])

  // Handle template bookmark
  const handleBookmarkTemplate = useCallback((templateId: string) => {
    // In real implementation, this would save to user's bookmarks
    toast({
      title: 'Bookmarked',
      description: 'Template added to your bookmarks',
      variant: 'success'
    })
    
    logInfo('Template bookmarked', { templateId })
  }, [toast])

  // Handle template share
  const handleShareTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      navigator.clipboard.writeText(`${window.location.origin}/templates/${templateId}`)
      toast({
        title: 'Link Copied',
        description: 'Template link copied to clipboard',
        variant: 'success'
      })
    }
    
    logInfo('Template shared', { templateId })
  }, [templates, toast])

  // Render template card
  const renderTemplateCard = useCallback((template: WorkflowTemplate) => {
    const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || Briefcase
    const complexityColor = COMPLEXITY_COLORS[template.complexity]

    return (
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-full hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon className="h-4 w-4 text-purple-400" />
                <Badge 
                  variant="purple" 
                  className={`text-xs capitalize badge-complexity-${template.complexity}`}
                >
                  {template.complexity}
                </Badge>
                {template.metadata.featured && (
                  <Badge variant="cyan" className="text-xs border-yellow-500 text-yellow-500">
                    <Crown className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {template.metadata.trending && (
                  <Badge variant="cyan" className="text-xs border-green-500 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeTemplate(template.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmarkTemplate(template.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShareTemplate(template.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardTitle className="text-lg group-hover:text-purple-300 transition-colors">
              {template.name}
            </CardTitle>
            
            <CardDescription className="text-sm text-gray-400 line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="cyan" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="cyan" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Preview Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">{template.preview.nodeCount} nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">{template.preview.estimatedExecutionTime}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-gray-300">{template.rating}</span>
                    <span className="text-gray-500">({template.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">{template.metadata.downloads}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{template.popularity}%</span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 pt-2 border-t border-purple-800/30">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {template.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-300">{template.author.name}</span>
                    {template.author.verified && (
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{template.estimatedTime} setup</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <PrimaryButton
                  variant="cyan"
                  size="sm"
                  onClick={() => handleSelectTemplate(template)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Use Template
                </PrimaryButton>
                
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => {
                    // Preview template
                    logInfo('Template preview requested', { templateId: template.id })
                  }}
                  className="px-3"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </motion.div>
    )
  }, [handleLikeTemplate, handleBookmarkTemplate, handleShareTemplate, handleSelectTemplate])

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold cyber-heading">Workflow Templates</h2>
            <p className="text-gray-300 mt-1">Choose from pre-built workflows or create your own</p>
          </div>
          
          <PrimaryButton onClick={onCreateCustom}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Workflow
          </PrimaryButton>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input-dark-lg pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filters:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input-dark text-xs py-1"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
            
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="form-input-dark text-xs py-1"
              aria-label="Filter by complexity"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="form-input-dark text-xs py-1"
              aria-label="Sort by"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
            </select>

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'purple' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded" />
                  <div className="w-1 h-1 bg-current rounded" />
                  <div className="w-1 h-1 bg-current rounded" />
                  <div className="w-1 h-1 bg-current rounded" />
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'purple' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <div className="space-y-0.5">
                  <div className="w-3 h-0.5 bg-current rounded" />
                  <div className="w-3 h-0.5 bg-current rounded" />
                  <div className="w-3 h-0.5 bg-current rounded" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading templates...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Templates Found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="cyan" onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedComplexity('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            <AnimatePresence>
              {filteredTemplates.map(renderTemplateCard)}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-4 border-t border-purple-800/30 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>{filteredTemplates.length} templates found</span>
            <span>•</span>
            <span>{templates.filter(t => t.metadata.featured).length} featured</span>
            <span>•</span>
            <span>{templates.filter(t => t.metadata.trending).length} trending</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Templates are community-created and verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
