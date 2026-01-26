
'use client'

import { logError,} from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Settings, Clock, ExternalLink, Brain, Crosshair, Plus,} from 'lucide-react'

import { CyberButton } from '@/components/cyber/CyberButton'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


// Types
interface CompetitorProfile {
  id: number
  name: string
  domain: string
  description: string
  industry: string
  foundedYear: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface ActivityItem {
  id: number
  type: string
  title: string
  description: string
  source: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

interface Alert {
  id: number
  type: string
  severity: 'info' | 'warning' | 'urgent' | 'critical'
  title: string
  description: string
  timestamp: string
  isRead: boolean
}

interface Insight {
  id: number
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation'
  title: string
  description: string
  confidence: string
  timestamp: string
}
export default function CompetitorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const competitorId = params.id as string

  // State
  const [loading, setLoading] = useState(true)
  const [competitor, setCompetitor] = useState<CompetitorProfile | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [insightFilter, setInsightFilter] = useState<string>('all')

  const fetchCompetitorData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch real competitor data from API
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/competitors/${competitorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch competitor data')
      }

      const competitor: CompetitorProfile = await response.json()
      setCompetitor(competitor)

      // Fetch related data
      const [activitiesResponse, alertsResponse, insightsResponse] = await Promise.all([
        fetch(`/api/competitors/${competitorId}/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/competitors/${competitorId}/alerts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/competitors/${competitorId}/insights`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      // Process responses
      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json()
        setActivities(activities)
      }

      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json()
        setAlerts(alerts)
      }

      if (insightsResponse.ok) {
        const insights = await insightsResponse.json()
        setInsights(insights)
      }

    } catch (error) {
      logError('Error fetching competitor data:', error)
    } finally {
      setLoading(false)
    }
  }, [competitorId])

  useEffect(() => {
    fetchCompetitorData()
  }, [fetchCompetitorData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCompetitorData()
    setRefreshing(false)
  }

  const filteredActivities = activities.filter(activity =>
    activityFilter === 'all' || activity.type === activityFilter
  )

  const filteredInsights = insights.filter(insight =>
    insightFilter === 'all' || insight.type === insightFilter
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-mono">Loading competitor data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!competitor) {
    return (
      <div className="min-h-screen bg-dark-bg p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-orbitron text-white mb-4">Competitor Not Found</h2>
            <p className="text-gray-400 mb-6 font-mono">The competitor you're looking for doesn't exist.</p>
            <CyberButton onClick={() => router.push('/dashboard/competitors')}>
              Back to Competitors
            </CyberButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <CyberButton variant="ghost" size="sm" className='text-neon-cyan hover:bg-neon-cyan/10'>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Competitors
              </CyberButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-orbitron text-white">{competitor?.name}</h1>
              <p className="text-gray-400 font-mono">{competitor?.domain}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CyberButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </CyberButton>
            <CyberButton variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </CyberButton>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="threat">Threat Assessment</TabsTrigger>
            <TabsTrigger value="actions">Action Plan</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Info */}
              <HudBorder className="lg:col-span-2 p-6">
                <h3 className="text-xl font-bold font-orbitron text-white mb-4">Company Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white font-mono">Description</h4>
                    <p className="text-gray-400 font-mono">{competitor?.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white font-mono">Industry</h4>
                      <p className="text-gray-400 font-mono">{competitor?.industry}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white font-mono">Founded</h4>
                      <p className="text-gray-400 font-mono">{competitor?.foundedYear}</p>
                    </div>
                  </div>
                </div>
              </HudBorder>

              {/* Threat Level */}
              <HudBorder className="p-6">
                <h3 className="text-xl font-bold font-orbitron text-white mb-4">Threat Assessment</h3>
                <div className="text-center">
                  <Badge
                    variant={
                        competitor?.threatLevel === 'high' ? 'magenta' :
                        competitor?.threatLevel === 'medium' ? 'orange' :
                        'lime'
                    }
                    className="mb-2"
                  >
                    {competitor?.threatLevel?.toUpperCase()} THREAT
                  </Badge>
                  <p className="text-sm text-gray-400 font-mono">
                    {competitor?.threatLevel === 'high' ? 'Immediate attention required' :
                     competitor?.threatLevel === 'medium' ? 'Monitor closely' :
                     'Low priority monitoring'}
                  </p>
                </div>
              </HudBorder>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <HudBorder className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-orbitron text-white">Activity Timeline</h3>
                <div className="flex items-center gap-3">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    aria-label="Filter activities by type"
                    className="px-3 py-1 border border-neon-cyan/30 rounded-md bg-dark-bg text-white text-sm focus:border-neon-cyan"
                  >
                    <option value="all">All Activities</option>
                    <option value="website_change">Website Changes</option>
                    <option value="social_post">Social Posts</option>
                    <option value="job_posting">Job Postings</option>
                    <option value="funding">Funding</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border-l-4 border-neon-cyan"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white font-mono">{activity.title}</h4>
                        <Badge variant="cyan" className="text-xs text-neon-cyan border-neon-cyan">
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 font-mono">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {activity.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </HudBorder>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <HudBorder className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-orbitron text-white flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-neon-purple" />
                  AI Insights & Analysis
                </h3>
                <select
                  value={insightFilter}
                  onChange={(e) => setInsightFilter(e.target.value)}
                  aria-label="Filter insights by type"
                  className="px-3 py-1 border border-neon-cyan/30 rounded-md bg-dark-bg text-white text-sm focus:border-neon-cyan"
                >
                  <option value="all">All Insights</option>
                  <option value="threat">Threat Analysis</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="trend">Market Trends</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 bg-white/5 rounded-lg border-l-4 ${
                      insight.type === 'threat' ? 'border-neon-magenta' :
                      insight.type === 'opportunity' ? 'border-neon-lime' :
                      'border-neon-cyan'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white font-mono">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.type === 'threat' ? 'magenta' :
                          insight.type === 'opportunity' ? 'lime' :
                          'cyan'
                        }
                        className="text-xs"
                      >
                        {insight.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 font-mono">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            insight.confidence === 'high' ? 'lime' :
                            insight.confidence === 'medium' ? 'orange' :
                            'magenta'
                          }
                          className="text-xs"
                        >
                          {insight.confidence.toUpperCase()} CONFIDENCE
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </HudBorder>
          </TabsContent>

          <TabsContent value="threat" className="space-y-6">
            <HudBorder className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-orbitron text-white flex items-center">
                  <Crosshair className="w-6 h-6 mr-2 text-neon-magenta" />
                  Threat Assessment
                </h3>
                <CyberButton variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Analysis
                </CyberButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-lg border border-neon-cyan/20">
                  <h4 className="font-semibold text-white font-mono mb-3">Competitive Threats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neon-magenta/10 rounded-lg border border-neon-magenta/20">
                      <span className="text-sm text-white font-mono">Market Share Growth</span>
                      <Badge variant="magenta">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neon-orange/10 rounded-lg border border-neon-orange/20">
                      <span className="text-sm text-white font-mono">Pricing Pressure</span>
                      <Badge variant="orange">Medium Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neon-lime/10 rounded-lg border border-neon-lime/20">
                      <span className="text-sm text-white font-mono">Talent Acquisition</span>
                      <Badge variant="lime">Low Risk</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-neon-cyan/20">
                  <h4 className="font-semibold text-white font-mono mb-3">Defensive Strategies</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
                      <h5 className="font-medium text-sm text-white font-mono">Strengthen Brand Positioning</h5>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Focus on unique value proposition
                      </p>
                    </div>
                    <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
                      <h5 className="font-medium text-sm text-white font-mono">Customer Retention Program</h5>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Implement loyalty rewards and better support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </HudBorder>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <HudBorder className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-orbitron text-white">Action Plan</h3>
                <CyberButton variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </CyberButton>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border-l-4 border-neon-cyan">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-neon-cyan font-mono">
                        Lexi
                      </span>
                      <div>
                        <h4 className="font-semibold text-white font-mono">Monitor competitor activity</h4>
                        <p className="text-sm text-gray-400 font-mono">
                          Track their latest product releases and marketing campaigns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="cyan" className="text-neon-cyan border-neon-cyan">monitoring</Badge>
                      <CyberButton variant="outline" size="sm">
                        Start Action
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudBorder>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <HudBorder className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-orbitron text-white">Active Alerts</h3>
                <CyberButton variant="outline" size="sm">
                  Mark All Read
                </CyberButton>
              </div>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 bg-white/5 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-neon-magenta' :
                      alert.severity === 'urgent' ? 'border-neon-orange' :
                        alert.severity === 'warning' ? 'border-neon-orange' :
                          'border-neon-cyan'
                      } ${!alert.isRead ? 'bg-opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white font-mono">{alert.title}</h4>
                          <Badge
                            variant={
                                alert.severity === 'critical' ? 'magenta' :
                                alert.severity === 'urgent' ? 'orange' :
                                alert.severity === 'warning' ? 'orange' :
                                'cyan'
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2 font-mono">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <CyberButton variant="outline" size="sm">
                        View Details
                      </CyberButton>
                    </div>
                  </div>
                ))}
              </div>
            </HudBorder>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
