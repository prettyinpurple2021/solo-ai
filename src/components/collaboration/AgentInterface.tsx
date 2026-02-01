
'use client'

import { logError,} from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Brain, 
  Code, 
  MessageSquare, 
  Settings, 
  Activity,
  MoreHorizontal,
  TrendingUp,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'


// Types
interface Agent {
  id: string
  name: string
  specialization: string
  status: 'available' | 'busy' | 'offline' | 'error'
  capabilities: string[]
  currentSessions: number
  maxSessions: number
  description?: string
  version?: string
  lastActive?: string
  performance?: {
    successRate: number
    avgResponseTime: number
    tasksCompleted: number
    userRating: number
  }
  // Added properties
  activeSessions?: number
  activityLevel?: 'low' | 'medium' | 'high'
  personality?: string
}

interface AgentCapability {
  name: string
  description: string
  inputTypes: string[]
  outputTypes: string[]
  estimatedTime: string
  complexity: 'low' | 'medium' | 'high'
}

interface AgentActivity {
  id: string
  timestamp: string | Date
  action: string
  sessionId?: string
  details: string
  status: 'success' | 'error' | 'warning'
}

// Agent Status Component
const AgentStatusIndicator: React.FC<{ status: Agent['status']; size?: 'sm' | 'md' | 'lg' }> = ({ 
  status, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusConfig = {
    available: { color: 'bg-neon-lime', pulse: true, label: 'Available' },
    busy: { color: 'bg-neon-orange', pulse: true, label: 'Busy' },
    offline: { color: 'bg-gray-500', pulse: false, label: 'Offline' },
    error: { color: 'bg-neon-magenta', pulse: true, label: 'Error' }
  }

  const config = statusConfig[status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            sizeClasses[size],
            config.color,
            'rounded-full',
            config.pulse && 'animate-pulse'
          )} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Agent Card Component
const AgentCard: React.FC<{ agent: Agent; onSelect?: (agent: Agent) => void; compact?: boolean }> = ({ 
  agent, 
  onSelect,
  compact = false 
}) => {
  const utilisationPercentage = (agent.currentSessions / agent.maxSessions) * 100
  const [] = useState(false)

  const getAgentIcon = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'coding':
      case 'development':
        return <Code className="w-6 h-6" />
      case 'analysis':
      case 'data':
        return <TrendingUp className="w-6 h-6" />
      case 'creative':
      case 'design':
        return <Brain className="w-6 h-6" />
      case 'chat':
      case 'communication':
        return <MessageSquare className="w-6 h-6" />
      default:
        return <Bot className="w-6 h-6" />
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
           onClick={() => onSelect?.(agent)}>
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/avatars/${agent.id}.png`} />
            <AvatarFallback>
              {getAgentIcon(agent.specialization)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">
            <AgentStatusIndicator status={agent.status} size="sm" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate">{agent.name}</h4>
            <Badge variant="purple" className="mb-2">
              {agent.specialization}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {agent.currentSessions}/{agent.maxSessions} sessions
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/avatars/${agent.id}.png`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getAgentIcon(agent.specialization)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <AgentStatusIndicator status={agent.status} />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">{agent.specialization}</p>
            {agent.version && (
              <Badge variant="cyan" className="text-xs mt-1">
                v{agent.version}
              </Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getAgentIcon(agent.specialization)}
                {agent.name} - Details
              </DialogTitle>
            </DialogHeader>
            <AgentDetailsView agent={agent} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Status and Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium">{utilisationPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={utilisationPercentage} className="h-2" />

        {/* Performance Metrics */}
        {agent.performance && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-neon-lime font-mono">
                {agent.performance.successRate}%
              </div>
              <div className="text-xs text-gray-300 font-mono">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold font-mono">
                {agent.performance.avgResponseTime}s
              </div>
              <div className="text-xs text-gray-300 font-mono">Avg Response</div>
            </div>
          </div>
        )}

        {/* Capabilities Preview */}
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <Badge key={index} variant="purple" className="text-xs">
              {capability}
            </Badge>
          ))}
          {agent.capabilities.length > 3 && (
            <Badge variant="purple" className="text-xs">
              +{agent.capabilities.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            disabled={agent.status !== 'available'}
            onClick={() => onSelect?.(agent)}
          >
            {agent.status === 'available' ? 'Select Agent' : 'Unavailable'}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Agent Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  )
}

// Agent Details View Component
const AgentDetailsView: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [activities, setActivities] = useState<AgentActivity[]>([])

  // Load agent activity from API
  useEffect(() => {
    // Derived from agent.activeSessions (default to 0 if undefined)
    const activeSessions = agent.activeSessions || 0;
    
    // We can use the activeSessions prop if it was passed down, but the type definition
    // for Agent in this file doesn't match the full API response perfectly yet.
    const activityLevel = (agent as any).activityLevel || 'low';
    const agentData = agent as any
    if (agentData.activeSessions && Array.isArray(agentData.activeSessions)) {
       const mappedActivities = agentData.activeSessions.map((session: any) => ({
         id: session.id,
         timestamp: session.lastActivity || session.createdAt,
         action: 'Active Session',
         sessionId: session.id,
         details: `Working on project: ${session.projectName || 'Untitled'}`,
         status: session.status === 'error' ? 'error' : 'success'
       }))
       setActivities(mappedActivities)
    }
  }, [agent])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Current Status</h4>
            <div className="flex items-center gap-2">
              <AgentStatusIndicator status={agent.status} />
              <span className="capitalize">{agent.status}</span>
            </div>
            {agent.lastActive && (
              <p className="text-sm text-muted-foreground mt-2">
                Last active: {new Date(agent.lastActive).toLocaleString()}
              </p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-2">Session Load</h4>
            <div className="text-2xl font-bold">
              {agent.currentSessions}/{agent.maxSessions}
            </div>
            <Progress 
              value={(agent.currentSessions / agent.maxSessions) * 100} 
              className="mt-2"
            />
          </Card>
        </div>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-muted-foreground">
            {agent.description}
          </p>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Personality</h4>
            <div className="bg-muted/50 p-3 rounded-md text-sm italic">
              &ldquo;{(agent as any).personality || 'Professional and helpful.'}&rdquo;
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="capabilities" className="space-y-4">
        <div className="grid gap-4">
          {agent.capabilities.map((capability, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{capability}</h4>
                <Badge variant="purple">Capability</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                This agent is specialized in {capability}.
              </p>
            </Card>
          ))}
          {agent.capabilities.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No specific capabilities listed.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full",
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  )} />
                  <div>
                    <h5 className="font-medium">{activity.action}</h5>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    {activity.sessionId && (
                      <Badge variant="cyan" className="text-xs mt-1">
                        Session: {activity.sessionId}
                      </Badge>
                    )}
                  </div>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString()}
                </time>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        {agent.performance ? (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2 font-mono">Success Rate</h4>
              <div className="text-3xl font-bold text-neon-lime mb-2 font-mono">
                {agent.performance.successRate}%
              </div>
              <Progress value={agent.performance.successRate} className="h-2" />
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2 font-mono">Average Response Time</h4>
              <div className="text-3xl font-bold mb-2 font-mono">
                {agent.performance.avgResponseTime}s
              </div>
              <p className="text-sm text-gray-300 font-mono">
                Below 5s is considered excellent
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2 font-mono">Tasks Completed</h4>
              <div className="text-3xl font-bold text-neon-cyan font-mono">
                {agent.performance.tasksCompleted}
              </div>
              <p className="text-sm text-gray-300 font-mono">
                Total successful completions
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2 font-mono">User Rating</h4>
              <div className="text-3xl font-bold text-neon-orange font-mono">
                {agent.performance.userRating}/5
              </div>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map(star => (
                  <div key={star} className={cn(
                    "w-4 h-4",
                    star <= agent.performance!.userRating ? "text-neon-orange" : "text-gray-500"
                  )}>
                    ★
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground">
              Performance metrics will be available after the agent completes some tasks.
            </p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}

// Main Agent Interface Component
const AgentInterface: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'offline'>('all')

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/collaboration/agents')
        if (response.ok) {
          const data = await response.json()
          setAgents(data.data?.agents || [])
        }
      } catch (error) {
        logError('Error fetching agents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAgents, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredAgents = agents.filter(agent => 
    filter === 'all' || agent.status === filter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Available Agents</h2>
        <div className="flex gap-2">
          {(['all', 'available', 'busy', 'offline'] as const).map(status => (
            <Button
              key={status}
              variant={filter === status ? 'cyan' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={setSelectedAgent}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card className="p-12 text-center">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'No agents are currently registered'
              : `No agents are currently ${filter}`
            }
          </p>
        </Card>
      )}
    </div>
  )
}

export default AgentInterface
export { AgentCard, AgentStatusIndicator, AgentDetailsView }