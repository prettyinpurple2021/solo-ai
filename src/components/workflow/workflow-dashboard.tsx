"use client"

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {  Plus,
  Download,
  Upload,
  Info,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Workflow as WorkflowIcon,
  Zap,
  Clock,
  Eye
} from 'lucide-react'
import { CyberButton } from '@/components/cyber/CyberButton'
import { Badge } from '@/components/ui/badge'
import { VisualWorkflowBuilder } from './visual-workflow-builder'
import { WorkflowTemplates } from './workflow-templates'
import { WorkflowExecutionMonitor } from './workflow-execution-monitor'
import { cn } from '@/lib/utils'
import { logInfo, logError } from '@/lib/logger'
import { useToast } from '@/hooks/use-toast'
import type { Workflow } from '@/lib/workflow-engine'
interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  runningExecutions: number
  successRate: number
  averageExecutionTime: number
  popularTemplates: any[]
  recentActivity: any[]
}

const INITIAL_STATS: WorkflowStats = {
  totalWorkflows: 0,
  activeWorkflows: 0,
  totalExecutions: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  runningExecutions: 0,
  successRate: 0,
  averageExecutionTime: 0,
  popularTemplates: [],
  recentActivity: []
}

interface WorkflowDashboardProps {
    className?: string
}

// Map PrimaryButton to CyberButton for compatibility
const PrimaryButton = CyberButton
export function WorkflowDashboard({ className = "" }: WorkflowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates' | 'executions'>('overview')
  const [stats, setStats] = useState<WorkflowStats>(INITIAL_STATS)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  
  const { toast } = useToast()

  // Fetch stats on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/workflows/stats')
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        logError('Failed to fetch workflow stats', error)
      }
    }
    fetchStats()
  }, [])



  // Handle template selection
  const handleSelectTemplate = useCallback((template: any) => {
    setSelectedWorkflow(template.workflow)
    setActiveTab('builder')
    logInfo('Template selected for workflow creation', { templateId: template.id })
    
    toast({
      title: 'Template Loaded',
      description: `${template.name} has been loaded into the workflow builder`,
      variant: 'success'
    })
  }, [toast])

  // Handle create custom workflow
  const handleCreateCustom = useCallback(() => {
    // setIsCreatingWorkflow(true) - Removed as it's not defined
    setSelectedWorkflow(null)
    setActiveTab('builder')
    logInfo('Creating custom workflow')
    
    toast({
      title: 'Custom Workflow',
      description: 'Starting with a blank workflow template',
      variant: 'success'
    })
  }, [toast])

  // Handle workflow save
  const handleSaveWorkflow = useCallback((workflow: Workflow) => {
    logInfo('Workflow saved', { workflowId: workflow.id, name: workflow.name })
    
    toast({
      title: 'Workflow Saved',
      description: `${workflow.name} has been saved successfully`,
      variant: 'success'
    })
  }, [toast])

  // Handle workflow execution
  const handleExecuteWorkflow = useCallback(async (workflow: Workflow) => {
    try {
        logInfo('Workflow execution started', { workflowId: workflow.id })
        
        const response = await fetch('/api/workflows/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId: workflow.id })
        })

        const data = await response.json()

        if (data.success) {
             toast({
              title: 'Workflow Started',
              description: `${workflow.name} is now executing`,
              variant: 'success'
            })
            setActiveTab('executions')
        } else {
            throw new Error(data.error || 'Failed to start execution')
        }
    } catch (error) {
        logError('Failed to execute workflow', error)
        toast({
            title: 'Execution Failed',
            description: 'Could not start workflow execution',
            variant: 'destructive'
        })
    }
  }, [toast])

  // Format duration
  const formatDuration = useCallback((ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else {
      return `${minutes}m`
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

  // Get activity icon
  const getActivityIcon = useCallback((type: string, status?: string) => {
    switch (type) {
      case 'execution':
        return status === 'success' ? CheckCircle : status === 'error' ? AlertCircle : Activity
      case 'workflow_created':
        return Plus
      case 'template_downloaded':
        return Download
      default:
        return Info
    }
  }, [])

  // Get activity color
  const getActivityColor = useCallback((status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      default:
        return 'text-blue-500'
    }
  }, [])

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold boss-heading">Workflow Automation</h1>
            <p className="text-gray-300 mt-1">Automate your business processes with intelligent workflows</p>
          </div>
          
          <div className="flex items-center gap-2">
            <PrimaryButton
              variant="cyan"
              onClick={() => setActiveTab('templates')}
            >
              <Download className="h-4 w-4 mr-2" />
              Browse Templates
            </PrimaryButton>
            
            <PrimaryButton
              variant="cyan"
              onClick={handleCreateCustom}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </PrimaryButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className={cn("p-4 text-center border-2 border-neon-purple bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-purple">{stats.totalWorkflows}</div>
            <div className="text-xs text-gray-400">Total Workflows</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-lime bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-lime">{stats.activeWorkflows}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-cyan bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-cyan">{stats.totalExecutions}</div>
            <div className="text-xs text-gray-400">Total Executions</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-lime bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-lime">{stats.successfulExecutions}</div>
            <div className="text-xs text-gray-400">Successful</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-magenta bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-magenta">{stats.failedExecutions}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-orange bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-orange">{stats.runningExecutions}</div>
            <div className="text-xs text-gray-400">Running</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-purple bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-purple">{stats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          
          <div className={cn("p-4 text-center border-2 border-neon-cyan bg-dark-card rounded-sm")}>
            <div className="text-2xl font-bold text-neon-cyan">{formatDuration(stats.averageExecutionTime)}</div>
            <div className="text-xs text-gray-400">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-purple-800/30 bg-black/10 backdrop-blur-sm p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-1">
                <WorkflowIcon className="h-3 w-3" />
                Builder
              </TabsTrigger>
            </TabsList>

            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="templates" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Monitor
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Popular Templates */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Popular Templates
                </h3>
                <div className="space-y-2">
                  {stats.popularTemplates.slice(0, 3).map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        // In real implementation, this would load the template
                        logInfo('Popular template clicked', { templateId: template.id })
                      }}
                      className="w-full p-3 text-left border border-purple-800/30 rounded-lg hover:border-purple-500 hover:bg-purple-900/20 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm group-hover:text-purple-300 transition-colors">
                          {template.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-400">{template.rating}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.downloads.toLocaleString()} downloads
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stats.recentActivity.map(activity => {
                    const ActivityIcon = getActivityIcon(activity.type, activity.status)
                    const activityColor = getActivityColor(activity.status)

                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-900/20 transition-colors">
                        <ActivityIcon className={`h-4 w-4 mt-0.5 ${activityColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    onClick={() => setActiveTab('builder')}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Workflow
                  </PrimaryButton>
                  
                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    onClick={() => setActiveTab('templates')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Browse Templates
                  </PrimaryButton>
                  
                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    onClick={() => setActiveTab('executions')}
                    className="w-full justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View Executions
                  </PrimaryButton>
                  
                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    onClick={() => {
                      // Import workflow functionality
                      logInfo('Import workflow requested')
                    }}
                    className="w-full justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Workflow
                  </PrimaryButton>
                </div>
              </div>
            </TabsContent>

            {/* Builder Tab */}
            <TabsContent value="builder" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Workflow Builder</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Design and configure your automation workflows
                </p>
                
                <div className="space-y-2">
                  <PrimaryButton
                    size="sm"
                    onClick={handleCreateCustom}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start from Scratch
                  </PrimaryButton>
                  
                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    onClick={() => setActiveTab('templates')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Use Template
                  </PrimaryButton>
                </div>
              </div>

              {selectedWorkflow && (
                <div className="border border-purple-800/30 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Current Workflow</h4>
                  <p className="text-xs text-gray-400 mb-2">{selectedWorkflow.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="text-xs">
                      {selectedWorkflow.nodes.length} nodes
                    </Badge>
                    <Badge variant="purple" className="text-xs">
                      {selectedWorkflow.edges.length} connections
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Templates</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Browse pre-built workflow templates
                </p>
                
                <PrimaryButton
                  size="sm"
                  onClick={() => {
                    // This will be handled by the main templates component
                    setActiveTab('templates')
                  }}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Browse All Templates
                </PrimaryButton>
              </div>
            </TabsContent>

            {/* Executions Tab */}
            <TabsContent value="executions" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Execution Monitor</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Monitor and manage workflow executions
                </p>
                
                <PrimaryButton
                  size="sm"
                  onClick={() => {
                    // This will be handled by the main executions component
                    setActiveTab('executions')
                  }}
                  className="w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View All Executions
                </PrimaryButton>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 h-full"
              >
                <div className="text-center">
                  <WorkflowIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Welcome to Workflow Automation</h2>
                  <p className="text-gray-400 mb-6">
                    Automate your business processes with intelligent workflows. 
                    Choose from templates or create custom automation.
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <PrimaryButton onClick={handleCreateCustom}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </PrimaryButton>
                    
                    <PrimaryButton
                      variant="cyan"
                      onClick={() => setActiveTab('templates')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Browse Templates
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <VisualWorkflowBuilder
                  workflow={selectedWorkflow || undefined}
                  onSave={handleSaveWorkflow}
                  onExecute={handleExecuteWorkflow}
                />
              </motion.div>
            )}

            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <WorkflowTemplates
                  onSelectTemplate={handleSelectTemplate}
                  onCreateCustom={handleCreateCustom}
                />
              </motion.div>
            )}

            {activeTab === 'executions' && (
              <motion.div
                key="executions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <WorkflowExecutionMonitor />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
