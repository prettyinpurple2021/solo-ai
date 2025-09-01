"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Globe,
  Users,
  Activity,
  Briefcase,
  Smartphone,
  FileText,
  Calendar,
  Tag,
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  ExternalLink,
  Eye,
  MoreVertical,
  Star,
  Bookmark,
  Share,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Clock,
  BarChart3,
  Zap,
  Filter,
  Search
} from "lucide-react"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton } from "@/components/ui/boss-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface IntelligenceItem {
  id: number
  competitorId: number
  sourceType: string
  sourceUrl?: string
  dataType: string
  extractedData: {
    title?: string
    content?: string
    metadata?: Record<string, any>
    entities?: Array<{
      text: string
      type: string
      confidence: number
    }>
    sentiment?: {
      score: number
      magnitude: number
      label: string
    }
    topics?: string[]
    keyInsights?: string[]
  }
  analysisResults: Array<{
    agentId: string
    analysisType: string
    insights: Array<{
      id: string
      type: string
      title: string
      description: string
      confidence: number
      impact: string
      urgency: string
      supportingData?: any[]
    }>
    recommendations: Array<{
      id: string
      type: string
      title: string
      description: string
      priority: string
      estimatedEffort: string
      potentialImpact: string
      timeline: string
      actionItems?: string[]
    }>
    confidence: number
    analyzedAt: string
  }>
  confidence: number
  importance: string
  tags: string[]
  collectedAt: string
  processedAt?: string
  competitor?: {
    id: number
    name: string
    domain?: string
    threatLevel: string
  }
}

interface SearchStats {
  totalResults: number
  hasQuery: boolean
  appliedFilters: {
    competitors: number
    sourceTypes: number
    dataTypes: number
    importance: number
    tags: number
    agents: number
    dateRange: boolean
    confidenceRange: boolean
    hasAnalysis: boolean
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface IntelligenceResultsProps {
  intelligence: IntelligenceItem[]
  searchStats: SearchStats
  pagination: Pagination
  loading?: boolean
  onPageChange: (page: number) => void
  onItemSelect: (id: number) => void
  onBulkAction: (action: string, ids: number[]) => void
  selectedItems?: number[]
}

const sourceTypeIcons = {
  website: Globe,
  social_media: Users,
  news: Activity,
  job_posting: Briefcase,
  app_store: Smartphone,
  manual: FileText,
}

const importanceColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const threatLevelColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const agentColors: Record<string, string> = {
  echo: 'text-pink-600',
  blaze: 'text-orange-600',
  nova: 'text-blue-600',
  lexi: 'text-purple-600',
  roxy: 'text-red-600',
  glitch: 'text-green-600',
  vex: 'text-indigo-600',
  lumi: 'text-yellow-600',
}

export function IntelligenceResults({
  intelligence,
  searchStats,
  pagination,
  loading = false,
  onPageChange,
  onItemSelect,
  onBulkAction,
  selectedItems = []
}: IntelligenceResultsProps) {
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [newTags, setNewTags] = useState("")
  const [tagOperation, setTagOperation] = useState<'add' | 'remove' | 'replace'>('add')

  const handleSelectAll = () => {
    if (selectedItems.length === intelligence.length) {
      onBulkAction('deselect-all', [])
    } else {
      onBulkAction('select-all', intelligence.map(item => item.id))
    }
  }

  const handleBulkTag = () => {
    if (newTags.trim() && selectedItems.length > 0) {
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean)
      onBulkAction(`tag-${tagOperation}`, selectedItems)
      setShowTagDialog(false)
      setNewTags("")
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-green-500" />
      case 'threat': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'recommendation': return <Lightbulb className="w-4 h-4 text-yellow-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <BossCard key={i} className="animate-pulse">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </BossCard>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <EmpowermentCard>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gradient">
              Search Results
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {searchStats.totalResults.toLocaleString()} results found
              </span>
              {searchStats.hasQuery && (
                <span className="flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Full-text search active
                </span>
              )}
              {Object.values(searchStats.appliedFilters).some(Boolean) && (
                <span className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  {Object.values(searchStats.appliedFilters).filter(Boolean).length} filters applied
                </span>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagDialog(true)}
              >
                <Tag className="w-4 h-4 mr-2" />
                Manage Tags
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('export', selectedItems)}
              >
                Export Selected
              </Button>
            </div>
          )}
        </div>

        {/* Select All */}
        {intelligence.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Checkbox
              checked={selectedItems.length === intelligence.length}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm cursor-pointer" onClick={handleSelectAll}>
              Select all {intelligence.length} results
            </Label>
          </div>
        )}
      </EmpowermentCard>

      {/* Results List */}
      {intelligence.length === 0 ? (
        <EmpowermentCard>
          <div className="text-center py-12">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-auto w-20 h-20 gradient-danger rounded-full flex items-center justify-center mb-6"
            >
              <Search className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gradient mb-4">
              No intelligence data found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or filters to find relevant intelligence data.
            </p>
            <BossButton onClick={() => window.location.reload()}>
              Refresh Search
            </BossButton>
          </div>
        </EmpowermentCard>
      ) : (
        <div className="space-y-4">
          {intelligence.map((item, index) => {
            const SourceIcon = sourceTypeIcons[item.sourceType as keyof typeof sourceTypeIcons] || Activity
            const isSelected = selectedItems.includes(item.id)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BossCard
                  variant="default"
                  interactive
                  className={`${isSelected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onItemSelect(item.id)}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <SourceIcon className="w-5 h-5 text-gray-500" />
                            <h4 className="font-semibold text-lg">
                              {item.extractedData.title || item.dataType}
                            </h4>
                            <Badge
                              variant="outline"
                              className={importanceColors[item.importance as keyof typeof importanceColors]}
                            >
                              {item.importance.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Competitor Info */}
                          {item.competitor && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">Competitor:</span>
                              <span className="font-medium">{item.competitor.name}</span>
                              {item.competitor.domain && (
                                <span className="text-gray-500">({item.competitor.domain})</span>
                              )}
                              <Badge
                                variant="outline"
                                className={threatLevelColors[item.competitor.threatLevel as keyof typeof threatLevelColors]}
                              >
                                {item.competitor.threatLevel}
                              </Badge>
                            </div>
                          )}

                          {/* Content Preview */}
                          {item.extractedData.content && (
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                              {item.extractedData.content}
                            </p>
                          )}

                          {/* Key Insights */}
                          {item.extractedData.keyInsights && item.extractedData.keyInsights.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Key Insights:
                              </span>
                              <div className="space-y-1">
                                {item.extractedData.keyInsights.slice(0, 2).map((insight, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                                  </div>
                                ))}
                                {item.extractedData.keyInsights.length > 2 && (
                                  <span className="text-sm text-gray-500">
                                    +{item.extractedData.keyInsights.length - 2} more insights
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onItemSelect(item.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Bookmark className="w-4 h-4 mr-2" />
                            Bookmark
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Tags
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* AI Analysis Results */}
                    {item.analysisResults.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            AI Analysis ({item.analysisResults.length} agents)
                          </h5>
                          
                          {item.analysisResults.slice(0, 2).map((analysis, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium capitalize ${agentColors[analysis.agentId] || 'text-gray-600'}`}>
                                  {analysis.agentId}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Progress value={analysis.confidence * 100} className="w-16 h-2" />
                                  <span className="text-xs text-gray-500">
                                    {Math.round(analysis.confidence * 100)}%
                                  </span>
                                </div>
                              </div>

                              {/* Top Insights */}
                              {analysis.insights.slice(0, 2).map((insight, insightIdx) => (
                                <div key={insightIdx} className="flex items-start gap-2">
                                  {getInsightIcon(insight.type)}
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{insight.title}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getUrgencyColor(insight.urgency)}`}
                                      >
                                        {insight.urgency}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                      {insight.description}
                                    </p>
                                  </div>
                                </div>
                              ))}

                              {analysis.insights.length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{analysis.insights.length - 2} more insights
                                </div>
                              )}
                            </div>
                          ))}

                          {item.analysisResults.length > 2 && (
                            <div className="text-sm text-gray-500 text-center">
                              +{item.analysisResults.length - 2} more agent analyses
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(item.collectedAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{Math.round(item.confidence * 100)}% confidence</span>
                        </div>

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Source
                          </a>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </BossCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <EmpowermentCard>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total.toLocaleString()} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                })}
                
                {pagination.totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </EmpowermentCard>
      )}

      {/* Bulk Tag Management Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add, remove, or replace tags for {selectedItems.length} selected intelligence items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-operation">Operation</Label>
              <Select value={tagOperation} onValueChange={(value: any) => setTagOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add tags</SelectItem>
                  <SelectItem value="remove">Remove tags</SelectItem>
                  <SelectItem value="replace">Replace all tags</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="new-tags">Tags (comma-separated)</Label>
              <Input
                id="new-tags"
                placeholder="e.g., pricing, competitive-analysis, urgent"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <BossButton onClick={handleBulkTag} disabled={!newTags.trim()}>
              Apply Tags
            </BossButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}