'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Plus, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe,
  DollarSign,
  Package,
  Briefcase,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrapingJob {
  id: string
  competitorId: number
  userId: string
  jobType: 'website' | 'pricing' | 'products' | 'jobs'
  url: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: {
    type: 'interval' | 'cron' | 'manual'
    value: string | number
    timezone?: string
  }
  nextRunAt: string
  lastRunAt?: string
  retryCount: number
  maxRetries: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  config: {
    enableChangeDetection: boolean
    changeThreshold: number
    notifyOnChange: boolean
    storeHistory: boolean
  }
  createdAt: string
  updatedAt: string
  history?: ScrapingJobResult[]
}

interface ScrapingJobResult {
  jobId: string
  success: boolean
  data?: any
  error?: string
  executionTime: number
  changesDetected: boolean
  retryCount: number
  completedAt: string
}

interface ScrapingManagerProps {
  competitorId: number
  competitorName: string
  competitorDomain?: string
}

const JOB_TYPE_ICONS = {
  website: Globe,
  pricing: DollarSign,
  products: Package,
  jobs: Briefcase,
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-gray-100 text-gray-800',
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export function ScrapingManager({ competitorId, competitorName, competitorDomain }: ScrapingManagerProps) {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [executingJobs, setExecutingJobs] = useState<Set<string>>(new Set())

  // Form state for adding new jobs
  const [newJob, setNewJob] = useState({
    jobType: 'website' as const,
    url: '',
    frequency: {
      type: 'interval' as const,
      value: 720, // 12 hours
    },
    config: {
      enableChangeDetection: true,
      changeThreshold: 0.1,
      notifyOnChange: true,
      storeHistory: true,
    },
  })

  useEffect(() => {
    fetchJobs()
  }, [competitorId])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/competitors/${competitorId}/scraping`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch scraping jobs')
      }

      const result = await response.json()
      if (result.success) {
        setJobs(result.data.jobs || [])
        setMetrics(result.data.metrics)
      } else {
        throw new Error(result.error || 'Failed to fetch jobs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const scheduleJob = async () => {
    try {
      const response = await fetch(`/api/competitors/${competitorId}/scraping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule job')
      }

      const result = await response.json()
      if (result.success) {
        setShowAddDialog(false)
        fetchJobs() // Refresh the job list
        // Reset form
        setNewJob({
          jobType: 'website',
          url: '',
          frequency: {
            type: 'interval',
            value: 720,
          },
          config: {
            enableChangeDetection: true,
            changeThreshold: 0.1,
            notifyOnChange: true,
            storeHistory: true,
          },
        })
      } else {
        throw new Error(result.error || 'Failed to schedule job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const controlJob = async (jobId: string, action: 'pause' | 'resume' | 'cancel' | 'execute') => {
    try {
      if (action === 'execute') {
        setExecutingJobs(prev => new Set(prev).add(jobId))
      }

      const response = await fetch(`/api/scraping/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} job`)
      }

      const result = await response.json()
      if (result.success) {
        fetchJobs() // Refresh the job list
      } else {
        throw new Error(result.error || `Failed to ${action} job`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (action === 'execute') {
        setExecutingJobs(prev => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })
      }
    }
  }

  const executeImmediateScraping = async (jobType: string, url: string) => {
    try {
      const response = await fetch(`/api/competitors/${competitorId}/scraping`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobType, url }),
      })

      if (!response.ok) {
        throw new Error('Failed to execute scraping')
      }

      const result = await response.json()
      if (result.success) {
        // Show success message or handle result
        console.log('Scraping result:', result.data)
      } else {
        throw new Error(result.error || 'Scraping failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const getJobTypeIcon = (jobType: string) => {
    const Icon = JOB_TYPE_ICONS[jobType as keyof typeof JOB_TYPE_ICONS] || Globe
    return <Icon className="h-4 w-4" />
  }

  const formatNextRun = (nextRunAt: string) => {
    const date = new Date(nextRunAt)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff < 0) return 'Overdue'
    if (diff < 60000) return 'In < 1 minute'
    if (diff < 3600000) return `In ${Math.floor(diff / 60000)} minutes`
    if (diff < 86400000) return `In ${Math.floor(diff / 3600000)} hours`
    return `In ${Math.floor(diff / 86400000)} days`
  }

  const getSuccessRate = (history: ScrapingJobResult[] = []) => {
    if (history.length === 0) return 0
    return (history.filter(h => h.success).length / history.length) * 100
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Web Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Web Scraping
            </CardTitle>
            <CardDescription>
              Monitor {competitorName} across multiple channels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Scraping Job</DialogTitle>
                  <DialogDescription>
                    Configure automated monitoring for {competitorName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={newJob.jobType}
                      onValueChange={(value: any) => setNewJob(prev => ({ ...prev, jobType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website Monitoring</SelectItem>
                        <SelectItem value="pricing">Pricing Pages</SelectItem>
                        <SelectItem value="products">Product Pages</SelectItem>
                        <SelectItem value="jobs">Job Postings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={newJob.url}
                      onChange={(e) => setNewJob(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={`https://${competitorDomain || 'example.com'}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Check Frequency (minutes)</Label>
                    <Select
                      value={newJob.frequency.value.toString()}
                      onValueChange={(value) => setNewJob(prev => ({
                        ...prev,
                        frequency: { ...prev.frequency, value: parseInt(value) }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">Every hour</SelectItem>
                        <SelectItem value="240">Every 4 hours</SelectItem>
                        <SelectItem value="720">Every 12 hours</SelectItem>
                        <SelectItem value="1440">Daily</SelectItem>
                        <SelectItem value="10080">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="changeDetection">Change Detection</Label>
                      <Switch
                        id="changeDetection"
                        checked={newJob.config.enableChangeDetection}
                        onCheckedChange={(checked) => setNewJob(prev => ({
                          ...prev,
                          config: { ...prev.config, enableChangeDetection: checked }
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Notify on Changes</Label>
                      <Switch
                        id="notifications"
                        checked={newJob.config.notifyOnChange}
                        onCheckedChange={(checked) => setNewJob(prev => ({
                          ...prev,
                          config: { ...prev.config, notifyOnChange: checked }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={scheduleJob} disabled={!newJob.url}>
                      Schedule Job
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scraping jobs configured</p>
            <p className="text-sm">Add a job to start monitoring this competitor</p>
          </div>
        ) : (
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList>
              <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs" className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getJobTypeIcon(job.jobType)}
                      <div>
                        <div className="font-medium capitalize">{job.jobType} Monitoring</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {job.url}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[job.status]}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline" className={PRIORITY_COLORS[job.priority]}>
                        {job.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Next Run</div>
                      <div className="font-medium">{formatNextRun(job.nextRunAt)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-medium">{getSuccessRate(job.history).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Retries</div>
                      <div className="font-medium">{job.retryCount}/{job.maxRetries}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Run</div>
                      <div className="font-medium">
                        {job.lastRunAt ? new Date(job.lastRunAt).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {job.status === 'paused' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => controlJob(job.id, 'resume')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => controlJob(job.id, 'pause')}
                        disabled={job.status === 'running'}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => controlJob(job.id, 'execute')}
                      disabled={job.status === 'running' || executingJobs.has(job.id)}
                    >
                      {executingJobs.has(job.id) ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Run Now
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => controlJob(job.id, 'cancel')}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>

                  {job.history && job.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium mb-2">Recent Executions</div>
                      <div className="space-y-1">
                        {job.history.slice(-3).map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span>{new Date(result.completedAt).toLocaleString()}</span>
                            </div>
                            <div className="text-muted-foreground">
                              {result.executionTime}ms
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="metrics">
              {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{metrics.totalJobs}</div>
                    <div className="text-sm text-muted-foreground">Total Jobs</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{metrics.runningJobs}</div>
                    <div className="text-sm text-muted-foreground">Running</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{Math.round(metrics.averageExecutionTime)}ms</div>
                    <div className="text-sm text-muted-foreground">Avg Time</div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}