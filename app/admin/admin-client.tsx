'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { 
  Crown,
  Shield, 
  Activity, 
  BarChart3, 
  Server, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Eye,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type AdminStatus = {
  uptimeSeconds: number
  serverTime: string
  notifications: {
    status: { running: boolean; lastProcessedAt: string | null }
    stats: {
      pending: number
      processing: number
      completed: number
      failed: number
      cancelled: number
      total: number
    }
  }
  scraping: {
    running: boolean
    lastLoopAt: string | null
    metrics: {
      totalJobs: number
      pendingJobs: number
      runningJobs: number
      completedJobs: number
      failedJobs: number
      averageExecutionTime: number
    }
  }
  database: {
    connectionCount: number
    queryCount: number
    averageQueryTime: number
  }
  system: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
}

export default function AdminClient() {
  const { user, loading } = useAuth()
  const [adminStatus, setAdminStatus] = useState<AdminStatus (null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string (null)

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/status')
        if (!response.ok) {
          throw new Error('Failed to fetch admin status')
        }
        const data = await response.json()
        setAdminStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminStatus()
    const interval = setInterval(fetchAdminStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card className="p-8 text-center bg-dark-card border-2 border-neon-magenta/30 shadow-[0_0_30px_rgba(255,0,110,0.2)]">
          <CardContent>
            <Shield className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
            <h1 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase tracking-wider">Access Denied</h1>
            <p className="text-gray-300 font-mono">You don't have permission to access this area.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b-2 border-neon-magenta/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(255,0,110,0.3)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </motion.div>
                <span className="font-orbitron text-lg font-bold text-white uppercase tracking-wider">SoloSuccess AI</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-neon-cyan/40 text-gray-300 hover:text-neon-cyan font-mono">
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="magenta" onClick={() => window.location.reload()} className="shadow-[0_0_15px_rgba(255,0,110,0.3)] font-orbitron uppercase tracking-wider">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1 border border-neon-magenta/30 bg-neon-magenta/10 rounded-sm mb-6">
                <Shield className="w-4 h-4 text-neon-magenta" />
                <span className="text-neon-magenta font-orbitron font-bold text-xs uppercase tracking-wider">
                  Neural Command Center
                </span>
              </div>
              
              <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider">
                Cyberpunk <span className="text-neon-magenta">Admin</span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-2xl font-mono">
                Monitor and control your AI platform with neon-grade precision. 
                Real-time system status and neural operations management.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-mono">Loading neural status...</p>
              </div>
            ) : error ? (
              <Card className="p-8 text-center bg-dark-card border-2 border-neon-magenta/30 shadow-[0_0_30px_rgba(255,0,110,0.2)]">
                <CardContent>
                  <AlertTriangle className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase tracking-wider">Status Error</h2>
                  <p className="text-gray-400 font-mono">{error}</p>
                </CardContent>
              </Card>
            ) : adminStatus ? (
              <>
                {/* System Status Overview */}
                <div className="mb-12">
                  <Card className="p-8 bg-dark-card border-2 border-neon-magenta/30 shadow-[0_0_30px_rgba(255,0,110,0.2)]">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-3xl font-bold text-white mb-6 uppercase tracking-wider">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                            <Server className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase tracking-wider">
                            {formatUptime(adminStatus.uptimeSeconds)}
                          </h3>
                          <p className="text-gray-400 font-mono">Uptime</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                            <Activity className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                            {adminStatus.system.cpuUsage}%
                          </h3>
                          <p className="text-gray-400 font-mono">CPU Usage</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-orange to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                            <Database className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                            {adminStatus.system.memoryUsage}%
                          </h3>
                          <p className="text-gray-400 font-mono">Memory Usage</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                            <BarChart3 className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                            {adminStatus.database.queryCount}
                          </h3>
                          <p className="text-gray-400 font-mono">Database Queries</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Service Status */}
                <div className="mb-12">
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                    <div>
                      <Card className="p-8 bg-dark-card border-2 border-neon-cyan/30 shadow-[0_0_30px_rgba(11,228,236,0.2)]">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="font-orbitron text-2xl font-bold text-white uppercase tracking-wider">Notification Service</CardTitle>
                            <div className="flex items-center gap-2">
                              {adminStatus.notifications.status.running ? (
                                <CheckCircle className="w-5 h-5 text-neon-lime" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-neon-magenta" />
                              )}
                              <span className={`text-sm font-mono font-bold uppercase tracking-wider ${
                                adminStatus.notifications.status.running ? 'text-neon-lime' : 'text-neon-magenta'
                              }`}>
                                {adminStatus.notifications.status.running ? 'Running' : 'Stopped'}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-magenta mb-1">
                                {adminStatus.notifications.stats.pending}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Pending</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-orange mb-1">
                                {adminStatus.notifications.stats.processing}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Processing</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-lime mb-1">
                                {adminStatus.notifications.stats.completed}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Completed</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <Card className="p-8 bg-dark-card border-2 border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="font-orbitron text-2xl font-bold text-white uppercase tracking-wider">Scraping Service</CardTitle>
                            <div className="flex items-center gap-2">
                              {adminStatus.scraping.running ? (
                                <CheckCircle className="w-5 h-5 text-neon-lime" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-neon-magenta" />
                              )}
                              <span className={`text-sm font-mono font-bold uppercase tracking-wider ${
                                adminStatus.scraping.running ? 'text-neon-lime' : 'text-neon-magenta'
                              }`}>
                                {adminStatus.scraping.running ? 'Running' : 'Stopped'}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-cyan mb-1">
                                {adminStatus.scraping.metrics.totalJobs}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Total Jobs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-orange mb-1">
                                {adminStatus.scraping.metrics.runningJobs}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Running</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold font-orbitron text-neon-lime mb-1">
                                {adminStatus.scraping.metrics.completedJobs}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">Completed</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                  <Card className="p-8 bg-dark-card border-2 border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-3xl font-bold text-white mb-6 uppercase tracking-wider">Neural Operations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button variant="cyan" className="font-orbitron uppercase tracking-wider shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                          <Play className="w-4 h-4 mr-2" />
                          Start Services
                        </Button>
                        
                        <Button variant="outline" className="border-neon-magenta/40 text-gray-300 hover:text-neon-magenta font-orbitron uppercase tracking-wider">
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Services
                        </Button>
                        
                        <Button variant="outline" className="border-neon-orange/40 text-gray-300 hover:text-neon-orange font-orbitron uppercase tracking-wider">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restart System
                        </Button>
                        
                        <Button variant="outline" className="border-neon-purple/40 text-gray-300 hover:text-neon-purple font-orbitron uppercase tracking-wider">
                          <Eye className="w-4 h-4 mr-2" />
                          View Logs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

