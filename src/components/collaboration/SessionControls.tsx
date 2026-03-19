'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play,
  Pause,
  Square,
  UserPlus,
  UserMinus,
  Settings,
  Crown,
  Shield,
  Clock,
  Database,
  Search,
  Tag,
  Filter,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Activity,
  Users,
  MessageSquare,
  Brain,
  BookOpen,
  Star,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


// Types
interface SessionControlState {
  sessionId: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  isOwner: boolean
  isParticipant: boolean
  availableActions: string[]
  participants: Array<{
    agentId: string
    status: string
  }>
}

interface ContextEntry {
  id: string
  sessionId: string
  agentId: string
  contextType: 'conversation' | 'task' | 'knowledge' | 'preference' | 'state'
  key: string
  value: any
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  timestamp: string
  expiresAt?: string
  metadata?: Record<string, any>
}

// Session Control Panel Component
const SessionControlPanel: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [controlState, setControlState] = useState<SessionControlState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('')

  // Available agents for joining
  const [availableAgents, setAvailableAgents] = useState<Array<{
    id: string
    name: string
    specialization: string
    status: string
  }>>([])

  // Fetch session control state
  useEffect(() => {
    if (!sessionId) {
      return
    }

    const fetchControlState = async () => {
      try {
        const response = await fetch(`/api/collaboration/sessions/${sessionId}/control`)
        if (response.ok) {
          const data = await response.json()
          setControlState(data.data)
        }
      } catch (error) {
        logError(
          'Error fetching control state:',
          error instanceof Error ? error : new Error(String(error)),
        )
      } finally {
        setLoading(false)
      }
    }

    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/collaboration/agents')
        if (response.ok) {
          const data = await response.json()
          setAvailableAgents(data.data?.agents || [])
        }
      } catch (error) {
        logError(
          'Error fetching agents:',
          error instanceof Error ? error : new Error(String(error)),
        )
      }
    }

    void fetchControlState()
    void fetchAgents()
    const interval = setInterval(() => void fetchControlState(), 10000)
    return () => clearInterval(interval)
  }, [sessionId])

  // Handle session actions
  const handleAction = async (action: string, additionalData: any = {}) => {
    setActionLoading(action)
    
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...additionalData
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Action completed successfully')
        
        // Refresh control state
        const stateResponse = await fetch(`/api/collaboration/sessions/${sessionId}/control`)
        if (stateResponse.ok) {
          const stateData = await stateResponse.json()
          setControlState(stateData.data)
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Action failed')
      }
    } catch (error) {
      logError('Error performing action:', error)
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
      setShowJoinDialog(false)
    }
  }

  // Handle join session
  const handleJoinSession = () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent')
      return
    }
    
    handleAction('join', {
      agentId: selectedAgentId,
      capabilities: ['collaboration', 'communication']
    })
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-24">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    )
  }

  if (!controlState) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Unable to load session controls</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Session Controls
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={
            controlState.status === 'active' ? 'default' :
            controlState.status === 'paused' ? 'secondary' :
            'outline'
          }>
            {controlState.status}
          </Badge>
          {controlState.isOwner && (
            <Badge variant="outline" className="text-neon-orange border-neon-orange">
              <Crown className="w-3 h-3 mr-1" />
              Owner
            </Badge>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Participants ({controlState.participants.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {controlState.participants.map((participant, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {participant.agentId}
              <span className={cn(
                "ml-1 w-2 h-2 rounded-full",
                participant.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              )} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Control Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Pause/Resume */}
          {controlState.isOwner && controlState.availableActions.includes('pause') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('pause', { reason: 'Manual pause' })}
              disabled={actionLoading === 'pause'}
            >
              {actionLoading === 'pause' ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Pause className="w-4 h-4 mr-1" />
              )}
              Pause
            </Button>
          )}

          {controlState.isOwner && controlState.availableActions.includes('resume') && (
            <Button
              size="sm"
              onClick={() => handleAction('resume', { reason: 'Manual resume' })}
              disabled={actionLoading === 'resume'}
            >
              {actionLoading === 'resume' ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Resume
            </Button>
          )}

          {/* Join/Leave */}
          {controlState.availableActions.includes('join') && (
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Join
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-select">Select Agent</Label>
                    <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an agent to join with" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents.filter(agent => agent.status === 'available').map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} - {agent.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleJoinSession} disabled={!selectedAgentId || actionLoading === 'join'}>
                      {actionLoading === 'join' ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-1" />
                      )}
                      Join Session
                    </Button>
                    <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {controlState.availableActions.includes('leave') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('leave', { 
                agentId: 'current-agent',
                reason: 'User requested leave'
              })}
              disabled={actionLoading === 'leave'}
            >
              {actionLoading === 'leave' ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <UserMinus className="w-4 h-4 mr-1" />
              )}
              Leave
            </Button>
          )}
        </div>

        {/* Advanced Controls */}
        {controlState.isOwner && (
          <details className="border rounded p-2">
            <summary className="cursor-pointer font-medium text-sm">
              Advanced Controls
            </summary>
            <div className="mt-2 space-y-2">
              {controlState.availableActions.includes('transfer') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info('Transfer functionality coming soon')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Transfer Ownership
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => toast.info('Export functionality coming soon')}
              >
                <Download className="w-4 h-4 mr-1" />
                Export Session Data
              </Button>
            </div>
          </details>
        )}
      </div>
    </Card>
  )
}

// Context Management Interface Component
const ContextManagement: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [contexts, setContexts] = useState<ContextEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newContext, setNewContext] = useState({
    key: '',
    value: '',
    contextType: 'knowledge' as ContextEntry['contextType'],
    priority: 'medium' as ContextEntry['priority'],
    tags: ''
  })

  // Fetch contexts
  useEffect(() => {
    if (!sessionId) {
      return
    }

    const fetchContexts = async () => {
      try {
        const params = new URLSearchParams({ sessionId })
        const response = await fetch(`/api/collaboration/context?${params}`)
        if (response.ok) {
          const data = await response.json()
          setContexts(data.data?.entries || [])
        }
      } catch (error) {
        logError(
          'Error fetching contexts:',
          error instanceof Error ? error : new Error(String(error)),
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchContexts()
    const interval = setInterval(() => void fetchContexts(), 15000)
    return () => clearInterval(interval)
  }, [sessionId])

  // Filter contexts
  const filteredContexts = contexts.filter(context => {
    const matchesSearch = context.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         JSON.stringify(context.value).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         context.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || context.contextType === selectedType
    const matchesPriority = selectedPriority === 'all' || context.priority === selectedPriority
    
    return matchesSearch && matchesType && matchesPriority
  })

  // Handle add context
  const handleAddContext = async () => {
    try {
      const response = await fetch('/api/collaboration/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          agentId: 'user',
          contextType: newContext.contextType,
          key: newContext.key,
          value: newContext.value,
          priority: newContext.priority,
          tags: newContext.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })

      if (response.ok) {
        toast.success('Context added successfully')
        setShowAddDialog(false)
        setNewContext({
          key: '',
          value: '',
          contextType: 'knowledge',
          priority: 'medium',
          tags: ''
        })
        
        // Refresh contexts
        const fetchResponse = await fetch(`/api/collaboration/context?sessionId=${sessionId}`)
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          setContexts(data.data?.entries || [])
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add context')
      }
    } catch (error) {
      logError('Error adding context:', error)
      toast.error('Failed to add context')
    }
  }

  // Get context type icon
  const getContextTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <MessageSquare className="w-4 h-4" />
      case 'task': return <Activity className="w-4 h-4" />
      case 'knowledge': return <BookOpen className="w-4 h-4" />
      case 'preference': return <Settings className="w-4 h-4" />
      case 'state': return <Database className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-neon-magenta bg-dark-card border border-neon-magenta'
      case 'high': return 'text-neon-orange bg-dark-card border border-neon-orange'
      case 'medium': return 'text-neon-cyan bg-dark-card border border-neon-cyan'
      case 'low': return 'text-gray-300 bg-dark-card border border-gray-700'
      default: return 'text-gray-300 bg-dark-card border border-gray-700'
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-24">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Context Management
        </h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Add Context
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Context Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="context-key">Key</Label>
                <Input
                  id="context-key"
                  value={newContext.key}
                  onChange={(e) => setNewContext({ ...newContext, key: e.target.value })}
                  placeholder="e.g., project_requirements"
                />
              </div>
              <div>
                <Label htmlFor="context-value">Value</Label>
                <Textarea
                  id="context-value"
                  value={newContext.value}
                  onChange={(e) => setNewContext({ ...newContext, value: e.target.value })}
                  placeholder="Enter context data..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="context-type">Type</Label>
                  <Select value={newContext.contextType} onValueChange={(value: any) => setNewContext({ ...newContext, contextType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversation">Conversation</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="knowledge">Knowledge</SelectItem>
                      <SelectItem value="preference">Preference</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="context-priority">Priority</Label>
                  <Select value={newContext.priority} onValueChange={(value: any) => setNewContext({ ...newContext, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="context-tags">Tags</Label>
                <Input
                  id="context-tags"
                  value={newContext.tags}
                  onChange={(e) => setNewContext({ ...newContext, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddContext} disabled={!newContext.key || !newContext.value}>
                  Add Context
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search contexts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="conversation">Conversation</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="knowledge">Knowledge</SelectItem>
            <SelectItem value="preference">Preference</SelectItem>
            <SelectItem value="state">State</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Context Entries */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {filteredContexts.map(context => (
            <Card key={context.id} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getContextTypeIcon(context.contextType)}
                  <span className="font-medium">{context.key}</span>
                  <Badge className={cn("text-xs", getPriorityColor(context.priority))}>
                    {context.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(context.timestamp).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {typeof context.value === 'string' 
                  ? context.value 
                  : JSON.stringify(context.value, null, 2)
                }
              </div>
              
              {context.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {context.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {filteredContexts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Context Found</h3>
              <p className="text-sm">
                {contexts.length === 0 
                  ? 'No context has been stored yet' 
                  : 'No context matches your filters'
                }
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

// Combined Session Controls Component
const SessionControls: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  return (
    <Tabs defaultValue="controls" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="controls">Session Controls</TabsTrigger>
        <TabsTrigger value="context">Context Management</TabsTrigger>
      </TabsList>
      
      <TabsContent value="controls">
        <SessionControlPanel sessionId={sessionId} />
      </TabsContent>
      
      <TabsContent value="context">
        <ContextManagement sessionId={sessionId} />
      </TabsContent>
    </Tabs>
  )
}

export default SessionControls
export { SessionControlPanel, ContextManagement }
