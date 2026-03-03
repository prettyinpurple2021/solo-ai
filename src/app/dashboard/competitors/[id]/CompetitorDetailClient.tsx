"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Settings, Clock, ExternalLink, Brain, Crosshair, Plus,} from 'lucide-react'

import { CyberButton } from '@/components/cyber/CyberButton'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompetitorDetailData } from '@/lib/services/competitor-service'

interface CompetitorDetailClientProps {
  initialData: CompetitorDetailData;
  competitorId: string;
}

export default function CompetitorDetailClient({ initialData, competitorId }: CompetitorDetailClientProps) {
  const router = useRouter()
  const { competitor, activities, alerts, insights } = initialData

  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [insightFilter, setInsightFilter] = useState<string>('all')

  const handleRefresh = async () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const filteredActivities = activities.filter(activity =>
    activityFilter === 'all' || activity.activity_type === activityFilter
  )

  const filteredInsights = insights.filter(insight =>
    insightFilter === 'all' || insight.opportunity_type === insightFilter
  )

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
          <TabsList className="grid w-full grid-cols-6 bg-dark-card border border-gray-800">
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
                    <p className="text-gray-400 font-mono">{competitor?.description || 'No description provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white font-mono">Industry</h4>
                      <p className="text-gray-400 font-mono">{competitor?.industry || 'Unknown'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white font-mono">Status</h4>
                      <p className="text-gray-400 font-mono">{competitor?.monitoring_status}</p>
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
                        competitor?.threat_level === 'critical' ? 'magenta' :
                        competitor?.threat_level === 'high' ? 'orange' :
                        competitor?.threat_level === 'medium' ? 'purple' :
                        'lime'
                    }
                    className="mb-2"
                  >
                    {competitor?.threat_level?.toUpperCase()} THREAT
                  </Badge>
                  <p className="text-sm text-gray-400 font-mono mt-4">
                    {competitor?.threat_level === 'critical' ? 'Critical threat - Immediate action required' :
                     competitor?.threat_level === 'high' ? 'High threat - Frequent monitoring' :
                     competitor?.threat_level === 'medium' ? 'Standard threat - Regular monitoring' :
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
                {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
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
                          {activity.activity_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 font-mono">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(activity.detected_at).toLocaleString()}
                        </span>
                        {activity.source_url && (
                          <a href={activity.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-neon-cyan transition-colors">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500 font-mono">
                    No activity logs found for this competitor.
                  </div>
                )}
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
                {insights.length > 0 ? insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 bg-white/5 rounded-lg border-l-4 ${
                      insight.impact === 'high' ? 'border-neon-magenta' :
                      insight.impact === 'medium' ? 'border-neon-orange' :
                      'border-neon-cyan'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white font-mono">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.impact === 'high' ? 'magenta' :
                          insight.impact === 'medium' ? 'orange' :
                          'cyan'
                        }
                        className="text-xs"
                      >
                        {insight.opportunity_type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 font-mono">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <Badge variant="lime" className="text-[10px] py-0">
                          {Math.round(insight.confidence * 100)}% CONFIDENCE
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {new Date(insight.detected_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12 text-gray-500 font-mono">
                    No strategic insights generated yet.
                  </div>
                )}
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
                        Aura
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
                {alerts.length > 0 ? alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 bg-white/5 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-neon-magenta' :
                      alert.severity === 'urgent' || alert.severity === 'high' ? 'border-neon-orange' :
                        alert.severity === 'warning' || alert.severity === 'medium' ? 'border-neon-orange' :
                          'border-neon-cyan'
                      } ${!alert.is_read ? 'bg-opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white font-mono">{alert.title}</h4>
                          <Badge
                            variant={
                                alert.severity === 'critical' ? 'magenta' :
                                alert.severity === 'urgent' || alert.severity === 'high' ? 'orange' :
                                alert.severity === 'warning' || alert.severity === 'medium' ? 'orange' :
                                'cyan'
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.is_read && (
                            <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2 font-mono">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <CyberButton variant="outline" size="sm">
                        View Details
                      </CyberButton>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500 font-mono">
                    No active alerts for this competitor.
                  </div>
                )}
              </div>
            </HudBorder>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
