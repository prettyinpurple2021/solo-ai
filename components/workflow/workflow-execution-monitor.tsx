"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  Download,
  Filter,
  Search,
  Zap,
  Activity,
  Mail,
  Webhook,
  GitBranch,
  Loader2,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HolographicButton } from '@/components/ui/holographic-button'
import { HolographicCard } from '@/components/ui/holographic-card'
import { HolographicLoader } from '@/components/ui/holographic-loader'
import { useToast } from '@/hooks/use-toast'
import { logger, logError, logInfo } from '@/lib/logger'
import type { WorkflowExecution, WorkflowExecutionStep } from '@/lib/workflow-engine'

// Types
interface WorkflowExecutionMonitorProps {
  executionId?: string | number
  onStopExecution?: (executionId: string) => void
  onRetryExecution?: (executionId: string) => void
  onViewDetails?: (executionId: string) => void
  className?: string
}

interface ExecutionStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  runningExecutions: number
  averageExecutionTime: number
  successRate: number
  executionsToday: number
  executionsThisWeek: number
  executionsThisMonth: number
}

// Mock execution data (in real implementation, this would come from API)
const MOCK_EXECUTIONS: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'workflow-1',
    workflowName: 'Lead Nurturing Automation',
    status: 'running',
    startedAt: new Date(Date.now() - 300000), // 5 minutes ago
    completedAt: null,
    duration: null,
    executionTime: 300000,
    nodeResults: new Map<string, unknown>(),
    progress: 65,
    currentStep: 'Sending follow-up email',
    steps: [
      { id: 'step-1', name: 'Trigger workflow', status: 'completed', startedAt: new Date(Date.now() - 300000), completedAt: new Date(Date.now() - 295000), duration: 5000, output: { triggered: true } },
      { id: 'step-2', name: 'Validate lead data', status: 'completed', startedAt: new Date(Date.now() - 295000), completedAt: new Date(Date.now() - 290000), duration: 5000, output: { validated: true } },
      { id: 'step-3', name: 'Send welcome email', status: 'completed', startedAt: new Date(Date.now() - 290000), completedAt: new Date(Date.now() - 280000), duration: 10000, output: { emailSent: true } },
      { id: 'step-4', name: 'Send follow-up email', status: 'running', startedAt: new Date(Date.now() - 60000), completedAt: null, duration: null, output: null },
      { id: 'step-5', name: 'Update CRM', status: 'pending', startedAt: null, completedAt: null, duration: null, output: null },
      { id: 'step-6', name: 'Schedule next task', status: 'pending', startedAt: null, completedAt: null, duration: null, output: null }
    ],
    variables: { leadId: 'lead-123', email: 'john@example.com', source: 'website' },
    error: null,
    logs: [
      { timestamp: new Date(Date.now() - 300000), level: 'info', message: 'Workflow execution started' },
      { timestamp: new Date(Date.now() - 295000), level: 'info', message: 'Lead data validated successfully' },
      { timestamp: new Date(Date.now() - 290000), level: 'info', message: 'Welcome email sent to john@example.com' },
      { timestamp: new Date(Date.now() - 60000), level: 'info', message: 'Sending follow-up email...' }
    ],
    metadata: {
      executedBy: 'user-1',
      environment: 'production',
      version: '1.2.0',
      retryCount: 0,
      maxRetries: 3
    }
  },
  {
    id: 'exec-2',
    workflowId: 'workflow-2',
    workflowName: 'Customer Onboarding Flow',
    status: 'completed',
    startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
    completedAt: new Date(Date.now() - 600000), // 10 minutes ago
    duration: 1200000, // 20 minutes
    executionTime: 1200000,
    nodeResults: new Map<string, unknown>(),
    progress: 100,
    currentStep: null,
    steps: [
      { id: 'step-1', name: 'Send welcome email', status: 'completed', startedAt: new Date(Date.now() - 1800000), completedAt: new Date(Date.now() - 1750000), duration: 50000, output: { emailSent: true } },
      { id: 'step-2', name: 'Create user account', status: 'completed', startedAt: new Date(Date.now() - 1750000), completedAt: new Date(Date.now() - 1700000), duration: 50000, output: { accountCreated: true } },
      { id: 'step-3', name: 'Setup onboarding tasks', status: 'completed', startedAt: new Date(Date.now() - 1700000), completedAt: new Date(Date.now() - 1600000), duration: 100000, output: { tasksCreated: 5 } },
      { id: 'step-4', name: 'Send getting started guide', status: 'completed', startedAt: new Date(Date.now() - 1600000), completedAt: new Date(Date.now() - 700000), duration: 900000, output: { guideSent: true } }
    ],
    variables: { userId: 'user-456', email: 'sarah@example.com', plan: 'premium' },
    error: null,
    logs: [
      { timestamp: new Date(Date.now() - 1800000), level: 'info', message: 'Customer onboarding started for user-456' },
      { timestamp: new Date(Date.now() - 1750000), level: 'info', message: 'Welcome email sent successfully' },
      { timestamp: new Date(Date.now() - 1700000), level: 'info', message: 'User account created' },
      { timestamp: new Date(Date.now() - 1600000), level: 'info', message: 'Onboarding tasks setup completed' },
      { timestamp: new Date(Date.now() - 700000), level: 'info', message: 'Getting started guide sent' },
      { timestamp: new Date(Date.now() - 600000), level: 'success', message: 'Customer onboarding completed successfully' }
    ],
    metadata: {
      executedBy: 'user-1',
      environment: 'production',
      version: '1.1.0',
      retryCount: 0,
      maxRetries: 3
    }
  },
  {
    id: 'exec-3',
    workflowId: 'workflow-3',
    workflowName: 'Social Media Scheduler',
    status: 'failed',
    startedAt: new Date(Date.now() - 3600000), // 1 hour ago
    completedAt: new Date(Date.now() - 3300000), // 30 minutes ago
    duration: 300000, // 5 minutes
    executionTime: 300000,
    nodeResults: new Map<string, unknown>(),
    progress: 33,
    currentStep: null,
    steps: [
      { id: 'step-1', name: 'Fetch scheduled posts', status: 'completed', startedAt: new Date(Date.now() - 3600000), completedAt: new Date(Date.now() - 3550000), duration: 50000, output: { postsFound: 3 } },
      { id: 'step-2', name: 'Validate content', status: 'completed', startedAt: new Date(Date.now() - 3550000), completedAt: new Date(Date.now() - 3500000), duration: 50000, output: { validated: true } },
      { id: 'step-3', name: 'Post to Twitter', status: 'failed', startedAt: new Date(Date.now() - 3500000), completedAt: new Date(Date.now() - 3450000), duration: 50000, output: null },
      { id: 'step-4', name: 'Post to LinkedIn', status: 'pending', startedAt: null, completedAt: null, duration: null, output: null },
      { id: 'step-5', name: 'Post to Facebook', status: 'pending', startedAt: null, completedAt: null, duration: null, output: null }
    ],
    variables: { posts: [{ id: 'post-1', content: 'Hello world!', platform: 'twitter' }] },
    error: { message: 'Twitter API rate limit exceeded', step: 'Post to Twitter', timestamp: new Date(Date.now() - 3450000) },
    logs: [
      { timestamp: new Date(Date.now() - 3600000), level: 'info', message: 'Social media posting started' },
      { timestamp: new Date(Date.now() - 3550000), level: 'info', message: 'Found 3 scheduled posts' },
      { timestamp: new Date(Date.now() - 3500000), level: 'info', message: 'Content validation completed' },
      { timestamp: new Date(Date.now() - 3450000), level: 'error', message: 'Twitter API rate limit exceeded' },
      { timestamp: new Date(Date.now() - 3300000), level: 'error', message: 'Workflow execution failed' }
    ],
    metadata: {
      executedBy: 'user-1',
      environment: 'production',
      version: '1.0.0',
      retryCount: 1,
      maxRetries: 3
    }
  }
]

// Mock stats data
const MOCK_STATS: ExecutionStats = {
  totalExecutions: 1247,
  successfulExecutions: 1156,
  failedExecutions: 67,
  runningExecutions: 3,
  averageExecutionTime: 180000, // 3 minutes
  successRate: 92.7,
  executionsToday: 45,
  executionsThisWeek: 234,
  executionsThisMonth: 892
}

// Status colors
type ExtendedStatus = WorkflowExecution['status'] | WorkflowExecutionStep['status'] | 'paused'

const STATUS_COLORS: Record<ExtendedStatus, string> = {
  pending: '#6B7280',
  running: '#3B82F6',
  completed: '#10B981',
  failed: '#EF4444',
  cancelled: '#F59E0B',
  paused: '#8B5CF6',
  skipped: '#94A3B8'
}

// Status icons
const STATUS_ICONS: Record<ExtendedStatus, LucideIcon> = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: Square,
  paused: Pause,
  skipped: AlertCircle
}

export function WorkflowExecutionMonitor({
  executionId,
  onStopExecution,
  onRetryExecution,
  onViewDetails,
  className = ""
}: WorkflowExecutionMonitorProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>(MOCK_EXECUTIONS)
  const [stats, setStats] = useState<ExecutionStats>(MOCK_STATS)
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null)
  const [filteredExecutions, setFilteredExecutions] = useState<WorkflowExecution[]>(MOCK_EXECUTIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'logs' | 'analytics'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-refresh executions
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshExecutions()
      }, 5000) // Refresh every 5 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh])

  // Filter executions
  useEffect(() => {
    let filtered = executions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(exec => {
        const name = (exec.workflowName ?? 'Untitled workflow').toLowerCase()
        return name.includes(query) || String(exec.id).toLowerCase().includes(query)
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exec => exec.status === statusFilter)
    }

    // Sort by most recent first
    filtered.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

    setFilteredExecutions(filtered)
  }, [executions, searchQuery, statusFilter])

  // Refresh executions
  const refreshExecutions = useCallback(async () => {
    setLoading(true)
    try {
      // In real implementation, this would fetch from API
      logInfo('Refreshing workflow executions')
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setLoading(false)
    } catch (error) {
      logError('Failed to refresh executions:', error)
      setLoading(false)
    }
  }, [])

  // Handle stop execution
  const handleStopExecution = useCallback((execId: string | number) => {
    setExecutions(prev => prev.map(exec =>
      exec.id === execId
        ? { ...exec, status: 'cancelled' as const, completedAt: new Date() }
        : exec
    ))

    onStopExecution?.(String(execId))
    logInfo('Workflow execution stopped', { executionId: execId })

    toast({
      title: 'Execution Stopped',
      description: 'Workflow execution has been stopped',
      variant: 'success'
    })
  }, [onStopExecution, toast])

  // Handle retry execution
  const handleRetryExecution = useCallback((execId: string | number) => {
    onRetryExecution?.(String(execId))
    logInfo('Workflow execution retry requested', { executionId: execId })

    toast({
      title: 'Retrying Execution',
      description: 'Workflow execution is being retried',
      variant: 'success'
    })
  }, [onRetryExecution, toast])

  // Handle view details
  const handleViewDetails = useCallback((execId: string | number) => {
    const execution = executions.find(e => e.id === execId)
    if (execution) {
      setSelectedExecution(execution)
    }
    onViewDetails?.(String(execId))
    logInfo('Viewing execution details', { executionId: execId })
  }, [executions, onViewDetails])

  // Toggle step expansion
  const toggleStepExpansion = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }, [])

  // Format duration
  const formatDuration = useCallback((ms: number | null) => {
    if (!ms) return 'N/A'

    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }, [])

  // Format relative time
  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }, [])

  // Render execution card
  const renderExecutionCard = useCallback((execution: WorkflowExecution) => {
    const StatusIcon = STATUS_ICONS[execution.status]
    const isRunning = execution.status === 'running'
    const steps = execution.steps ?? []
    const completedSteps = steps.filter(s => s.status === 'completed').length
    const retryCount = Number(execution.metadata?.retryCount ?? 0)
    const maxRetries = Number(execution.metadata?.maxRetries ?? 0)
    const durationLabel = execution.duration ? formatDuration(execution.duration) : 'Running'

    return (
      <motion.div
        key={execution.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <HolographicCard className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse badge-status-${execution.status}`}
                />
                <StatusIcon
                  className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''} text-status-${execution.status}`}
                />
                <div>
                  <CardTitle className="text-lg">{execution.workflowName}</CardTitle>
                  <CardDescription className="text-sm">
                    ID: {execution.id} • {formatRelativeTime(execution.startedAt)}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`badge-status-${execution.status} bg-opacity-20`}
                >
                  {execution.status}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(execution.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Progress */}
              {isRunning && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-gray-400">{execution.progress}%</span>
                  </div>
                  <Progress value={execution.progress} className="h-2" />
                  {execution.currentStep && (
                    <p className="text-xs text-gray-400 mt-1">{execution.currentStep}</p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Duration</div>
                  <div className="font-semibold text-gray-300">{durationLabel}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Steps</div>
                  <div className="font-semibold text-gray-300">
                    {completedSteps}/{steps.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Retries</div>
                  <div className="font-semibold text-gray-300">
                    {retryCount}/{maxRetries}
                  </div>
                </div>
              </div>

              {/* Error */}
              {execution.error && (
                <div className="bg-red-900/20 border border-red-800/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-300">Error</span>
                  </div>
                  <p className="text-xs text-red-400">
                    {typeof execution.error === 'string' ? execution.error : execution.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isRunning && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStopExecution(execution.id)}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                )}

                {execution.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetryExecution(execution.id)}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}

                <HolographicButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(execution.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </HolographicButton>
              </div>
            </div>
          </CardContent>
        </HolographicCard>
      </motion.div>
    )
  }, [formatRelativeTime, formatDuration, handleStopExecution, handleRetryExecution, handleViewDetails])

  // Render execution details
  const renderExecutionDetails = useCallback((execution: WorkflowExecution) => {
    if (!execution) return null

    const steps = execution.steps ?? []
    const logs = execution.logs ?? []

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{execution.workflowName}</h3>
            <p className="text-gray-400">Execution ID: {execution.id}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedExecution(null)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Steps */}
        <div>
          <h4 className="font-semibold mb-3">Execution Steps</h4>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isExpanded = expandedSteps.has(step.id)
              const StatusIcon = STATUS_ICONS[step.status]

              return (
                <div key={step.id} className="border border-purple-800/30 rounded-lg">
                  <button
                    onClick={() => toggleStepExpansion(step.id)}
                    className="w-full p-3 text-left hover:bg-purple-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <StatusIcon
                        className={`h-4 w-4 text-status-${step.status}`}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-gray-400">
                          {step.status} • {step.duration ? formatDuration(step.duration) : 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.startedAt && (
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(step.startedAt)}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && step.output !== undefined && step.output !== null && (
                    <div className="px-3 pb-3 border-t border-purple-800/30">
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Output</h5>
                        <pre className="text-xs bg-black/30 rounded p-2 overflow-x-auto">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Logs */}
        <div>
          <h4 className="font-semibold mb-3">Execution Logs</h4>
          <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 min-w-[60px]">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs min-w-[60px] justify-center badge-log-${log.level}`}
                  >
                    {log.level}
                  </Badge>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }, [expandedSteps, toggleStepExpansion, formatDuration, formatRelativeTime])

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold boss-heading">Execution Monitor</h2>
            <p className="text-gray-300 mt-1">Monitor and manage workflow executions</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshExecutions}
              disabled={loading}
            >
              {loading ? (
                <HolographicLoader size="sm" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>

            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-1" />
              Auto Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalExecutions}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.successfulExecutions}</div>
            <div className="text-xs text-gray-400">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.failedExecutions}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.runningExecutions}</div>
            <div className="text-xs text-gray-400">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.executionsToday}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.executionsThisWeek}</div>
            <div className="text-xs text-gray-400">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.executionsThisMonth}</div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedExecution ? (
            <ScrollArea className="h-full">
              {renderExecutionDetails(selectedExecution)}
            </ScrollArea>
          ) : (
            <>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search executions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input-dark-lg pl-10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input-dark"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {/* Executions List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredExecutions.map(renderExecutionCard)}
                </AnimatePresence>
              </div>

              {filteredExecutions.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No Executions Found</h3>
                    <p className="text-gray-500">No workflow executions match your current filters</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
