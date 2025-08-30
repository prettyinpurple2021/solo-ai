"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { _motion } from 'framer-motion'
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  HardDrive,
  Files,
  Users,
  Eye,
  Share2,
  Star,
  Hash,
  FolderOpen,
  FileType,
  Brain,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  RefreshCw,
  Crown,
  Shield,
  Globe
} from 'lucide-react'

interface DashboardStats {
  totalFiles: number
  totalSize: string
  storageUsed: number
  storageLimit: number
  filesThisMonth: number
  growthRate: number
  topCategories: Array<{ name: string; count: number; size: string }>
  recentActivity: Array<{
    id: string
    action: string
    fileName: string
    user: string
    timestamp: Date
    type: 'upload' | 'view' | 'edit' | 'share' | 'delete'
  }>
  popularFiles: Array<{
    id: string
    name: string
    views: number
    shares: number
    size: string
    type: string
  }>
}

interface AIInsightsOverview {
  totalAnalyzed: number
  averageSentiment: 'positive' | 'negative' | 'neutral'
  topTopics: Array<{ name: string; count: number }>
  automatedTags: number
  categorized: number
  pendingAnalysis: number
}

interface CollaborationStats {
  activeShares: number
  totalCollaborators: number
  recentCollaborators: Array<{
    name: string
    avatar?: string
    lastAccess: Date
    filesAccessed: number
  }>
  shareActivity: Array<{
    fileName: string
    sharedWith: number
    lastActivity: Date
  }>
}

interface StorageAnalytics {
  byCategory: Array<{ name: string; size: number; percentage: number }>
  byFileType: Array<{ type: string; count: number; size: number }>
  trends: Array<{ month: string; size: number }>
  largeSuggestions: Array<{
    fileName: string
    size: string
    lastAccessed: Date
    suggestion: string
  }>
}

interface EnhancedDashboardProps {
  className?: string
}

export default function EnhancedDashboard({ className = "" }: EnhancedDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsightsOverview | null>(null)
  const [collaboration, setCollaboration] = useState<CollaborationStats | null>(null)
  const [storage, setStorage] = useState<StorageAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai-insights' | 'collaboration'>('overview')

  const { toast } = useToast()

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [timeRange, loadDashboardData])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, aiRes, collabRes, storageRes] = await Promise.all([
        fetch(`/api/briefcase/dashboard/stats?timeRange=${timeRange}`),
        fetch(`/api/briefcase/dashboard/ai-insights?timeRange=${timeRange}`),
        fetch(`/api/briefcase/dashboard/collaboration?timeRange=${timeRange}`),
        fetch(`/api/briefcase/dashboard/storage?timeRange=${timeRange}`)
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (aiRes.ok) {
        const aiData = await aiRes.json()
        setAiInsights(aiData)
      }

      if (collabRes.ok) {
        const collabData = await collabRes.json()
        setCollaboration(collabData)
      }

      if (storageRes.ok) {
        const storageData = await storageRes.json()
        setStorage(storageData)
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [timeRange, toast])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
    return `${(bytes / 1073741824).toFixed(1)} GB`
  }

  // Get trend icon
  const getTrendIcon = (rate: number) => {
    if (rate > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (rate < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Plus className="w-4 h-4 text-blue-600" />
      case 'view': return <Eye className="w-4 h-4 text-green-600" />
      case 'edit': return <FileType className="w-4 h-4 text-purple-600" />
      case 'share': return <Share2 className="w-4 h-4 text-orange-600" />
      case 'delete': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  // Get sentiment display
  const getSentimentDisplay = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { color: 'text-green-600', bg: 'bg-green-100', label: 'Positive' }
      case 'negative': return { color: 'text-red-600', bg: 'bg-red-100', label: 'Negative' }
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Neutral' }
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            Briefcase Analytics
          </h1>
          <p className="text-gray-600">Comprehensive insights into your document management</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Files className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    Total Files
                    {getTrendIcon(stats.growthRate)}
                    <span className={stats.growthRate > 0 ? 'text-green-600' : stats.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}>
                      {Math.abs(stats.growthRate)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <HardDrive className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalSize}</div>
                  <div className="text-sm text-gray-600">
                    Storage Used
                  </div>
                  <Progress 
                    value={(stats.storageUsed / stats.storageLimit) * 100} 
                    className="h-1 mt-1" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.filesThisMonth}</div>
                  <div className="text-sm text-gray-600">Files This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Brain className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{aiInsights?.totalAnalyzed || 0}</div>
                  <div className="text-sm text-gray-600">AI Analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={(value: 'overview' | 'analytics' | 'ai-insights' | 'collaboration') => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {stats?.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{activity.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {activity.action} by {activity.user} • {activity.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Popular Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Most Popular Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {stats?.popularFiles.map((file, index) => (
                      <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded text-xs font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {file.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              {file.shares} shares
                            </span>
                            <span>{file.size}</span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No popular files yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {stats?.topCategories.map((category, index) => (
                  <div key={category.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge variant="outline">{category.count} files</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{category.size}</div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 col-span-3">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No categories available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {storage && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Storage by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Storage by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {storage.byCategory.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={category.percentage} className="w-20 h-2" />
                          <span className="text-xs text-gray-600 w-12">{category.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* File Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileType className="w-5 h-5" />
                    File Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {storage.byFileType.slice(0, 6).map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <span className="text-sm font-mono uppercase">{type.type}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{type.count} files</span>
                          <span>•</span>
                          <span>{formatFileSize(type.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Storage Optimization */}
          {storage?.largeSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Storage Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storage.largeSuggestions.map((suggestion, _index) => (
                                          <div key={_index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <div className="font-medium">{suggestion.fileName}</div>
                        <div className="text-sm text-gray-600">{suggestion.suggestion}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {suggestion.size} • Last accessed {suggestion.lastAccessed.toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Archive
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          {aiInsights && (
            <>
              {/* AI Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{aiInsights.totalAnalyzed}</div>
                        <div className="text-sm text-gray-600">Documents Analyzed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getSentimentDisplay(aiInsights.averageSentiment).bg}`}>
                        <Sparkles className={`w-6 h-6 ${getSentimentDisplay(aiInsights.averageSentiment).color}`} />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{getSentimentDisplay(aiInsights.averageSentiment).label}</div>
                        <div className="text-sm text-gray-600">Average Sentiment</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Hash className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{aiInsights.automatedTags}</div>
                        <div className="text-sm text-gray-600">Auto-Generated Tags</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Most Common Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {aiInsights.topTopics.map((topic, index) => (
                      <div key={topic.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-sm font-medium text-purple-600">
                            {index + 1}
                          </div>
                          <span className="font-medium">{topic.name}</span>
                        </div>
                        <Badge variant="outline">{topic.count} docs</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Analysis Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{aiInsights.totalAnalyzed}</div>
                      <div className="text-sm text-gray-600">Analyzed</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{aiInsights.categorized}</div>
                      <div className="text-sm text-gray-600">Categorized</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{aiInsights.pendingAnalysis}</div>
                      <div className="text-sm text-gray-600">Pending Analysis</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          {collaboration && (
            <>
              {/* Collaboration Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Share2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{collaboration.activeShares}</div>
                        <div className="text-sm text-gray-600">Active Shares</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{collaboration.totalCollaborators}</div>
                        <div className="text-sm text-gray-600">Total Collaborators</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Globe className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{collaboration.shareActivity.length}</div>
                        <div className="text-sm text-gray-600">Shared Documents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Collaborators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Recent Collaborators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {collaboration.recentCollaborators.map((collaborator, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={collaborator.avatar} />
                              <AvatarFallback>
                                {collaborator.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{collaborator.name}</div>
                              <div className="text-xs text-gray-500">
                                {collaborator.filesAccessed} files • Last active {collaborator.lastAccess.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Share Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {collaboration.shareActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{activity.fileName}</div>
                              <div className="text-xs text-gray-500">
                                Shared with {activity.sharedWith} people • {activity.lastActivity.toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline">{activity.sharedWith}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
