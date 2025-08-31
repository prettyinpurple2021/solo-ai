"use client"

import { useState, useEffect } from "react"
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
  Settings
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
import { Loading } from "@/components/ui/loading"

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

export default function CompetitorDashboardPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [threatFilter, setThreatFilter] = useState<string>("all")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("threat_level")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch competitors and stats
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch competitors (using mock data for now)
      const competitorsResponse = await fetch('/api/competitors/mock')
      if (competitorsResponse.ok) {
        const competitorsData = await competitorsResponse.json()
        setCompetitors(competitorsData.competitors || [])
      }

      // Fetch dashboard stats (using mock data for now)
      const statsResponse = await fetch('/api/competitors/mock?type=stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
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
              <ZapButton
                icon={<Plus className="w-4 h-4" />}
              >
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

        {/* Competitors Grid */}
        <motion.div variants={itemVariants}>
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
                    <ZapButton 
                      icon={<Plus className="w-4 h-4" />}
                    >
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
        </motion.div>
      </motion.div>
    </div>
  )
}