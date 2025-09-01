"use client"

import { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Globe,
  Shield,
  Target,
  Zap,
  Clock,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"

import { BossCard, EmpowermentCard, StatsCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loading } from "@/components/ui/loading"
import { Progress } from "@/components/ui/progress"

interface CompetitorActivity {
  id: string
  competitorId: number
  competitorName: string
  competitorDomain?: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  activityType: 'website_change' | 'social_post' | 'news_mention' | 'job_posting' | 'product_launch' | 'pricing_change'
  title: string
  description: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  sourceUrl?: string
  timestamp: string
  analysisResults?: {
    agentId: string
    insights: string[]
    recommendations: string[]
    confidence: number
  }[]
}

interface ThreatMatrix {
  competitorId: number
  name: string
  domain?: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  marketOverlap: number
  recentActivity: number
  alertCount: number
  lastAnalyzed: string
  competitiveAdvantages: string[]
  vulnerabilities: string[]
}

interface IntelligenceDashboardStats {
  totalCompetitors: number
  activeMonitoring: number
  criticalThreats: number
  recentAlerts: number
  intelligenceCollected: number
  opportunitiesIdentified: number
  activitiesLast24h: number
  activitiesLast7d: number
  avgThreatLevel: number
  monitoringCoverage: number
}

interface IntelligenceDashboardProps {
  className?: string
}

export function IntelligenceDashboard({ className }: IntelligenceDashboardProps) {
  const [stats, setStats] = useState<IntelligenceDashboardStats | null>(null)
  const [activities, setActivities] = useState<CompetitorActivity[]>([])
  const [threatMatrix, setThreatMatrix] = useState<ThreatMatrix[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<string>("24h")
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [threatFilter, setThreatFilter] = useState<string>("all")

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/competitors/intelligence/dashboard?timeRange=${timeRange}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch recent activities
      const activitiesResponse = await fetch(`/api/competitors/intelligence/activities?timeRange=${timeRange}&limit=50`)
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.activities || [])
      }

      // Fetch threat matrix
      const threatResponse = await fetch('/api/competitors/intelligence/threat-matrix')
      if (threatResponse.ok) {
        const threatData = await threatResponse.json()
        setThreatMatrix(threatData.competitors || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website_change': return <Globe className="w-4 h-4" />
      case 'social_post': return <Activity className="w-4 h-4" />
      case 'news_mention': return <BarChart3 className="w-4 h-4" />
      case 'job_posting': return <Target className="w-4 h-4" />
      case 'product_launch': return <Zap className="w-4 h-4" />
      case 'pricing_change': return <TrendingUp className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'website_change': return 'text-blue-500'
      case 'social_post': return 'text-green-500'
      case 'news_mention': return 'text-purple-500'
      case 'job_posting': return 'text-orange-500'
      case 'product_launch': return 'text-red-500'
      case 'pricing_change': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
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

  const getThreatLevelBadge = (level: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getImportanceBadge = (importance: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[importance as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredActivities = activities.filter(activity => {
    const matchesType = activityFilter === "all" || activity.activityType === activityFilter
    const matchesThreat = threatFilter === "all" || activity.importance === threatFilter
    return matchesType && matchesThreat
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          variant="boss" 
          size="lg" 
          text="Loading intelligence dashboard..."
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center"
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">
                  Intelligence Dashboard 📊
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Real-time competitive intelligence and threat monitoring
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <BossButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </BossButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <StatsCard
              title="Total Competitors"
              value={stats.totalCompetitors}
              icon={<Eye className="w-6 h-6 text-white" />}
              trend={{ value: 12, isPositive: true }}
            />
            
            <StatsCard
              title="Active Monitoring"
              value={stats.activeMonitoring}
              icon={<Shield className="w-6 h-6 text-white" />}
              trend={{ value: 8, isPositive: true }}
            />
            
            <StatsCard
              title="Critical Threats"
              value={stats.criticalThreats}
              icon={<AlertTriangle className="w-6 h-6 text-white" />}
              trend={{ value: 2, isPositive: false }}
            />
            
            <StatsCard
              title="Recent Alerts"
              value={stats.recentAlerts}
              icon={<Activity className="w-6 h-6 text-white" />}
              trend={{ value: 15, isPositive: true }}
            />
            
            <StatsCard
              title="Intelligence Collected"
              value={stats.intelligenceCollected}
              icon={<Globe className="w-6 h-6 text-white" />}
              trend={{ value: 25, isPositive: true }}
            />
            
            <StatsCard
              title="Opportunities"
              value={stats.opportunitiesIdentified}
              icon={<Target className="w-6 h-6 text-white" />}
              trend={{ value: 18, isPositive: true }}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Activity Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <Activity className="w-6 h-6" />
                  <span>Real-time Activity Feed</span>
                </h2>
                <div className="flex items-center gap-2">
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="website_change">Website Changes</SelectItem>
                      <SelectItem value="social_post">Social Posts</SelectItem>
                      <SelectItem value="news_mention">News Mentions</SelectItem>
                      <SelectItem value="job_posting">Job Postings</SelectItem>
                      <SelectItem value="product_launch">Product Launches</SelectItem>
                      <SelectItem value="pricing_change">Pricing Changes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={threatFilter} onValueChange={setThreatFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-4 p-4 glass rounded-xl hover-lift"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.activityType)} bg-opacity-20`}>
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm">{activity.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {activity.competitorName} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getImportanceBadge(activity.importance)}
                            >
                              {activity.importance.toUpperCase()}
                            </Badge>
                            <div 
                              className={`w-2 h-2 rounded-full ${getThreatLevelColor(activity.threatLevel)}`}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {activity.description}
                        </p>
                        {activity.analysisResults && activity.analysisResults.length > 0 && (
                          <div className="space-y-2">
                            {activity.analysisResults.map((result, idx) => (
                              <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{result.agentId} Analysis</span>
                                  <span className="text-gray-500">{Math.round(result.confidence * 100)}% confidence</span>
                                </div>
                                {result.insights.length > 0 && (
                                  <div className="mb-1">
                                    <span className="font-medium">Insights:</span>
                                    <ul className="list-disc list-inside ml-2">
                                      {result.insights.slice(0, 2).map((insight, i) => (
                                        <li key={i} className="text-gray-600 dark:text-gray-400">{insight}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.recommendations.length > 0 && (
                                  <div>
                                    <span className="font-medium">Recommendations:</span>
                                    <ul className="list-disc list-inside ml-2">
                                      {result.recommendations.slice(0, 1).map((rec, i) => (
                                        <li key={i} className="text-gray-600 dark:text-gray-400">{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {activityFilter !== "all" || threatFilter !== "all" 
                        ? "No activities match your filters" 
                        : "No recent competitor activities"
                      }
                    </p>
                    {(activityFilter !== "all" || threatFilter !== "all") && (
                      <BossButton 
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setActivityFilter("all")
                          setThreatFilter("all")
                        }}
                      >
                        Clear Filters
                      </BossButton>
                    )}
                  </div>
                )}
              </div>
            </EmpowermentCard>
          </motion.div>

          {/* Competitive Threat Matrix */}
          <motion.div variants={itemVariants}>
            <BossCard variant="danger">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Threat Matrix</span>
                </h2>
                <ZapButton size="sm">
                  View All
                </ZapButton>
              </div>
              
              <div className="space-y-4">
                {threatMatrix.length > 0 ? (
                  threatMatrix.slice(0, 8).map((competitor, index) => (
                    <motion.div
                      key={competitor.competitorId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 glass rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getThreatLevelColor(competitor.threatLevel)}`}
                          />
                          <h3 className="font-semibold text-sm">{competitor.name}</h3>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getThreatLevelBadge(competitor.threatLevel)}
                        >
                          {competitor.threatLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Market Overlap</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={competitor.marketOverlap} className="w-16 h-1" />
                            <span className="font-medium">{competitor.marketOverlap}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Recent Activity</span>
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">{competitor.recentActivity}</span>
                          </div>
                        </div>
                        
                        {competitor.alertCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Active Alerts</span>
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              <span className="font-medium text-orange-600">{competitor.alertCount}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-500 text-xs">
                            Last analyzed: {new Date(competitor.lastAnalyzed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No threat data available</p>
                  </div>
                )}
              </div>
            </BossCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}