"use client"

export const dynamic = 'force-dynamic'

import, { useState, useEffect, useCallback } from 'react'
import { motion,} from 'framer-motion'
import {
  BarChart3, Activity, Target, Users, DollarSign, Download, RefreshCw, Crown, ArrowUp, ArrowDown,} from 'lucide-react'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


import Link from 'next/link'
import { useAuth } from "@/hooks/use-auth"

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const {} = useAuth()

  const [analyticsData, setAnalyticsData] = useState<any>({
    overview: { totalRevenue: 0, revenueGrowth: 0, activeUsers: 0, userGrowth: 0, conversionRate: 0, conversionGrowth: 0, avgSessionTime: 0, sessionGrowth: 0 },
    metrics: [],
    topPages: [],
    recentActivity: []
  })

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const { data } = await response.json()
        const mappedData = {
          overview: {
            totalRevenue: data.businessMetrics.revenue || 0,
            revenueGrowth: 0,
            activeUsers: data.businessMetrics.activeUsers || 0,
            userGrowth: 0,
            conversionRate: data.businessMetrics.conversionRate || 0,
            conversionGrowth: 0,
            avgSessionTime: 0,
            sessionGrowth: 0
          },
          metrics: [
            { title: "Revenue Generated", value: `$${data.businessMetrics.revenue || 0}`, change: "+0%", trend: "up", icon: DollarSign, color: "text-green-400" },
            { title: "Active Users", value: (data.businessMetrics.activeUsers || 0).toLocaleString(), change: "+0%", trend: "up", icon: Users, color: "text-blue-400" },
            { title: "Conversion Rate", value: `${data.businessMetrics.conversionRate || 0}%`, change: "+0%", trend: "up", icon: Target, color: "text-neon-purple" },
            { title: "Total Events", value: (data.events?.length || 0).toLocaleString(), change: "+0%", trend: "up", icon: Activity, color: "text-orange-400" }
          ],
          topPages: [
            { page: "/dashboard", views: 0, growth: 0 },
            { page: "/analytics", views: 0, growth: 0 }
          ],
          recentActivity: data.events?.slice(0, 10).map((e: any) => ({
            action: e.event.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            time: new Date(e.timestamp).toLocaleString(),
            type: e.event.includes('user') ? 'user' : 'system'
          })) || []
        }
        setAnalyticsData(mappedData)
      }
    } catch (error) {
      logError('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleRefresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/90 backdrop-blur-sm border-b border-neon-purple/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.4)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-orbitron text-xl font-bold text-white">SOLOSUCCESS AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <CyberButton variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading} className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton size="sm" className="bg-neon-purple hover:bg-neon-purple/90">
                  Export Report
                </CyberButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-neon-purple font-mono text-sm uppercase tracking-wider">
                      Intelligence Center
                    </span>
                  </div>

                  <h1 className="font-orbitron text-5xl font-bold text-white mb-4">
                    ANALYTICS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">DASHBOARD</span>
                  </h1>

                  <p className="text-xl text-gray-400 max-w-2xl font-mono">
                    Monitor your business performance with advanced intelligence and insights.
                    Track every metric that matters for growth.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-dark-card border-neon-purple/30 text-white rounded-none px-4 py-2 focus:border-neon-purple focus:outline-none font-mono"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {analyticsData.metrics.map((metric: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                      <HudBorder variant="hover" className="h-full p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.4)]">
                          <metric.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-neon-lime" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-neon-magenta" />
                          )}
                          <span className={`text-sm font-mono ${metric.trend === 'up' ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-orbitron text-3xl font-bold text-white mb-2">
                        {metric.value}
                      </h3>

                      <p className="text-gray-400 text-sm uppercase tracking-wider font-mono">
                        {metric.title}
                      </p>
                    </HudBorder>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Analytics Tabs */}
            <div className="max-w-7xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-dark-card border border-neon-purple/30 rounded-none">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="revenue" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Revenue
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
                    <Activity className="w-4 h-4 mr-2" />
                    Performance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <HudBorder variant="hover" className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-orbitron text-2xl font-bold text-white">Revenue Trends</h3>
                        <CyberButton variant="ghost" size="sm" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </CyberButton>
                      </div>

                      <div className="h-64 flex items-center justify-center bg-dark-bg/50 rounded-none border border-neon-purple/20">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                          <p className="text-gray-400 font-mono">Revenue chart visualization</p>
                        </div>
                      </div>
                    </HudBorder>

                    {/* Top Pages */}
                    <HudBorder variant="hover" className="p-8">
                      <h3 className="font-orbitron text-2xl font-bold text-white mb-6">Top Performing Pages</h3>

                      <div className="space-y-4">
                        {analyticsData.topPages.map((page: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-none bg-neon-purple/20 flex items-center justify-center">
                                <span className="text-neon-purple font-bold text-sm">{index + 1}</span>
                              </div>
                              <span className="text-white font-medium font-orbitron">{page.page}</span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-gray-400 font-mono">{page.views} views</span>
                              <div className="flex items-center gap-1">
                                {page.growth > 0 ? (
                                  <ArrowUp className="w-3 h-3 text-neon-lime" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-neon-magenta" />
                                )}
                                <span className={`text-sm font-mono ${page.growth > 0 ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                                  {page.growth}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </HudBorder>
                  </div>

                  {/* Recent Activity */}
                  <HudBorder variant="hover" className="p-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-6">Recent Activity</h3>

                    <div className="space-y-4">
                      {analyticsData.recentActivity.map((activity: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-dark-bg/50 rounded-none border border-neon-cyan/20"
                        >
                          <div className="w-10 h-10 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                            <Activity className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1">
                            <p className="text-white font-medium font-orbitron">{activity.action}</p>
                            <p className="text-gray-400 text-sm font-mono">{activity.time}</p>
                          </div>

                          <div className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded-none uppercase tracking-wider font-mono">
                            {activity.type}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </HudBorder>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-8">
                  <HudBorder variant="hover" className="p-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-6">Revenue Analysis</h3>
                    <div className="h-64 flex items-center justify-center bg-dark-bg/50 rounded-none border border-neon-purple/20">
                      <div className="text-center">
                        <DollarSign className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                        <p className="text-gray-400 font-mono">Revenue analytics visualization</p>
                      </div>
                    </div>
                  </HudBorder>
                </TabsContent>

                <TabsContent value="users" className="space-y-8">
                  <HudBorder variant="hover" className="p-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-6">User Analytics</h3>
                    <div className="h-64 flex items-center justify-center bg-dark-bg/50 rounded-none border border-neon-purple/20">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                        <p className="text-gray-400 font-mono">User analytics visualization</p>
                      </div>
                    </div>
                  </HudBorder>
                </TabsContent>

                <TabsContent value="performance" className="space-y-8">
                  <HudBorder variant="hover" className="p-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-6">Performance Metrics</h3>
                    <div className="h-64 flex items-center justify-center bg-dark-bg/50 rounded-none border border-neon-purple/20">
                      <div className="text-center">
                        <Activity className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                        <p className="text-gray-400 font-mono">Performance metrics visualization</p>
                      </div>
                    </div>
                  </HudBorder>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
    </div>
  )
}