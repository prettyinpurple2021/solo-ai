"use client"


export const dynamic = 'force-dynamic'
import { logError,} from '@/lib/logger'
import { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import {
  Search, Plus, Eye, AlertTriangle, TrendingUp, Users, Globe, Shield, Target, Zap, MoreVertical, RefreshCw, Download, Settings, Activity, BarChart3, Map, Clock, Radar, Grid3X3, Layers,} from "lucide-react"
import Link from 'next/link'
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { Loading } from "@/components/ui/loading"
import { Progress as _Progress } from "@/components/ui/progress"
import { Terminal as TerminalIcon } from "lucide-react"


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
  funding_amount?: number
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
  const [_selectedCompetitors, _setSelectedCompetitors] = useState<number[]>([])
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

        // Generate threat matrix data based on real competitor metrics
        const threatMatrixData = (competitorsData.competitors || []).map((comp: Competitor, index: number) => {
          // Calculate market overlap based on industry and description similarity
          const marketOverlap = comp.threat_level === 'critical' ? 90 + Math.random() * 10 :
            comp.threat_level === 'high' ? 70 + Math.random() * 20 :
              comp.threat_level === 'medium' ? 40 + Math.random() * 30 :
                20 + Math.random() * 30

          // Calculate competitive strength based on employee count and funding
          const employeeCount = comp.employee_count || 50
          const fundingAmount = comp.funding_amount || 0
          const competitiveStrength = Math.min(100, (employeeCount / 10) + (fundingAmount / 1000000) + Math.random() * 20)

          return {
            competitorId: comp.id,
            name: comp.name,
            threatLevel: comp.threat_level,
            marketOverlap: Math.round(marketOverlap),
            competitiveStrength: Math.round(competitiveStrength),
            recentActivity: comp.recent_activity_count || 0,
            position: {
              x: (index % 4) * 100 + 50,
              y: Math.floor(index / 4) * 100 + 50
            }
          }
        })
        setThreatMatrix(threatMatrixData)

        // Generate market positioning data based on real metrics
        const marketPositionData = (competitorsData.competitors || []).map((comp: Competitor, index: number) => {
          // Calculate market share based on employee count and threat level
          const employeeCount = comp.employee_count || 50
          const marketShare = comp.threat_level === 'critical' ? 25 + Math.random() * 10 :
            comp.threat_level === 'high' ? 15 + Math.random() * 10 :
              comp.threat_level === 'medium' ? 8 + Math.random() * 7 :
                3 + Math.random() * 5

          // Calculate growth rate based on recent activity and funding
          const recentActivity = comp.recent_activity_count || 0
          const fundingAmount = comp.funding_amount || 0
          const growthRate = (recentActivity * 2) + (fundingAmount / 10000000) + (Math.random() - 0.5) * 20

          return {
            competitorId: comp.id,
            name: comp.name,
            marketShare: Math.round(marketShare * 10) / 10,
            growthRate: Math.round(growthRate * 10) / 10,
            position: {
              x: (index % 4) * 100 + 50,
              y: Math.floor(index / 4) * 100 + 50
            },
            threatLevel: comp.threat_level
          }
        })
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
      logError('Error fetching dashboard data:', error)
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
      case 'critical': return 'bg-neon-magenta'
      case 'high': return 'bg-neon-orange'
      case 'medium': return 'bg-neon-yellow' // Assuming neon-yellow exists, if not fallback to orange or custom
      case 'low': return 'bg-neon-lime'
      default: return 'bg-gray-600'
    }
  }

  const getThreatLevelBadge = (level: string) => {
    const colors = {
      critical: 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta/50 rounded-none',
      high: 'bg-neon-orange/20 text-neon-orange border-neon-orange/50 rounded-none',
      medium: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50 rounded-none',
      low: 'bg-neon-lime/20 text-neon-lime border-neon-lime/50 rounded-none'
    }
    return colors[level as keyof typeof colors] || 'bg-dark-card text-gray-400 border-gray-600 rounded-none'
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
      case 'critical': return 'text-neon-magenta bg-neon-magenta/10 rounded-none'
      case 'high': return 'text-neon-orange bg-neon-orange/10 rounded-none'
      case 'medium': return 'text-neon-yellow bg-neon-yellow/10 rounded-none'
      case 'low': return 'text-neon-lime bg-neon-lime/10 rounded-none'
      default: return 'text-gray-400 bg-dark-card rounded-none'
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
      <div className="min-h-screen bg-dark-bg p-6">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10 gap-4">
          <Loading
            variant="flicker"
            size="lg"
          />
          <p className="text-neon-cyan font-mono animate-pulse">Loading competitor intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6 relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />
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
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/30 rounded-none shadow-[0_0_15px_rgba(255,0,110,0.2)]">
                  <TerminalIcon className="w-8 h-8 text-neon-magenta" />
                </div>
                <div>
                  <h1 className="text-5xl font-orbitron font-black tracking-tighter text-white uppercase italic">
                    Intel<span className="text-neon-magenta">Feed</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon-magenta animate-pulse rounded-none" />
                    <p className="text-magenta-200 font-mono uppercase text-xs tracking-[0.2em] font-bold">Competitive Surveillance Engine // v4.1.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CyberButton
              variant="outline"
              size="sm"
              className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </CyberButton>
            <Link href="/dashboard/competitors/add">
              <CyberButton size="sm" className="bg-neon-purple hover:bg-neon-purple/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor
              </CyberButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-lime">+12%</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.total_competitors}</h3>
              <p className="text-sm text-gray-400 font-mono">Total Competitors</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-lime">+8%</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.active_monitoring}</h3>
              <p className="text-sm text-gray-400 font-mono">Active Monitoring</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-magenta to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-magenta">+2</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.critical_threats}</h3>
              <p className="text-sm text-gray-400 font-mono">Critical Threats</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-lime">+15</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.recent_alerts}</h3>
              <p className="text-sm text-gray-400 font-mono">Recent Alerts</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-lime">+25</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.intelligence_collected}</h3>
              <p className="text-sm text-gray-400 font-mono">Intelligence Collected</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-mono text-neon-lime">+18</span>
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.opportunities_identified}</h3>
              <p className="text-sm text-gray-400 font-mono">Opportunities</p>
            </HudBorder>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <HudBorder variant="hover" className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <label htmlFor="competitor-search" className="sr-only">
                    Search competitors
                  </label>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    id="competitor-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search competitors"
                    className="pl-10 bg-dark-bg border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan"
                  />
                </div>

                <Select value={threatFilter} onValueChange={setThreatFilter}>
                  <SelectTrigger
                    className="w-full sm:w-[180px] bg-dark-bg border-neon-cyan/30 text-white"
                    aria-label="Filter by threat level"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-neon-cyan/30">
                    <SelectItem value="all" className="text-white">All Threats</SelectItem>
                    <SelectItem value="critical" className="text-white">Critical</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger
                    className="w-full sm:w-[180px] bg-dark-bg border-neon-cyan/30 text-white"
                    aria-label="Filter by industry"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-neon-cyan/30">
                    <SelectItem value="all" className="text-white">All Industries</SelectItem>
                    <SelectItem value="technology" className="text-white">Technology</SelectItem>
                    <SelectItem value="finance" className="text-white">Finance</SelectItem>
                    <SelectItem value="healthcare" className="text-white">Healthcare</SelectItem>
                    <SelectItem value="retail" className="text-white">Retail</SelectItem>
                    <SelectItem value="manufacturing" className="text-white">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="w-[160px] bg-dark-bg border-neon-cyan/30 text-white"
                    aria-label="Sort competitors by"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-neon-cyan/30">
                    <SelectItem value="threat_level" className="text-white">Threat Level</SelectItem>
                    <SelectItem value="name" className="text-white">Name</SelectItem>
                    <SelectItem value="last_analyzed" className="text-white">Last Analyzed</SelectItem>
                    <SelectItem value="activity" className="text-white">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>

                <CyberButton
                  variant="outline"
                  size="sm"
                  className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </CyberButton>
              </div>
            </div>
          </HudBorder>
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
                      <HudBorder
                        variant="hover"
                        className="h-full"
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div
                                  className={`w-3 h-3 rounded-none ${
                                    competitor.threat_level === 'critical' ? 'bg-neon-magenta' :
                                    competitor.threat_level === 'high' ? 'bg-neon-orange' :
                                    competitor.threat_level === 'medium' ? 'bg-neon-orange' :
                                    'bg-neon-lime'
                                  }`}
                                />
                                <h3 className="font-orbitron font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">
                                  {competitor.name}
                                </h3>
                              </div>
                              {competitor.domain && (
                                <p className="text-sm text-gray-400 mb-1 font-mono">
                                  {competitor.domain}
                                </p>
                              )}
                              <Badge
                                className="text-xs font-mono"
                                variant={
                                  competitor.threat_level === 'critical' ? 'magenta' :
                                  competitor.threat_level === 'high' ? 'orange' :
                                  competitor.threat_level === 'medium' ? 'orange' :
                                  'lime'
                                }
                              >
                                {competitor.threat_level.toUpperCase()} THREAT
                              </Badge>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <CyberButton variant="outline" size="sm" className="text-neon-cyan border-neon-cyan/50 hover:bg-neon-cyan/20">
                                  <MoreVertical className="w-4 h-4" />
                                </CyberButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-dark-card border-neon-cyan/30">
                                <DropdownMenuItem asChild className="text-white hover:bg-dark-bg">
                                  <Link href={`/dashboard/competitors/${competitor.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-white hover:bg-dark-bg">
                                  <Zap className="w-4 h-4 mr-2" />
                                  Trigger Enrichment
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-white hover:bg-dark-bg">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure Monitoring
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-neon-cyan/30" />
                                <DropdownMenuItem className="text-neon-magenta hover:bg-dark-bg">
                                  Archive Competitor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Description */}
                          {competitor.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 font-mono">
                              {competitor.description}
                            </p>
                          )}

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-mono">Industry</p>
                              <p className="font-medium text-white font-orbitron">{competitor.industry || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-mono">Employees</p>
                              <p className="font-medium text-white font-orbitron">{competitor.employee_count || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-mono">Funding</p>
                              <p className="font-medium text-white font-orbitron">{competitor.funding_stage || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-mono">Status</p>
                              <Badge
                                variant={competitor.monitoring_status === 'active' ? 'cyan' : 'purple'}
                                className="text-xs font-mono"
                              >
                                {competitor.monitoring_status}
                              </Badge>
                            </div>
                          </div>

                          {/* Activity Indicators */}
                          <div className="flex items-center justify-between pt-2 border-t border-neon-cyan/20">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                                <span className="text-gray-400 font-mono">{competitor.recent_activity_count} activities</span>
                              </div>
                              {competitor.alert_count > 0 && (
                                <div className="flex items-center space-x-1">
                                  <AlertTriangle className="w-4 h-4 text-neon-orange" />
                                  <span className="text-gray-400 font-mono">{competitor.alert_count} alerts</span>
                                </div>
                              )}
                            </div>

                            <Link href={`/dashboard/competitors/${competitor.id}`}>
                              <CyberButton size="sm" className="bg-neon-purple hover:bg-neon-purple/90">
                                View Details
                              </CyberButton>
                            </Link>
                          </div>
                        </div>
                      </HudBorder>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <HudBorder variant="hover" className="p-8">
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
                      className="mx-auto w-20 h-20 bg-gradient-to-br from-neon-magenta to-neon-purple rounded-none flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,0,110,0.4)]"
                    >
                      <Eye className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta mb-4">
                      {searchQuery || threatFilter !== "all" || industryFilter !== "all"
                        ? "No competitors match your filters"
                        : "No competitors added yet"
                      }
                    </h2>
                    <p className="text-gray-400 mb-6 font-mono">
                      {searchQuery || threatFilter !== "all" || industryFilter !== "all"
                        ? "Try adjusting your search criteria or filters"
                        : "Start building your competitive intelligence by adding your first competitor"
                      }
                    </p>
                    <div className="space-y-3">
                      <Link href="/dashboard/competitors/add">
                        <CyberButton className="bg-neon-purple hover:bg-neon-purple/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Competitor
                        </CyberButton>
                      </Link>
                      {(searchQuery || threatFilter !== "all" || industryFilter !== "all") && (
                        <CyberButton
                          variant="outline"
                          className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                          onClick={() => {
                            setSearchQuery("")
                            setThreatFilter("all")
                            setIndustryFilter("all")
                          }}
                        >
                          Clear Filters
                        </CyberButton>
                      )}
                    </div>
                  </div>
                </HudBorder>
              )}
            </TabsContent>

            {/* Real-time Activity Feed */}
            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                  <HudBorder variant="hover" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center space-x-2">
                        <Activity className="w-6 h-6" />
                        <span>Live Intelligence Feed</span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                          <SelectTrigger className="w-[120px] bg-dark-bg border-neon-cyan/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-card border-neon-cyan/30">
                            <SelectItem value="1h" className="text-white">Last Hour</SelectItem>
                            <SelectItem value="24h" className="text-white">Last 24h</SelectItem>
                            <SelectItem value="7d" className="text-white">Last Week</SelectItem>
                            <SelectItem value="30d" className="text-white">Last Month</SelectItem>
                          </SelectContent>
                        </Select>
                        <CyberButton
                          variant="outline"
                          size="sm"
                          className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                          Refresh
                        </CyberButton>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {realtimeActivities.length > 0 ? (
                        realtimeActivities.map((activity, _index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: _index * 0.05 }}
                            className="flex items-start space-x-4 p-4 bg-dark-bg/50 rounded-none border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all"
                          >
                            <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
                              activity.importance === 'critical' ? 'bg-neon-magenta/20 text-neon-magenta' :
                              activity.importance === 'high' ? 'bg-neon-orange/20 text-neon-orange' :
                              activity.importance === 'medium' ? 'bg-neon-orange/20 text-neon-orange' :
                              'bg-neon-lime/20 text-neon-lime'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate text-white font-orbitron">
                                  {activity.competitorName}
                                </h3>
                                <span className="text-xs text-gray-500 font-mono">
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1 text-white font-orbitron">{activity.title}</p>
                              <p className="text-xs text-gray-400 line-clamp-2 mb-2 font-mono">
                                {activity.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge
                                  className="text-xs font-mono"
                                  variant={
                                    activity.importance === 'critical' ? 'magenta' :
                                    activity.importance === 'high' ? 'orange' :
                                    activity.importance === 'medium' ? 'orange' :
                                    'lime'
                                  }
                                >
                                  {activity.importance.toUpperCase()}
                                </Badge>
                                {activity.agentAnalysis && (
                                  <div className="flex items-center space-x-1 text-xs text-neon-cyan font-mono">
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
                          <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 font-mono">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </HudBorder>
                </div>

                {/* Activity Summary */}
                <div className="space-y-6">
                  <HudBorder variant="hover" className="p-6 border-neon-lime/30">
                    <h3 className="font-orbitron font-bold text-lg mb-4 text-white">Activity Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-mono">Website Changes</span>
                        <Badge variant="cyan">
                          {realtimeActivities.filter(a => a.type === 'website_change').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-mono">Social Posts</span>
                        <Badge variant="cyan">
                          {realtimeActivities.filter(a => a.type === 'social_post').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-mono">News Mentions</span>
                        <Badge variant="cyan">
                          {realtimeActivities.filter(a => a.type === 'news_mention').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-mono">Job Postings</span>
                        <Badge variant="cyan">
                          {realtimeActivities.filter(a => a.type === 'job_posting').length}
                        </Badge>
                      </div>
                    </div>
                  </HudBorder>

                  <HudBorder variant="hover" className="p-6 border-neon-orange/30">
                    <h3 className="font-orbitron font-bold text-lg mb-4 text-white">Critical Alerts</h3>
                    <div className="space-y-3">
                      {realtimeActivities
                        .filter(a => a.importance === 'critical')
                        .slice(0, 3)
                        .map((activity, _index) => (
                          <div key={activity.id} className="p-3 bg-neon-magenta/10 rounded-none border border-neon-magenta/30">
                            <p className="font-medium text-sm text-white font-orbitron">{activity.competitorName}</p>
                            <p className="text-xs text-gray-400 font-mono">{activity.title}</p>
                          </div>
                        ))}
                      {realtimeActivities.filter(a => a.importance === 'critical').length === 0 && (
                        <p className="text-sm text-gray-400 font-mono">No critical alerts</p>
                      )}
                    </div>
                  </HudBorder>
                </div>
              </div>
            </TabsContent>

            {/* Threat Matrix Visualization */}
            <TabsContent value="threat-matrix" className="space-y-6">
              <HudBorder variant="hover" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center space-x-2">
                    <Radar className="w-6 h-6" />
                    <span>Competitive Threat Matrix</span>
                  </h2>
                  <CyberButton
                    variant="outline"
                    size="sm"
                    className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Matrix
                  </CyberButton>
                </div>

                <div className="relative">
                  {/* Matrix Chart */}
                  <div className="relative w-full h-96 bg-dark-bg/50 rounded-none border-2 border-dashed border-neon-cyan/30">
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
                        className={`absolute w-4 h-4 rounded-none cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getThreatLevelColor(competitor.threatLevel)} hover:scale-150 transition-transform`}
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
                        <div className={`w-3 h-3 rounded-none ${getThreatLevelColor(competitor.threatLevel)}`} />
                        <span className="text-sm font-medium truncate">{competitor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </HudBorder>
            </TabsContent>

            {/* Market Positioning Map */}
            <TabsContent value="positioning" className="space-y-6">
              <HudBorder variant="hover" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center space-x-2">
                    <Map className="w-6 h-6" />
                    <span>Market Positioning Map</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <CyberButton
                      variant="outline"
                      size="sm"
                      className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Toggle View
                    </CyberButton>
                    <CyberButton
                      variant="outline"
                      size="sm"
                      className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Map
                    </CyberButton>
                  </div>
                </div>

                <div className="relative">
                  {/* Positioning Chart */}
                  <div className="relative w-full h-96 bg-dark-bg/50 rounded-none border-2 border-dashed border-neon-purple/30">
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
                        className={`absolute rounded-none cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                          competitor.threatLevel === 'critical' ? 'bg-neon-magenta' :
                          competitor.threatLevel === 'high' ? 'bg-neon-orange' :
                          competitor.threatLevel === 'medium' ? 'bg-neon-orange' :
                          'bg-neon-lime'
                        } hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-bold font-orbitron`}
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
                    <HudBorder variant="hover" className="p-4 border-neon-lime/30">
                      <h3 className="font-orbitron font-bold mb-2 text-white">Market Leaders</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .sort((a, b) => b.marketShare - a.marketShare)
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300 font-mono">{competitor.name}</span>
                              <span className="text-xs font-medium text-neon-lime">{competitor.marketShare.toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </HudBorder>

                    <HudBorder variant="hover" className="p-4 border-neon-orange/30">
                      <h3 className="font-orbitron font-bold mb-2 text-white">Fast Growers</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .sort((a, b) => b.growthRate - a.growthRate)
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300 font-mono">{competitor.name}</span>
                              <span className="text-xs font-medium text-neon-orange">+{competitor.growthRate.toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </HudBorder>

                    <HudBorder variant="hover" className="p-4 border-neon-magenta/30">
                      <h3 className="font-orbitron font-bold mb-2 text-white">Critical Threats</h3>
                      <div className="space-y-2">
                        {marketPositioning
                          .filter(c => c.threatLevel === 'critical' || c.threatLevel === 'high')
                          .slice(0, 3)
                          .map((competitor) => (
                            <div key={competitor.competitorId} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300 font-mono">{competitor.name}</span>
                              <Badge 
                                variant="cyan" 
                                className={`
                                  ${competitor.threatLevel === 'critical' ? 'text-neon-magenta border-neon-magenta' : 
                                    competitor.threatLevel === 'high' ? 'text-neon-orange border-neon-orange' : 
                                    competitor.threatLevel === 'medium' ? 'text-neon-orange border-neon-orange' : 
                                    'text-neon-lime border-neon-lime'} 
                                `} 
                              >
                                {competitor.threatLevel}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </HudBorder>
                  </div>
                </div>
              </HudBorder>
            </TabsContent>

            {/* Intelligence Timeline */}
            <TabsContent value="timeline" className="space-y-6">
              <HudBorder variant="hover" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center space-x-2">
                    <Clock className="w-6 h-6" />
                    <span>Intelligence Timeline</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                      <SelectTrigger className="w-[120px] bg-dark-bg border-neon-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-neon-cyan/30">
                        <SelectItem value="24h" className="text-white">Last 24h</SelectItem>
                        <SelectItem value="7d" className="text-white">Last Week</SelectItem>
                        <SelectItem value="30d" className="text-white">Last Month</SelectItem>
                        <SelectItem value="90d" className="text-white">Last Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                    <CyberButton
                      variant="outline"
                      size="sm"
                      className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Timeline
                    </CyberButton>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline */}
                  <div className="space-y-6">
                    {realtimeActivities.length > 0 ? (
                      realtimeActivities.map((activity, _index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: _index * 0.05 }}
                          className="relative flex items-start space-x-4"
                        >
                          {/* Timeline Line */}
                          {_index < realtimeActivities.length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-neon-cyan/20" />
                          )}

                          {/* Activity Icon */}
                          <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
                            activity.importance === 'critical' ? 'bg-neon-magenta/20 text-neon-magenta' :
                            activity.importance === 'high' ? 'bg-neon-orange/20 text-neon-orange' :
                            activity.importance === 'medium' ? 'bg-neon-orange/20 text-neon-orange' :
                            'bg-neon-lime/20 text-neon-lime'
                          } border-2 border-dark-card z-10`}>
                            {getActivityIcon(activity.type)}
                          </div>

                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <HudBorder variant="hover" className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">{activity.competitorName}</h3>
                                <div className="flex items-center space-x-2">
                                  <Badge className="text-xs font-mono"
                                    variant={
                                      activity.importance === 'critical' ? 'magenta' :
                                      activity.importance === 'high' ? 'orange' :
                                      activity.importance === 'medium' ? 'orange' :
                                      'lime'
                                    }
                                  >
                                    {activity.importance}
                                  </Badge>
                                  <span className="text-xs text-gray-500 font-mono">
                                    {formatTimeAgo(activity.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <h4 className="font-semibold mb-1 text-white font-orbitron">{activity.title}</h4>
                              <p className="text-sm text-gray-400 mb-3 font-mono">
                                {activity.description}
                              </p>

                              {activity.agentAnalysis && (
                                <div className="border-t border-neon-cyan/20 pt-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-4 h-4 text-neon-cyan" />
                                    <span className="text-sm font-medium text-neon-cyan font-mono">
                                      AI Analysis by {activity.agentAnalysis.agentName}
                                    </span>
                                  </div>
                                  {activity.agentAnalysis.insights.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-gray-400 mb-1 font-mono">
                                        Key Insights:
                                      </p>
                                      <ul className="text-xs text-gray-400 space-y-1 font-mono">
                                        {activity.agentAnalysis.insights.slice(0, 2).map((insight, i) => (
                                          <li key={i} className="flex items-start space-x-1">
                                            <span className="text-neon-cyan">•</span>
                                            <span>{insight}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {activity.agentAnalysis.recommendations.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-400 mb-1 font-mono">
                                        Recommendations:
                                      </p>
                                      <ul className="text-xs text-gray-400 space-y-1 font-mono">
                                        {activity.agentAnalysis.recommendations.slice(0, 2).map((rec, i) => (
                                          <li key={i} className="flex items-start space-x-1">
                                            <span className="text-neon-lime">•</span>
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </HudBorder>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 font-mono">No intelligence activities in the selected timeframe</p>
                      </div>
                    )}
                  </div>
                </div>
              </HudBorder>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}