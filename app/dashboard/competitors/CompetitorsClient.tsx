"use client"

import { FeatureGate } from "@/components/subscription/FeatureGate"
import { logError } from '@/lib/logger'
import { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import {
  Search, Plus, Eye, AlertTriangle, TrendingUp, Users, Globe, Shield, Target, Zap, MoreVertical, RefreshCw, Download, Settings, Activity, BarChart3, Map, Clock, Radar, Grid3X3, Layers, Terminal as TerminalIcon
} from "lucide-react"
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

interface Competitor {
  id: string | number
  name: string
  domain: string | null
  description: string | null
  industry: string | null
  threat_level: string
  monitoring_status: string
  employee_count: number | null
  funding_stage: string | null
  last_analyzed: string | null
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
  id: string | number
  competitorId: string | number
  competitorName: string
  type: string
  title: string
  description: string
  importance: string
  timestamp: string
  sourceUrl?: string
  agentAnalysis?: {
    agentId: string
    agentName: string
    insights: string[]
    recommendations: string[]
  }
}

interface CompetitorsClientProps {
  initialCompetitors: any[]
  initialStats: DashboardStats
  initialActivities: any[]
}

export default function CompetitorsClient({ initialCompetitors, initialStats, initialActivities }: CompetitorsClientProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors.map(c => ({
    ...c,
    id: String(c.id),
    threat_level: c.threat_level || 'medium',
    monitoring_status: c.monitoring_status || 'active',
    recent_activity_count: 0,
    alert_count: 0
  })))
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [realtimeActivities, setRealtimeActivities] = useState<IntelligenceActivity[]>(initialActivities.map(a => ({
    id: String(a.id),
    competitorId: String(a.competitor_id),
    competitorName: a.competitorProfile?.name || 'Unknown',
    type: a.source_type || 'website',
    title: a.extracted_data?.title || 'Update',
    description: a.extracted_data?.content || 'New intelligence',
    importance: a.importance || 'low',
    timestamp: a.collected_at || new Date().toISOString()
  })))

  const [searchQuery, setSearchQuery] = useState("")
  const [threatFilter, setThreatFilter] = useState<string>("all")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("threat_level")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timelineFilter, setTimelineFilter] = useState<string>("24h")

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/competitors')
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data.competitors || [])
      }
    } catch (e) {
      logError("Refresh failed", e)
    } finally {
      setRefreshing(false)
    }
  }

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
          const threatOrder: any = { critical: 4, high: 3, medium: 2, low: 1 }
          return (threatOrder[b.threat_level] || 0) - (threatOrder[a.threat_level] || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-neon-magenta'
      case 'high': return 'bg-neon-orange'
      case 'medium': return 'bg-neon-yellow'
      case 'low': return 'bg-neon-lime'
      default: return 'bg-gray-600'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website': return <Globe className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'news': return <Activity className="w-4 h-4" />
      case 'job': return <Target className="w-4 h-4" />
      case 'launch': return <Zap className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
  }

  return (
    <FeatureGate feature="competitor-stalker">
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
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/30 rounded-none">
                <TerminalIcon className="w-8 h-8 text-neon-magenta" />
              </div>
              <div>
                <h1 className="text-5xl font-orbitron font-black tracking-tighter text-white uppercase italic">
                  Intel<span className="text-neon-magenta">Feed</span>
                </h1>
                <p className="text-magenta-200 font-mono uppercase text-xs tracking-[0.2em] font-bold">Surveillance Engine // v4.1.0</p>
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
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <HudBorder variant="hover" className="p-6 text-center">
            <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.total_competitors}</h3>
            <p className="text-sm text-gray-400 font-mono">Total</p>
          </HudBorder>
          <HudBorder variant="hover" className="p-6 text-center">
            <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.active_monitoring}</h3>
            <p className="text-sm text-gray-400 font-mono">Active</p>
          </HudBorder>
          <HudBorder variant="hover" className="p-6 text-center">
            <h3 className="text-2xl font-orbitron font-bold text-white mb-1">{stats.critical_threats}</h3>
            <p className="text-sm text-gray-400 font-mono text-neon-magenta">Critical</p>
          </HudBorder>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-dark-card border border-neon-cyan/20 rounded-none">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Live Feed</TabsTrigger>
              <TabsTrigger value="threat-matrix">Radar</TabsTrigger>
              <TabsTrigger value="positioning">Market Map</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCompetitors.map((competitor, index) => (
                  <HudBorder key={competitor.id} variant="hover" className="p-6">
                    <h3 className="font-orbitron font-bold text-white mb-2">{competitor.name}</h3>
                    <p className="text-sm text-gray-400 font-mono mb-4">{competitor.domain}</p>
                    <Badge variant={competitor.threat_level === 'critical' ? 'magenta' : 'lime'}>
                      {competitor.threat_level.toUpperCase()}
                    </Badge>
                  </HudBorder>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
               <div className="space-y-4">
                  {realtimeActivities.map(activity => (
                    <HudBorder key={activity.id} className="p-4 flex items-start gap-4">
                      <div className="p-2 bg-dark-bg border border-neon-cyan/20">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-orbitron font-bold text-neon-cyan text-sm">{activity.competitorName}</span>
                          <span className="text-xs text-gray-500 font-mono">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                        <p className="text-white text-sm font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-xs mt-1 font-mono">{activity.description}</p>
                      </div>
                    </HudBorder>
                  ))}
               </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
    </FeatureGate>
  )
}
