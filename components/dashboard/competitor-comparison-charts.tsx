"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Globe,
  Calendar,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter
} from "lucide-react"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton } from "@/components/ui/boss-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CompetitorMetrics {
  id: number
  name: string
  domain?: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  metrics: {
    marketShare: number
    employeeCount: number
    fundingAmount: number
    socialFollowers: number
    websiteTraffic: number
    productCount: number
    recentActivity: number
    customerSentiment: number
    innovationScore: number
    marketPresence: number
  }
  trends: {
    marketShare: 'up' | 'down' | 'stable'
    employeeGrowth: 'up' | 'down' | 'stable'
    funding: 'up' | 'down' | 'stable'
    socialGrowth: 'up' | 'down' | 'stable'
  }
  lastUpdated: string
}

interface CompetitorComparisonChartsProps {
  className?: string
  selectedCompetitors?: number[]
  onCompetitorSelect?: (competitorIds: number[]) => void
}

export function CompetitorComparisonCharts({ 
  className,
  selectedCompetitors = [],
  onCompetitorSelect
}: CompetitorComparisonChartsProps) {
  const [competitors, setCompetitors] = useState<CompetitorMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonMetric, setComparisonMetric] = useState<string>("marketShare")
  const [chartType, setChartType] = useState<string>("bar")
  const [timeRange, setTimeRange] = useState<string>("30d")

  useEffect(() => {
    fetchCompetitorMetrics()
  }, [timeRange])

  const fetchCompetitorMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/competitors/intelligence/metrics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data.competitors || [])
      }
    } catch (error) {
      console.error('Error fetching competitor metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricLabel = (metric: string) => {
    const labels = {
      marketShare: 'Market Share',
      employeeCount: 'Employee Count',
      fundingAmount: 'Funding Amount',
      socialFollowers: 'Social Followers',
      websiteTraffic: 'Website Traffic',
      productCount: 'Product Count',
      recentActivity: 'Recent Activity',
      customerSentiment: 'Customer Sentiment',
      innovationScore: 'Innovation Score',
      marketPresence: 'Market Presence'
    }
    return labels[metric as keyof typeof labels] || metric
  }

  const getMetricIcon = (metric: string) => {
    const icons = {
      marketShare: <Target className="w-4 h-4" />,
      employeeCount: <Users className="w-4 h-4" />,
      fundingAmount: <DollarSign className="w-4 h-4" />,
      socialFollowers: <Users className="w-4 h-4" />,
      websiteTraffic: <Globe className="w-4 h-4" />,
      productCount: <Zap className="w-4 h-4" />,
      recentActivity: <TrendingUp className="w-4 h-4" />,
      customerSentiment: <BarChart3 className="w-4 h-4" />,
      innovationScore: <Target className="w-4 h-4" />,
      marketPresence: <Globe className="w-4 h-4" />
    }
    return icons[metric as keyof typeof icons] || <BarChart3 className="w-4 h-4" />
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-500" />
      case 'down': return <ArrowDown className="w-3 h-3 text-red-500" />
      default: return <Minus className="w-3 h-3 text-gray-500" />
    }
  }

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'marketShare':
      case 'customerSentiment':
      case 'innovationScore':
      case 'marketPresence':
        return `${value}%`
      case 'employeeCount':
      case 'productCount':
      case 'recentActivity':
        return value.toLocaleString()
      case 'fundingAmount':
        return `$${(value / 1000000).toFixed(1)}M`
      case 'socialFollowers':
        return value > 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString()
      case 'websiteTraffic':
        return `${(value / 1000).toFixed(1)}K`
      default:
        return value.toString()
    }
  }

  const getMaxValue = (metric: string) => {
    const values = competitors.map(c => c.metrics[metric as keyof typeof c.metrics])
    return Math.max(...values, 100)
  }

  const displayedCompetitors = selectedCompetitors.length > 0 
    ? competitors.filter(c => selectedCompetitors.includes(c.id))
    : competitors.slice(0, 8)

  if (loading) {
    return (
      <BossCard className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </BossCard>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header and Controls */}
        <EmpowermentCard>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gradient flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Competitor Comparison</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Compare key metrics across competitors
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketShare">Market Share</SelectItem>
                  <SelectItem value="employeeCount">Employee Count</SelectItem>
                  <SelectItem value="fundingAmount">Funding Amount</SelectItem>
                  <SelectItem value="socialFollowers">Social Followers</SelectItem>
                  <SelectItem value="websiteTraffic">Website Traffic</SelectItem>
                  <SelectItem value="productCount">Product Count</SelectItem>
                  <SelectItem value="recentActivity">Recent Activity</SelectItem>
                  <SelectItem value="customerSentiment">Customer Sentiment</SelectItem>
                  <SelectItem value="innovationScore">Innovation Score</SelectItem>
                  <SelectItem value="marketPresence">Market Presence</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </EmpowermentCard>

        {/* Chart Visualization */}
        {chartType === "bar" && (
          <BossCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center space-x-2">
                  {getMetricIcon(comparisonMetric)}
                  <span>{getMetricLabel(comparisonMetric)} Comparison</span>
                </h4>
                <div className="text-sm text-gray-500">
                  {displayedCompetitors.length} competitors
                </div>
              </div>
              
              <div className="space-y-3">
                {displayedCompetitors
                  .sort((a, b) => b.metrics[comparisonMetric as keyof typeof a.metrics] - a.metrics[comparisonMetric as keyof typeof a.metrics])
                  .map((competitor, index) => {
                    const value = competitor.metrics[comparisonMetric as keyof typeof competitor.metrics]
                    const maxValue = getMaxValue(comparisonMetric)
                    const percentage = (value / maxValue) * 100
                    
                    return (
                      <motion.div
                        key={competitor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2 w-48">
                          <div 
                            className={`w-3 h-3 rounded-full ${getThreatLevelColor(competitor.threatLevel)}`}
                          />
                          <span className="font-medium text-sm truncate">{competitor.name}</span>
                        </div>
                        
                        <div className="flex-1 flex items-center space-x-3">
                          <Progress value={percentage} className="flex-1 h-3" />
                          <span className="font-semibold text-sm w-20 text-right">
                            {formatMetricValue(comparisonMetric, value)}
                          </span>
                        </div>
                        
                        <div className="w-8 flex justify-center">
                          {getTrendIcon(competitor.trends[comparisonMetric as keyof typeof competitor.trends] || 'stable')}
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          </BossCard>
        )}

        {chartType === "comparison" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedCompetitors.map((competitor, index) => (
              <motion.div
                key={competitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BossCard>
                  <div className="space-y-4">
                    {/* Competitor Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${getThreatLevelColor(competitor.threatLevel)}`}
                        />
                        <h4 className="font-semibold">{competitor.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {competitor.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Market Share</span>
                          <span className="font-medium">{competitor.metrics.marketShare}%</span>
                        </div>
                        <Progress value={competitor.metrics.marketShare} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Employees</span>
                          <span className="font-medium">{competitor.metrics.employeeCount.toLocaleString()}</span>
                        </div>
                        <Progress value={(competitor.metrics.employeeCount / 10000) * 100} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Funding</span>
                          <span className="font-medium">${(competitor.metrics.fundingAmount / 1000000).toFixed(1)}M</span>
                        </div>
                        <Progress value={(competitor.metrics.fundingAmount / 100000000) * 100} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Activity</span>
                          <span className="font-medium">{competitor.metrics.recentActivity}</span>
                        </div>
                        <Progress value={(competitor.metrics.recentActivity / 100) * 100} className="h-1" />
                      </div>
                    </div>
                    
                    {/* Trends */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Market:</span>
                          {getTrendIcon(competitor.trends.marketShare)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Growth:</span>
                          {getTrendIcon(competitor.trends.employeeGrowth)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Social:</span>
                          {getTrendIcon(competitor.trends.socialGrowth)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(competitor.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </BossCard>
              </motion.div>
            ))}
          </div>
        )}

        {chartType === "radar" && (
          <BossCard>
            <div className="space-y-4">
              <h4 className="font-semibold">Multi-Metric Radar Comparison</h4>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Radar chart visualization coming soon
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will show multi-dimensional competitor comparison
                </p>
              </div>
            </div>
          </BossCard>
        )}

        {/* Summary Stats */}
        <EmpowermentCard>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-1">
                {displayedCompetitors.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Competitors Analyzed
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-1">
                {displayedCompetitors.filter(c => c.threatLevel === 'critical' || c.threatLevel === 'high').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                High Threat Competitors
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-1">
                {Math.round(displayedCompetitors.reduce((sum, c) => sum + c.metrics.marketShare, 0) / displayedCompetitors.length)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Market Share
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-1">
                {displayedCompetitors.reduce((sum, c) => sum + c.metrics.recentActivity, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Activities
              </div>
            </div>
          </div>
        </EmpowermentCard>
      </div>
    </div>
  )
}