"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  TrendingUp,
  AlertTriangle,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  Brain,
  Zap,
  RefreshCw,
  Download,
  Activity,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Info,
  Radar
} from 'lucide-react'
import { toast } from 'sonner'
import { logInfo, logError } from '@/lib/logger'

// Force dynamic rendering to avoid prerender errors
export const dynamic = 'force-dynamic'

interface IntelligenceInsight {
  id: string
  type: 'opportunity' | 'threat' | 'trend' | 'competitive_move'
  title: string
  description: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  source: string
  timestamp: string
  competitor?: string
  impact_score: number
  action_required: boolean
  recommendations: string[]
}

interface IntelligenceStats {
  total_insights: number
  critical_alerts: number
  opportunities_identified: number
  threats_monitored: number
  market_trends_tracked: number
  competitive_moves_detected: number
}

interface MarketPosition {
  market_share: number
  competitive_advantage: string
  innovation_index: string
  customer_satisfaction: string
}

interface StrategicAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  recommendations: string[]
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'opportunity': return <Zap className="w-4 h-4 text-yellow-400" />
    case 'threat': return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'trend': return <TrendingUp className="w-4 h-4 text-blue-400" />
    case 'competitive_move': return <Activity className="w-4 h-4 text-purple-400" />
    default: return <Info className="w-4 h-4 text-gray-400" />
  }
}

function getImportanceVariant(importance: string): "cyan" | "magenta" | "lime" | "purple" | "orange" {
  switch (importance.toLowerCase()) {
    case 'critical': return 'magenta'
    case 'high': return 'orange'
    case 'medium': return 'purple'
    case 'low': return 'cyan'
    default: return 'cyan'
  }
}

export default function IntelligencePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterImportance, setFilterImportance] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<string>('30d')
  const [refreshing, setRefreshing] = useState(false)

  const [insights, setInsights] = useState<IntelligenceInsight[]>([])
  const [stats, setStats] = useState<IntelligenceStats | null>(null)
  const [marketPosition, setMarketPosition] = useState<MarketPosition | null>(null)
  const [strategicAnalysis, setStrategicAnalysis] = useState<StrategicAnalysis | null>(null)

  const loadIntelligenceData = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')

      const response = await fetch('/api/competitors/intelligence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setStats(data.stats || null)
        setMarketPosition(data.market_position || null)
        setStrategicAnalysis(data.strategic_analysis || null)
        logInfo('Intelligence data loaded successfully', { 
          insightsCount: data.insights?.length || 0,
          hasMarketPosition: !!data.market_position,
          hasStrategicAnalysis: !!data.strategic_analysis
        })
      } else {
        throw new Error('Failed to fetch intelligence data')
      }
    } catch (error) {
      logError('Error loading intelligence data:', error)
      toast.error('Failed to load intelligence data', { icon: '❌' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIntelligenceData()
  }, [loadIntelligenceData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadIntelligenceData()
    setRefreshing(false)
    toast.success('Intelligence data refreshed!', { icon: '✅' })
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-green-500" />
      case 'threat': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'competitive_move': return <Users className="w-4 h-4 text-purple-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.competitor?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesImportance = filterImportance === 'all' || insight.importance === filterImportance
    const matchesType = filterType === 'all' || insight.type === filterType

    return matchesSearch && matchesImportance && matchesType
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
        duration: 0.5
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading competitive intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-black text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-8"
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
                className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold font-orbitron text-gradient tracking-wider">Competitive Intelligence</h1>
                <p className="text-lg text-gray-300 font-mono">
                  AI-powered insights to dominate your competition
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-neon-cyan/70">Total Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total_insights}</div>
                <p className="text-xs text-purple-300">Total insights collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-neon-magenta/70">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.critical_alerts}</div>
                <p className="text-xs text-red-400">Requires immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-neon-lime/70">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.opportunities_identified}</div>
                <p className="text-xs text-green-400">Market gaps identified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-neon-orange/70">Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.threats_monitored}</div>
                <p className="text-xs text-orange-400">Active monitoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-blue-400/70">Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.market_trends_tracked}</div>
                <p className="text-xs text-blue-400">Trends analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium font-mono text-neon-purple/70">Competitive Moves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.competitive_moves_detected}</div>
                <p className="text-xs text-purple-400">Moves tracked</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron tracking-wide">
                <Search className="w-5 h-5 text-neon-cyan" />
                Intelligence Search & Analysis
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Search through competitive intelligence and filter by importance or type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-purple-200">Search Intelligence</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search intelligence"
                      className="pl-10 bg-dark-bg border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <Label className="text-purple-200">Importance</Label>
                    <Select value={filterImportance} onValueChange={setFilterImportance}>
                      <SelectTrigger className="w-40 bg-dark-bg border-neon-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card text-white border-neon-cyan/30">
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40 bg-dark-bg border-neon-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card text-white border-neon-cyan/30">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="opportunity">Opportunities</SelectItem>
                        <SelectItem value="threat">Threats</SelectItem>
                        <SelectItem value="trend">Trends</SelectItem>
                        <SelectItem value="competitive_move">Moves</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-32 bg-dark-bg border-neon-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card text-white border-neon-cyan/30">
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Intelligence Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-purple-900/50 border border-purple-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analysis
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      Recent Insights
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Latest competitive intelligence findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredInsights.slice(0, 3).map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}

                        className="p-4 bg-dark-card rounded-lg border border-neon-cyan/20 space-y-2 hover:border-neon-cyan/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(insight.type)}
                            <span className="font-medium text-white">{insight.title}</span>
                          </div>
                          <Badge variant={getImportanceVariant(insight.importance)}>
                            {insight.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-200 line-clamp-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-300">
                            Confidence: {insight.confidence}%
                          </span>
                          <span className="text-purple-300">
                            {new Date(insight.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Market Position */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-300" />
                      Market Position
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Your competitive positioning analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {marketPosition ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-white/5">
                          <span className="text-gray-300 font-mono text-sm">Market Share</span>
                          <div className="flex items-center gap-2">
                            <Progress value={marketPosition.market_share} className="w-20 h-2" />
                            <span className="text-white font-medium">{marketPosition.market_share}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-white/5">
                          <span className="text-gray-300 font-mono text-sm">Competitive Advantage</span>
                          <Badge variant={
                            marketPosition.competitive_advantage === 'strong' ? 'lime' :
                            marketPosition.competitive_advantage === 'moderate' ? 'orange' :
                            'magenta'
                          }>
                            {marketPosition.competitive_advantage.charAt(0).toUpperCase() + marketPosition.competitive_advantage.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-white/5">
                          <span className="text-gray-300 font-mono text-sm">Innovation Index</span>
                          <Badge variant={
                            marketPosition.innovation_index === 'high' ? 'cyan' :
                            marketPosition.innovation_index === 'moderate' ? 'orange' :
                            'magenta'
                          }>
                            {marketPosition.innovation_index.charAt(0).toUpperCase() + marketPosition.innovation_index.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-white/5">
                          <span className="text-gray-300 font-mono text-sm">Customer Satisfaction</span>
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                            {marketPosition.customer_satisfaction.charAt(0).toUpperCase() + marketPosition.customer_satisfaction.slice(1)}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-purple-300">
                        <p>Market position data loading...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-300" />
                    Strategic Recommendations
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    AI-generated strategic insights for competitive advantage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {strategicAnalysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white flex items-center gap-2 font-orbitron tracking-wide text-sm">
                          <CheckCircle className="w-4 h-4 text-neon-green" />
                          Opportunities
                        </h4>
                        <div className="space-y-3">
                          {strategicAnalysis.opportunities.length > 0 ? (
                            strategicAnalysis.opportunities.slice(0, 3).map((opp, idx) => (
                              <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                                <p className="text-sm text-green-200">
                                  <strong>{opp}</strong>
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-purple-300">No opportunities identified yet</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-white flex items-center gap-2 font-orbitron tracking-wide text-sm">
                          <AlertTriangle className="w-4 h-4 text-neon-magenta" />
                          Threats
                        </h4>
                        <div className="space-y-3">
                          {strategicAnalysis.threats.length > 0 ? (
                            strategicAnalysis.threats.slice(0, 3).map((threat, idx) => (
                              <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                <p className="text-sm text-red-200">
                                  <strong>{threat}</strong>
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-purple-300">No threats identified yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-300">
                      <p>Strategic analysis loading...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(insight.type)}
                            <CardTitle className="text-white">{insight.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImportanceColor(insight.importance)}>
                              {insight.importance}
                            </Badge>
                            {insight.action_required && (
                              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-purple-200">
                          Source: {insight.source} • Confidence: {insight.confidence}% • Impact Score: {insight.impact_score}/10
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-purple-100">{insight.description}</p>

                        {insight.competitor && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-purple-300" />
                            <span className="text-purple-200">Competitor:</span>
                            <span className="text-white font-medium">{insight.competitor}</span>
                          </div>
                        )}

                        {insight.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-cyan-300" />
                              Recommended Actions
                            </h4>
                            <ul className="space-y-1">
                              {insight.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-purple-200">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radar className="w-5 h-5 text-cyan-300" />
                      Threat Assessment
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Current competitive threat levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Critical Threats</span>
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                          {insights.filter(i => i.importance === 'critical').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">High Priority</span>
                        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                          {insights.filter(i => i.importance === 'high').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Medium Priority</span>
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          {insights.filter(i => i.importance === 'medium').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Low Priority</span>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          {insights.filter(i => i.importance === 'low').length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-300" />
                      Intelligence Summary
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Overview of collected intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Total Insights</span>
                        <span className="text-white font-medium">{insights.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Action Required</span>
                        <span className="text-white font-medium">
                          {insights.filter(i => i.action_required).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Avg Confidence</span>
                        <span className="text-white font-medium">
                          {insights.length > 0 ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Avg Impact Score</span>
                        <span className="text-white font-medium">
                          {insights.length > 0 ? (insights.reduce((acc, i) => acc + i.impact_score, 0) / insights.length).toFixed(1) : 0}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-300" />
                    AI Strategic Analysis
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Comprehensive competitive landscape analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {strategicAnalysis ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                          <h4 className="font-semibold text-green-300 mb-2">Strengths</h4>
                          {strategicAnalysis.strengths.length > 0 ? (
                            <ul className="text-sm text-green-200 space-y-1">
                              {strategicAnalysis.strengths.map((strength, idx) => (
                                <li key={idx}>• {strength}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-purple-300">No strengths identified yet</p>
                          )}
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                          <h4 className="font-semibold text-red-300 mb-2">Weaknesses</h4>
                          {strategicAnalysis.weaknesses.length > 0 ? (
                            <ul className="text-sm text-red-200 space-y-1">
                              {strategicAnalysis.weaknesses.map((weakness, idx) => (
                                <li key={idx}>• {weakness}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-purple-300">No weaknesses identified yet</p>
                          )}
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <h4 className="font-semibold text-blue-300 mb-2">Opportunities</h4>
                          {strategicAnalysis.opportunities.length > 0 ? (
                            <ul className="text-sm text-blue-200 space-y-1">
                              {strategicAnalysis.opportunities.map((opp, idx) => (
                                <li key={idx}>• {opp}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-purple-300">No opportunities identified yet</p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <h4 className="font-semibold text-purple-300 mb-2">Strategic Recommendations</h4>
                        {strategicAnalysis.recommendations.length > 0 ? (
                          <ol className="text-sm text-purple-200 space-y-2">
                            {strategicAnalysis.recommendations.map((rec, idx) => (
                              <li key={idx}>{idx + 1}. {rec}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-sm text-purple-300">No recommendations available yet. Add competitors and intelligence data to get AI-generated recommendations.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-300">
                      <p>Strategic analysis loading...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}
