"use client"

import, { useState, useEffect } from 'react'
import { logError } from '@/lib/logger'
import { motion,} from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'


import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  BarChart3,
  LineChart,
  Zap,
  Crown,
  ArrowRight,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PredictiveInsight {
  id: string
  type: 'trend' | 'anomaly' | 'forecast' | 'recommendation' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: 'productivity' | 'engagement' | 'performance' | 'business' | 'user_behavior'
  timeframe: 'short_term' | 'medium_term' | 'long_term'
  data: {
    current?: number
    predicted?: number
    change?: number
    changePercent?: number
    historicalData?: number[]
    factors?: string[]
  }
  recommendations?: string[]
  actionable: boolean
  priority: number
  createdAt: string
  expiresAt?: string
}

interface BusinessForecast {
  timeframe: '7d' | '30d' | '90d' | '1y'
  metrics: {
    userGrowth: number[]
    revenue: number[]
    engagement: number[]
    churn: number[]
    featureAdoption: Record<string, number[]>
  }
  confidence: number
  factors: string[]
  assumptions: string[]
}

interface AnomalyDetection {
  id: string
  type: 'performance' | 'user_behavior' | 'business_metric' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: string
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  impact: string
  recommendations: string[]
}

interface PredictiveInsightsDashboardProps {
  className?: string
}

export default function PredictiveInsightsDashboard({ className = "" }: PredictiveInsightsDashboardProps) {
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [forecast, setForecast] = useState<BusinessForecast (null)
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string (null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPredictiveInsights()
  }, [selectedTimeframe])

  const fetchPredictiveInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        includeForecast: 'true',
        includeAnomalies: 'true'
      })

      const response = await fetch(`/api/analytics/predictive?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch predictive insights')
      }

      const result = await response.json()
      
      if (result.success) {
        setInsights(result.data.insights || [])
        setForecast(result.data.forecast || null)
        setAnomalies(result.data.anomalies || [])
      } else {
        throw new Error(result.error || 'Failed to load insights')
      }
    } catch (error) {
      logError('Error fetching predictive insights:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPredictiveInsights()
    setRefreshing(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />
      case 'forecast': return <LineChart className="w-4 h-4" />
      case 'recommendation': return <Target className="w-4 h-4" />
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-dark-card text-gray-300 border-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />
      case 'engagement': return <Users className="w-4 h-4" />
      case 'performance': return <BarChart3 className="w-4 h-4" />
      case 'business': return <Crown className="w-4 h-4" />
      case 'user_behavior': return <Eye className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory)

  const highPriorityInsights = filteredInsights.filter(insight => insight.priority >= 7)
  const actionableInsights = filteredInsights.filter(insight => insight.actionable)

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Predictive Insights</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Predictive Insights</h2>
            <p className="text-gray-600">AI-powered analytics and predictions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insights</p>
                <p className="text-2xl font-bold text-purple-600">{insights.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highPriorityInsights.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actionable</p>
                <p className="text-2xl font-bold text-green-600">{actionableInsights.length}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies</p>
                <p className="text-2xl font-bold text-red-600">{anomalies.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Timeframe:</span>
          <div className="flex gap-1">
            {['7d', '30d', '90d', '1y'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe as any)}
                className="h-8 px-3"
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <div className="flex gap-1">
            {['all', 'productivity', 'engagement', 'performance', 'business', 'user_behavior'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-8 px-3"
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              {/* Priority indicator */}
              {insight.priority >= 8 && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500" />
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">{insight.description}</p>
                
                {/* Data visualization */}
                {insight.data && (
                  <div className="space-y-2">
                    {insight.data.current !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Current:</span>
                        <span className="font-medium">{insight.data.current}</span>
                      </div>
                    )}
                    {insight.data.changePercent !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Change:</span>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          insight.data.changePercent > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {insight.data.changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(insight.data.changePercent)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recommendations */}
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Recommendations:</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Action button */}
                {insight.actionable && (
                  <Button size="sm" className="w-full">
                    Take Action
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Forecast Section */}
      {forecast && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              Business Forecast ({forecast.timeframe})
            </CardTitle>
            <CardDescription>
              AI-powered predictions with {forecast.confidence}% confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">User Growth</p>
                <p className="text-2xl font-bold text-blue-600">
                  {forecast.metrics.userGrowth[forecast.metrics.userGrowth.length - 1]}
                </p>
                <p className="text-xs text-green-600">+{forecast.metrics.userGrowth[forecast.metrics.userGrowth.length - 1] - forecast.metrics.userGrowth[0]}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${forecast.metrics.revenue[forecast.metrics.revenue.length - 1]}
                </p>
                <p className="text-xs text-green-600">+{forecast.metrics.revenue[forecast.metrics.revenue.length - 1] - forecast.metrics.revenue[0]}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">
                  {forecast.metrics.engagement[forecast.metrics.engagement.length - 1]}%
                </p>
                <p className="text-xs text-green-600">+{forecast.metrics.engagement[forecast.metrics.engagement.length - 1] - forecast.metrics.engagement[0]}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-600">
                  {forecast.metrics.churn[forecast.metrics.churn.length - 1]}%
                </p>
                <p className="text-xs text-green-600">-{forecast.metrics.churn[0] - forecast.metrics.churn[forecast.metrics.churn.length - 1]}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies Section */}
      {anomalies.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Detected Anomalies
            </CardTitle>
            <CardDescription>
              Unusual patterns detected in your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex items-start gap-3 p-3 bg-dark-card rounded-sm border">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    anomaly.severity === 'critical' ? "bg-red-100 text-red-600" :
                    anomaly.severity === 'high' ? "bg-orange-100 text-orange-600" :
                    anomaly.severity === 'medium' ? "bg-yellow-100 text-yellow-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{anomaly.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">{anomaly.impact}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Expected: {anomaly.expectedValue.toFixed(2)}</span>
                      <span>Actual: {anomaly.actualValue.toFixed(2)}</span>
                      <span>Deviation: {anomaly.deviation.toFixed(2)}σ</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={getImpactColor(anomaly.severity)}>
                    {anomaly.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
