"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Alert, AlertDescription} from "@/components/ui/alert"

import {
  Shield, Lock, Eye, AlertTriangle, CheckCircle, Clock, Users, Activity, Settings, Key, UserCheck, Ban} from "lucide-react"

interface SecurityMetrics {
  activeSessions: number
  totalAuditLogs: number
  failedAuthAttempts: number
  rateLimitHits: number
}

interface UserPermission {
  agentId: string
  permissions: string[]
  restrictions: string[]
  expiresAt?: string
}

interface SecurityConfig {
  requireAuthentication: boolean
  requireAuthorization: boolean
  enableRateLimiting: boolean
  enableAuditLogging: boolean
  maxConcurrentSessions: number
  sessionTimeoutMs: number
  allowedOrigins: string[]
  blockedIPs: string[]
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [config, setConfig] = useState<SecurityConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string>('roxy')

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      
      // Load security metrics
      const metricsResponse = await fetch('/api/custom-agents/security?action=metrics')
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.metrics)
      }

      // Load user permissions for all agents
      const agents = ['roxy', 'blaze', 'echo', 'lumi', 'vex', 'lexi', 'nova', 'glitch']
      const permissionData: UserPermission[] = []
      
      for (const agentId of agents) {
        const response = await fetch(`/api/custom-agents/security?action=permissions&agentId=${agentId}`)
        const data = await response.json()
        if (data.success) {
          permissionData.push(data.permissions)
        }
      }
      setPermissions(permissionData)

      // Load security configuration
      const configResponse = await fetch('/api/custom-agents/security?action=config')
      const configData = await configResponse.json()
      if (configData.success) {
        setConfig(configData.config)
      }

    } catch (error) {
      logError('Error loading security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPermissionStatus = (permissions: string[], restrictions: string[]) => {
    if (permissions.includes('*')) return 'full'
    if (permissions.length > 0 && restrictions.length === 0) return 'partial'
    if (restrictions.length > 0) return 'restricted'
    return 'none'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'bg-neon-lime'
      case 'partial': return 'bg-neon-cyan'
      case 'restricted': return 'bg-neon-orange'
      case 'none': return 'bg-neon-magenta'
      default: return 'bg-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'full': return 'Full Access'
      case 'partial': return 'Partial Access'
      case 'restricted': return 'Restricted Access'
      case 'none': return 'No Access'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
      </div>
    )
  }

  const currentPermission = permissions.find(p => p.agentId === selectedAgent)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-gray-600">Monitor and manage AI agent security</p>
        </div>
        <Button onClick={loadSecurityData} variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Refresh Security Data
        </Button>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Currently logged in
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Logs (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAuditLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Security events logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Auth Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-magenta font-mono">{metrics.failedAuthAttempts}</div>
              <p className="text-xs text-muted-foreground">
                In the last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-orange font-mono">{metrics.rateLimitHits}</div>
              <p className="text-xs text-muted-foreground">
                Rate limit exceeded
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Select Agent:</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1 border rounded-md"
              aria-label="Select agent to view permissions"
            >
              {permissions.map(permission => (
                <option key={permission.agentId} value={permission.agentId} className="capitalize">
                  {permission.agentId}
                </option>
              ))}
            </select>
          </div>

          {currentPermission && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Permission Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Access Status</CardTitle>
                  <CardDescription>Current permission level for {selectedAgent}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(getPermissionStatus(currentPermission.permissions, currentPermission.restrictions))}`} />
                      <span className="font-medium">
                        {getStatusText(getPermissionStatus(currentPermission.permissions, currentPermission.restrictions))}
                      </span>
                    </div>
                    {currentPermission.expiresAt && (
                      <div className="text-sm text-gray-300 font-mono">
                        Expires: {new Date(currentPermission.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Permissions & Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Permissions & Restrictions</CardTitle>
                  <CardDescription>Detailed access control settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Allowed Actions</h4>
                      <div className="space-y-1">
                        {currentPermission.permissions.length > 0 ? (
                          currentPermission.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No specific permissions</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Restricted Actions</h4>
                      <div className="space-y-1">
                        {currentPermission.restrictions.length > 0 ? (
                          currentPermission.restrictions.map((restriction, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                              {restriction}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No restrictions</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          {config && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Current security configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Authentication Required</span>
                      <Badge variant={config.requireAuthentication ? "default" : "secondary"}>
                        {config.requireAuthentication ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Authorization Required</span>
                      <Badge variant={config.requireAuthorization ? "default" : "secondary"}>
                        {config.requireAuthorization ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rate Limiting</span>
                      <Badge variant={config.enableRateLimiting ? "default" : "secondary"}>
                        {config.enableRateLimiting ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Audit Logging</span>
                      <Badge variant={config.enableAuditLogging ? "default" : "secondary"}>
                        {config.enableAuditLogging ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Settings</CardTitle>
                  <CardDescription>Session management configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Max Concurrent Sessions</span>
                      <div className="text-2xl font-bold">{config.maxConcurrentSessions}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Session Timeout</span>
                      <div className="text-2xl font-bold">
                        {Math.round(config.sessionTimeoutMs / (1000 * 60))} minutes
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Allowed Origins</span>
                      <div className="text-sm text-gray-300 font-mono">
                        {config.allowedOrigins.length} configured
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium font-mono">Blocked IPs</span>
                      <div className="text-sm text-gray-300 font-mono">
                        {config.blockedIPs.length} blocked
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Monitoring</CardTitle>
              <CardDescription>Real-time security monitoring and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Security Status: Active</div>
                    <div className="text-sm mt-1">
                      All security systems are operational and monitoring agent interactions.
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Authentication: Enabled</div>
                    <div className="text-sm mt-1">
                      User authentication is required for all agent interactions.
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Authorization: Active</div>
                    <div className="text-sm mt-1">
                      Permission-based access control is enforced for all agents.
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Security
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Audit Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
