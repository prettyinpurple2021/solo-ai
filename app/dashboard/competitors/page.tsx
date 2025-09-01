"use client"

import React, { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Eye,
  AlertTriangle,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Target,
  Zap,
  MoreVertical,
  RefreshCw,
  Download,
  Settings,
  Activity,
  BarChart3,
  Map,
  Clock,
  Radar,
  Grid3X3,
  Layers,
  Crosshair
} from "lucide-react"
import Link from "next/link"

import { BossCard, EmpowermentCard, StatsCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Loading } from "@/components/ui/loading"
import { Progress } from "@/components/ui/progress"

interface Competitor {
  id: number
  name: string
  domain: string
  description: string
  industry: string
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  monitoring_status: 'active' | 'paused' | 'archived'
  employee_count: number
  funding_stage: string
  last_analyzed: string
  competitive_advantages: string[]
  vulnerabilities: string[]
  recent_activity_count: number
  alert_count: number
}

interface DashboardStats {
  total_competitors: number
  active_monitoring: number
  critical_threats: number
  recent_alerts: number
  intelligence_collected: number
  opportunities_identified: number
}

interface IntelligenceActivity {
  id: number
  competitorId: number
  competitorName: string
  type: 'website_change' | 'social_post' | 'news_mention' | 'job_posting' | 'product_launch' | 'pricing_change'
  title: string
  description: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  sourceUrl?: string
  agentAnalysis?: {
    agentId: string
    agentName: string
    insights: string[]
    recommendations: string[]
  }
}

interface ThreatMatrixData {
  competitorId: number
  name: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  marketOverlap: number
  competitiveStrength: number
  recentActivity: number
  position: { x: number; y: number }
}

interface MarketPositionData {
  competitorId: number
  name: string
  marketShare: number
  growthRate: number
  position: { x: number; y: number }
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

export default function CompetitorDashboardPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [threatFilter, setThreatFilter] = useState<string>("all")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("threat_level")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [realtimeActivities, setRealtimeActivities] = useState<IntelligenceActivity[]>([])
  const [threatMatrix, setThreatMatrix] = useState<ThreatMatrixData[]>([])
  const [marketPositioning, setMarketPositioning] = useState<MarketPositionData[]>([])
  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>([])
  const [timelineFilter, setTimelineFilter] = useState<string>("24h")

  // Fetch competitors and stats
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch competitors
      const competitorsResponse = await fetch('/api/competitors')
      if (competitorsResponse.ok) {
        const competitorsData = await competitorsResponse.json()
        setCompetitors(competitorsData.competitors || [])

        // Generate threat matrix data
        const threatMatrixData = (competitorsData.competitors || []).map((comp: Competitor, index: number) => ({
          competitorId: comp.id,
          name: comp.name,
          threatLevel: comp.threat_level,
          marketOverlap: Math.random() * 100, // Mock data - replace with real calculation
          competitiveStrength: Math.random() * 100, // Mock data - replace with real calculation
          recentActivity: comp.recent_activity_count || 0,
          position: {
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50
          }
        }))
        setThreatMatrix(threatMatrixData)

        // Generate market positioning data
        const marketPositionData = (competitorsData.competitors || []).map((comp: Competitor, index: number) => ({
          competitorId: comp.id,
          name: comp.name,
          marketShare: Math.random() * 30 + 5, // Mock data - replace with real calculation
          growthRate: (Math.random() - 0.5) * 40, // Mock data - replace with real calculation
          position: {
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50
          },
          threatLevel: comp.threat_level
        }))
        setMarketPositioning(marketPositionData)
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/competitors/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch real-time intelligence activities
      const activitiesResponse = await fetch('/api/intelligence?limit=20&sortBy=collectedAt')
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        const activities = (activitiesData.intelligence || []).map((intel: any) => ({
          id: intel.id,
          competitorId: intel.competitorId,
          competitorName: intel.competitor?.name || 'Unknown',
          type: intel.sourceType,
          title: intel.extractedData?.title || `${intel.dataType} Update`,
          description: intel.extractedData?.content || 'New intelligence collected',
          importance: intel.importance,
          timestamp: intel.collectedAt,
          sourceUrl: intel.sourceUrl,
          agentAnalysis: intel.analysisResults?.[0] ? {
            agentId: intel.analysisResults[0].agentId,
            agentName: intel.analysisResults[0].agentId.charAt(0).toUpperCase() + intel.analysisResults[0].agentId.slice(1),
            insights: intel.analysisResults[0].insights?.map((i: any) => i.description) || [],
            recommendations: intel.analysisResults[0].recommendations?.map((r: any) => r.description) || []
          } : undefined
        }))
        setRealtimeActivities(activities)
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

  // Filter and sort competitors
  const filteredCompetitors = competitors
    .filter(competitor => {
      const matchesSearch = competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competitor.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competitor.industry?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesThreat = threatFilter === "all" || competitor.threat_level === threatFilter
      const matchesIndustry = industryFilter === "all" || competitor.industry === industryFilter

      return matchesSearch && matchesThreat && matchesIndustry
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'threat_level':
          const threatOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return threatOrder[b.threat_level] - threatOrder[a.threat_level]
        case 'name':
          return a.name.localeCompare(b.name)
        case 'last_analyzed':
          return new Date(b.last_analyzed).getTime() - new Date(a.last_analyzed).getTime()
        case 'activity':
          return b.recent_activity_count - a.recent_activity_count
        default:
          return 0
      }
    })

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website_change':
      case 'website': return <Globe className="w-4 h-4" />
      case 'social_post':
      case 'social_media': return <Users className="w-4 h-4" />
      case 'news_mention':
      case 'news': return <Activity className="w-4 h-4" />
      case 'job_posting': return <Target className="w-4 h-4" />
      case 'product_launch': return <Zap className="w-4 h-4" />
      case 'pricing_change': return <BarChart3 className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getActivityColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-500 bg-red-50'
      case 'high': return 'text-orange-500 bg-orange-50'
      case 'medium': return 'text-yellow-500 bg-yellow-50'
      case 'low': return 'text-green-500 bg-green-50'
      default: return 'text-gray-500 bg-gray-50'
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
      <div className="min-h-screen gradient-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading
            variant="boss"
            size="lg"
            text="Loading competitor intelligence..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-background p-6">
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
                className="w-12 h-12 gradient-danger rounded-full flex items-center justify-center"
              >
                <Eye className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">
                  Competitor Intelligence 🕵️‍♀️
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Monitor, analyze, and dominate your competition
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BossButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </BossButton>
            <Link href="/dashboard/competitors/add">
              <ZapButton>
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor
              </ZapButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatsCard
              title="Total Competitors"
              value={stats.total_competitors}
              icon={<Users className="w-6 h-6 text-white" />}
              trend={{ value: 12, isPositive: true }}
            />

            <StatsCard
              title="Active Monitoring"
              value={stats.active_monitoring}
              icon={<Eye className="w-6 h-6 text-white" />}
              trend={{ value: 8, isPositive: true }}
            />

            <StatsCard
              title="Critical Threats"
              value={stats.critical_threats}
              icon={<AlertTriangle className="w-6 h-6 text-white" />}
              trend={{ value: 2, isPositive: false }}
            />

            <StatsCard
              title="Recent Alerts"
              value={stats.recent_alerts}
              icon={<Shield className="w-6 h-6 text-white" />}
              trend={{ value: 15, isPositive: true }}
            />

            <StatsCard
              title="Intelligence Collected"
              value={stats.intelligence_collected}
              icon={<Globe className="w-6 h-6 text-white" />}
              trend={{ value: 25, isPositive: true }}
            />

            <StatsCard
              title="Opportunities"
              value={stats.opportunities_identified}
              icon={<Target className="w-6 h-6 text-white" />}
              trend={{ value: 18, isPositive: true }}
            />
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <EmpowermentCard>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search competitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={threatFilter} onValueChange={setThreatFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Threat Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Threats</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threat_level">Threat Level</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="last_analyzed">Last Analyzed</SelectItem>
                    <SelectItem value="activity">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>

                <BossButton
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </BossButton>
              </div>
            </div>
          </EmpowermentCard>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="threat-matrix" className="flex items-center gap-2">
                <Radar className="w-4 h-4" />
                Threat Matrix
              </TabsTrigger>
              <TabsTrigger value="positioning" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Market Map
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Competitors Grid */}
            <TabsContent value="overview" className="space-y-6">
              {filteredCompetitors.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCompetitors.map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BossCard
                        variant="default"
                        interactive
                        className="h-full"
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getThreatLevelColor(competitor.threat_level)}`}
                                />
                                <h3 className="font-bold text-lg text-gradient">
                                  {competitor.name}
                                </h3>
                              </div>
                              {competitor.domain && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  {competitor.domain}
                                </p>
                              )}
                              <Badge
                                variant="outline"
                                className={getThreatLevelBadge(competitor.threat_level)}
                              >
                                {competitor.threat_level.toUpperCase()} THREAT
                              </Badge>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <BossButton variant="secondary" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </BossButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/competitors/${competitor.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Trigger Enrichment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure Monitoring
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Archive Competitor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Description */}
                          {competitor.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {competitor.description}
                            </p>
                          )}

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Industry</p>
                              <p className="font-medium">{competitor.industry || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Employees</p>
                              <p className="font-medium">{competitor.employee_count || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Funding</p>
                              <p className="font-medium">{competitor.funding_stage || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Status</p>
                              <Badge
                                variant={competitor.monitoring_status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {competitor.monitoring_status}
                              </Badge>
                            </div>
                          </div>

                          {/* Activity Indicators */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span>{competitor.recent_activity_count} activities</span>
                              </div>
                              {competitor.alert_count > 0 && (
                                <div className="flex items-center space-x-1">
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                  <span>{competitor.alert_count} alerts</span>
                                </div>
                              )}
                            </div>

                            <Link href={`/dashboard/competitors/${competitor.id}`}>
                              <BossButton variant="primary" size="sm">
                                View Details
                              </BossButton>
                            </Link>
                          </div>
                        </div>
                      </BossCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
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
                      <Eye className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gradient mb-4">
                      {searchQuery || threatFilter !== "all" || industryFilter !== "all"
                        ? "No competitors match your filters"
                        : "No competitors added yet"
                      }
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchQuery || threatFilter !== "all" || industryFilter !== "all"
                        ? "Try adjusting your search criteria or filters"
                        : "Start building your competitive intelligence by adding your first competitor"
                      }
                    </p>
                    <div className="space-y-3">
                      <Link href="/dashboard/competitors/add">
                        <ZapButton>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Competitor
                        </ZapButton>
                      </Link>
                      {(searchQuery || threatFilter !== "all" || industryFilter !== "all") && (
                        <BossButton
                          variant="secondary"
                          onClick={() => {
                            setSearchQuery("")
                            setThreatFilter("all")
                            setIndustryFilter("all")
                          }}
                        >
                          Clear Filters
                        </BossButton>
                      )}
                    </div>
                  </div>
                </EmpowermentCard>
              )}
            </TabsContent>

            {/* Real-time Activity Feed */}
            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                  <EmpowermentCard>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                        <Activity className="w-6 h-6" />
                        <span>Live Intelligence Feed</span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">Last Hour</SelectItem>
                            <SelectItem value="24h">Last 24h</SelectItem>
                            <SelectItem value="7d">Last Week</SelectItem>
                            <SelectItem value="30d">Last Month</SelectItem>
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
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {realtimeActivities.length > 0 ? (
                        realtimeActivities.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start space-x-4 p-4 glass rounded-xl hover-lift"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.importance)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">
                                  {activity.competitorName}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1">{activity.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {activity.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={getThreatLevelBadge(activity.importance)}
                                >
                                  {activity.importance.toUpperCase()}
                                </Badge>
                                {activity.agentAnalysis && (
                                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                                    <Zap className="w-3 h-3" />
                                    <span>Analyzed by {activity.agentAnalysis.agentName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </EmpowermentCard>
                </div>

                {/* Activity Summary */}
                <div className="space-y-6">
                  <BossCard variant="success">
                    <h3 className="font-bold text-lg mb-4 text-gradient">Activity Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Website Changes</span>
                        <Badge variant="outline">
                          {realtimeActivities.filter(a => a.type === 'website_change').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Social Posts</span>
                        <Badge variant="outline">
                          {realtimeActivities.filter(a => a.type === 'social_post').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">News Mentions</span>
                        <Badge variant="outline">
                          {realtimeActivities.filter(a => a.type === 'news_mention').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Job Postings</span>
                        <Badge variant="outline">
                          {realtimeActivities.filter(a => a.type === 'job_posting').length}
                        </Badge>
                      </div>
                    </div>
                  </BossCard>

                  <BossCard variant="warning">
                    <h3 className="font-bold text-lg mb-4 text-gradient">Critical Alerts</h3>
                    <div className="space-y-3">
                      {realtimeActivities
                        .filter(a => a.importance === 'critical')
                        .slice(0, 3)
                        .map((activity, index) => (
                          <div key={activity.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="font-medium text-sm">{activity.competitorName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{activity.title}</p>
                          </div>
                        ))}
                      {realtimeActivities.filter(a => a.importance === 'critical').length === 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No critical alerts</p>
                      )}
                    </div>
                  </BossCard>
                </div>
              </div>
            </TabsContent>

            {/* Threat Matrix Visualization */}
            <TabsContent value="threat-matrix" className="space-y-6">
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                    <Radar className="w-6 h-6" />
                    <span>Competitive Threat Matrix</span>
                  </h2>
                  <BossButton
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export Matrix
                  </BossButton>
                </div>

                <div className="relative">
                  {/* Matrix Chart */}
                  <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    {/* Axis Labels */}
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Competitive Strength
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Market Overlap
                      </span>
                    </div>

                    {/* Quadrant Labels */}
                    <div className="absolute top-4 left-4 text-xs font-medium text-gray-500">
                      Low Overlap<br />High Strength
                    </div>
                    <div className="absolute top-4 right-4 text-xs font-medium text-gray-500">
                      High Overlap<br />High Strength
                    </div>
                    <div className="absolute bottom-16 left-4 text-xs font-medium text-gray-500">
                      Low Overlap<br />Low Strength
                    </div>
                    <div className="absolute bottom-16 right-4 text-xs font-medium text-gray-500">
                      High Overlap<br />Low Strength
                    </div>

                    {/* Competitor Dots */}
                    {threatMatrix.map((competitor, index) => (
                      <motion.div
                        key={competitor.competitorId}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getThreatLevelColor(competitor.threatLevel)} hover:scale-150 transition-transform`}
                        style={{
                          left: `${(competitor.marketOverlap / 100) * 80 + 10}%`,
                          top: `${100 - ((competitor.competitiveStrength / 100) * 80 + 10)}%`
                        }}
                        title={`${competitor.name} - Threat: ${competitor.threatLevel}`}
                      />
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {threatMatrix.map((competitor) => (
                      <div key={competitor.competitorId} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(competitor.threatLevel)}`} />
                        <span className="text-sm font-medium truncate">{competitor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </EmpowermentCard>
            </TabsContent>

            {/* Market Positioning Map */}
            <TabsContent value="positioning" className="space-y-6">
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                    <Map className="w-6 h-6" />
                    <span>Market Positioning Map</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <BossButton
                      variant="secondary"
                      size="sm"
                      icon={<Layers className="w-4 h-4" />}
                    >
                      Toggle View
                    </BossButton>
                    <BossButton
                      variant="secondary"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export Map
                    </BossButton>
                  </div>
                </div>

                <div className="relative">
                  {/* Positioning Chart */}
                  <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600">
                    {/* Axis Labels */}
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Growth Rate (%)
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Market Share (%)
                      </span>
                    </div>

                    {/* Center Lines */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" />

                    {/* Competitor Bubbles */}
                    {marketPositioning.map((competitor, index) => (
                      <motion.div
                        key={competitor.competitorId}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`absolute rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getThreatLevelColor(competitor.threatLevel)} hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-bold`}
                        style={{
                          left: `${(competitor.marketShare / 50) * 80 + 10}%`,
                          top: `${50 - (competitor.growthRate / 40) * 40}%`,
                          width: `${Math.max(20, competitor.marketShare * 2)}px`,
                          height: `${Math.max(20, competitor.marketShare * 2)}px`
                        }}
                        title={`${competitor.name} - Share: ${competitor.marketShare.toFixed(1)}%, Growth: ${competitor.growthRate.toFixed(1)}%`}
                      >
                        {competitor.name.charAt(0)}
                      </motion.div>
                    ))}
                  </div>

                  {/* Market Insights */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <BossCard variant="success">
                      <h3 className="font-bold mb-2">Market Leaders</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .sort((a, b) => b.marketShare - a.marketShare)
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm">{competitor.name}</span>
                              <span className="text-xs font-medium">{competitor.marketShare.toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </BossCard>

                    <BossCard variant="warning">
                      <h3 className="font-bold mb-2">Fast Growers</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .sort((a, b) => b.growthRate - a.growthRate)
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm">{competitor.name}</span>
                              <span className="text-xs font-medium">+{competitor.growthRate.toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </BossCard>

                    <BossCard variant="danger">
                      <h3 className="font-bold mb-2">Critical Threats</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .filter(c => c.threatLevel === 'critical' || c.threatLevel === 'high')
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm">{competitor.name}</span>
                              <Badge variant="outline" className={getThreatLevelBadge(competitor.threatLevel)}>
                                {competitor.threatLevel}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </BossCard>
                  </div>
                </div>
              </EmpowermentCard>
            </TabsContent>

            {/* Intelligence Timeline */}
            <TabsContent value="timeline" className="space-y-6">
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                    <Clock className="w-6 h-6" />
                    <span>Intelligence Timeline</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="7d">Last Week</SelectItem>
                        <SelectItem value="30d">Last Month</SelectItem>
                        <SelectItem value="90d">Last Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                    <BossButton
                      variant="secondary"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export Timeline
                    </BossButton>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline */}
                  <div className="space-y-6">
                    {realtimeActivities.length > 0 ? (
                      realtimeActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative flex items-start space-x-4"
                        >
                          {/* Timeline Line */}
                          {index < realtimeActivities.length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                          )}

                          {/* Activity Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.importance)} border-2 border-white dark:border-gray-800 z-10`}>
                            {getActivityIcon(activity.type)}
                          </div>

                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <BossCard variant="default" className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gradient">{activity.competitorName}</h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={getThreatLevelBadge(activity.importance)}>
                                    {activity.importance}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(activity.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <h4 className="font-semibold mb-1">{activity.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {activity.description}
                              </p>

                              {activity.agentAnalysis && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-600">
                                      AI Analysis by {activity.agentAnalysis.agentName}
                                    </span>
                                  </div>
                                  {activity.agentAnalysis.insights.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Key Insights:
                                      </p>
                                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        {activity.agentAnalysis.insights.slice(0, 2).map((insight, i) => (
                                          <li key={i} className="flex items-start space-x-1">
                                            <span className="text-blue-500">•</span>
                                            <span>{insight}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {activity.agentAnalysis.recommendations.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Recommendations:
                                      </p>
                                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        {activity.agentAnalysis.recommendations.slice(0, 2).map((rec, i) => (
                                          <li key={i} className="flex items-start space-x-1">
                                            <span className="text-green-500">•</span>
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </BossCard>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No intelligence activities in the selected timeframe</p>
                      </div>
                    )}
                  </div>
                </div>
              </EmpowermentCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}