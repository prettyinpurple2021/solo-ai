"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  FileText, 
  Hash, 
  TrendingUp, 
  Minus, 
  Lightbulb, 
  Target, 
  CheckCircle,
  Sparkles,
  Zap,
  Search,
  Tag,
  Users,
  RefreshCw,
  Star,
  ArrowRight,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh
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

interface DocumentInsight {
  type: 'summary' | 'key_points' | 'sentiment' | 'category' | 'tags' | 'recommendations'
  title: string
  content: string | string[] | Record<string, any>
  confidence: number
  generated: Date
}

interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral'
  score: number
  breakdown: {
    positive: number
    negative: number
    neutral: number
  }
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
  }
}

interface KeyInsights {
  summary: string
  keyPoints: string[]
  topics: Array<{ name: string; confidence: number; relevance: string }>
  entities: Array<{ name: string; type: string; relevance: number }>
  readingTime: number
  complexity: 'low' | 'medium' | 'high'
  wordCount: number
}

interface CategoryPrediction {
  category: string
  confidence: number
  reasoning: string
}

interface AIInsightsPanelProps {
  file: BriefcaseFile | null
  onClose: () => void
  className?: string
}

export default function AIInsightsPanel({ file, onClose, className = "" }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<DocumentInsight[]>([])
  const [keyInsights, setKeyInsights] = useState<KeyInsights | null>(null)
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [categories, setCategories] = useState<CategoryPrediction[]>([])
  const [suggestedTags, setSuggestedTags] = useState<Array<{ name: string; confidence: number }>>([])
  const [loading, setLoading] = useState(false)
  const [activeInsight, setActiveInsight] = useState<'overview' | 'sentiment' | 'categories' | 'recommendations'>('overview')
  const [processingProgress, setProcessingProgress] = useState(0)
  
  const { toast } = useToast()

  // Load AI insights when file changes
  useEffect(() => {
    if (file) {
      generateInsights()
    }
  }, [file])

  const generateInsights = useCallback(async () => {
    if (!file) return
    
    setLoading(true)
    setProcessingProgress(0)
    
    try {
      // Start processing with progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch(`/api/briefcase/files/${file.id}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) throw new Error('Failed to generate insights')

      const data = await response.json()
      
      // Set all insights data
      setKeyInsights(data.keyInsights)
      setSentiment(data.sentiment)
      setCategories(data.categories)
      setSuggestedTags(data.suggestedTags)
      
      // Create insights array for display
      const newInsights: DocumentInsight[] = [
        {
          type: 'summary',
          title: 'Document Summary',
          content: data.keyInsights.summary,
          confidence: 0.95,
          generated: new Date()
        },
        {
          type: 'key_points',
          title: 'Key Points',
          content: data.keyInsights.keyPoints,
          confidence: 0.90,
          generated: new Date()
        },
        {
          type: 'sentiment',
          title: 'Sentiment Analysis',
          content: data.sentiment,
          confidence: 0.88,
          generated: new Date()
        },
        {
          type: 'category',
          title: 'Category Prediction',
          content: data.categories,
          confidence: 0.85,
          generated: new Date()
        }
      ]
      
      setInsights(newInsights)

      toast({
        title: "AI Analysis Complete",
        description: "Document insights generated successfully",
      })

    } catch (error) {
      console.error('Failed to generate insights:', error)
      toast({
        title: "Error",
        description: "Failed to analyze document with AI",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, toast])

  // Apply suggested tag
  const applySuggestedTag = useCallback(async (tagName: string) => {
    if (!file) return
    
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [tagName] })
      })
      
      if (response.ok) {
        toast({
          title: "Tag applied",
          description: `Added &quot;${tagName}&quot; to document`,
        })
        
        // Remove from suggestions
        setSuggestedTags(prev => prev.filter(tag => tag.name !== tagName))
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to apply tag",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Apply category prediction
  const applyCategory = useCallback(async (categoryName: string) => {
    if (!file) return
    
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryName })
      })
      
      if (response.ok) {
        toast({
          title: "Category updated",
          description: `Set category to &quot;${categoryName}&quot;`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Get sentiment icon and color
  const getSentimentDisplay = (sentiment: string, _score: number) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: <Smile className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Positive'
        }
      case 'negative':
        return {
          icon: <Frown className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Negative'
        }
      default:
        return {
          icon: <Meh className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Neutral'
        }
    }
  }

  // Get complexity badge
  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High Complexity</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium Complexity</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-700">Low Complexity</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 1) return 'Less than 1 minute'
    if (minutes === 1) return '1 minute'
    return `${Math.round(minutes)} minutes`
  }

  if (!file) return null

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Document Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateInsights}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>
          <CardDescription>
            AI-powered insights and analysis for &quot;{file.name}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm">Analyzing document with AI...</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
              <div className="text-xs text-gray-500 text-center">
                {processingProgress < 30 ? 'Reading document...' :
                 processingProgress < 60 ? 'Extracting insights...' :
                 processingProgress < 90 ? 'Analyzing sentiment...' :
                 'Finalizing analysis...'}
              </div>
            </div>
          )}

          {!loading && insights.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-2">No AI analysis available</p>
              <Button onClick={generateInsights} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate AI Insights
              </Button>
            </div>
          )}

          {!loading && insights.length > 0 && (
            <Tabs value={activeInsight} onValueChange={(value: any) => setActiveInsight(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="recommendations">Suggestions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {keyInsights && (
                  <div className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Reading Time</span>
                          </div>
                          <div className="text-lg font-semibold mt-1">
                            {formatReadingTime(keyInsights.readingTime)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Word Count</span>
                          </div>
                          <div className="text-lg font-semibold mt-1">
                            {keyInsights.wordCount.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Summary */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {keyInsights.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getComplexityBadge(keyInsights.complexity)}
                          <Badge variant="outline">
                            AI Confidence: {(insights.find(i => i.type === 'summary')?.confidence || 0) * 100}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Points */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Key Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {keyInsights.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Topics */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Main Topics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {keyInsights.topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{topic.name}</div>
                                <div className="text-xs text-gray-500">{topic.relevance}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={topic.confidence * 100} 
                                  className="w-16 h-2" 
                                />
                                <span className="text-xs text-gray-600">
                                  {Math.round(topic.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Sentiment Tab */}
              <TabsContent value="sentiment" className="space-y-4">
                {sentiment && (
                  <div className="space-y-4">
                    {/* Overall Sentiment */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Overall Sentiment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${getSentimentDisplay(sentiment.overall, sentiment.score).bgColor}`}>
                            <div className={getSentimentDisplay(sentiment.overall, sentiment.score).color}>
                              {getSentimentDisplay(sentiment.overall, sentiment.score).icon}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-lg">
                              {getSentimentDisplay(sentiment.overall, sentiment.score).label}
                            </div>
                            <div className="text-sm text-gray-600">
                              Confidence Score: {Math.round(sentiment.score * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sentiment Breakdown */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Detailed Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <ThumbsUp className="w-3 h-3 text-green-600" />
                              Positive
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={sentiment.breakdown.positive} className="w-20 h-2" />
                              <span className="text-xs w-8">{sentiment.breakdown.positive}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <Minus className="w-3 h-3 text-gray-600" />
                              Neutral
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={sentiment.breakdown.neutral} className="w-20 h-2" />
                              <span className="text-xs w-8">{sentiment.breakdown.neutral}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <ThumbsDown className="w-3 h-3 text-red-600" />
                              Negative
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={sentiment.breakdown.negative} className="w-20 h-2" />
                              <span className="text-xs w-8">{sentiment.breakdown.negative}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Emotional Analysis */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Emotional Tone</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(sentiment.emotions).map(([emotion, score]) => (
                            <div key={emotion} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{emotion}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={score * 100} className="w-16 h-2" />
                                <span className="text-xs text-gray-600 w-8">
                                  {Math.round(score * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Category Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{category.category}</div>
                            <div className="text-sm text-gray-600 mt-1">{category.reasoning}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={category.confidence * 100} className="w-16 h-2" />
                            <span className="text-xs text-gray-600 w-8">
                              {Math.round(category.confidence * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyCategory(category.category)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {/* Suggested Tags */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Suggested Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {suggestedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {tag.name}
                              <span className="text-xs">({Math.round(tag.confidence * 100)}%)</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applySuggestedTag(tag.name)}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tag suggestions available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Recommendations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Alert>
                        <Lightbulb className="w-4 h-4" />
                        <AlertDescription>
                          Consider organizing similar documents together based on the identified topics and categories.
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Users className="w-4 h-4" />
                        <AlertDescription>
                          This document might be valuable to share with team members working on related projects.
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Target className="w-4 h-4" />
                        <AlertDescription>
                          Based on the content analysis, consider creating a summary for quick reference.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
