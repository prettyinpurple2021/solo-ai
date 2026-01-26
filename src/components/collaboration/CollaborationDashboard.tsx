// @ts-nocheck
'use client'

// Removed unused logger imports
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Activity, 
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  UserPlus,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


// Types
interface CollaborationSession {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  type: 'chat' | 'project' | 'handoff' | 'consultation'
  participatingAgents: string[]
  createdAt: string
  updatedAt: string
  messageCount?: number
  userId: number
  projectName?: string
}

interface Agent {
  id: string
  name: string
  specialization: string
  status: 'available' | 'busy' | 'offline'
  capabilities: string[]
  currentSessions: number
  maxSessions: number
}

interface CollaborationStats {
  activeSessions: number
  totalSessions: number
  availableAgents: number
  totalMessages: number
  avgSessionDuration: number
}

const CollaborationDashboard: React.FC = () => {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<CollaborationStats>({
    activeSessions: 0,
    totalSessions: 0,
    availableAgents: 0,
    totalMessages: 0,
    avgSessionDuration: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'pause' | 'resume' | 'complete'>('pause')
  const [confirmSessionId, setConfirmSessionId] = useState<string | null>(null)

  // Helpers
  const computeStats = (sess: CollaborationSession[], ags: Agent[]) => {
    const activeSessions = sess.filter(s => s.status === 'active').length
    const availableAgents = ags.filter(a => a.status === 'available').length
    const totalMessages = sess.reduce((sum, s) => sum + (s.messageCount || 0), 0)
    setStats({
      activeSessions,
      totalSessions: sess.length,
      availableAgents,
      totalMessages,
      avgSessionDuration: 45
    })
  }

  // Fetch collaboration data
  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setError(null)
      try {
        const [sessionsResponse, agentsResponse] = await Promise.all([
          fetch('/api/collaboration/sessions', { cache: 'no-store' }),
          fetch('/api/collaboration/agents', { cache: 'no-store' })
        ])

        let nextSessions: CollaborationSession[] = []
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          nextSessions = sessionsData.data?.sessions || []
        }

        let nextAgents: Agent[] = []
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json()
          nextAgents = agentsData.data?.agents || []
        }

        if (!cancelled) {
          setSessions(nextSessions)
          setAgents(nextAgents)
          computeStats(nextSessions, nextAgents)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load collaboration data')
          toast({ title: 'Load failed', description: 'Could not load collaboration data', variant: 'destructive' })
          setLoading(false)
        }
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [toast])

  // Actions
  const handleJoinSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/collaboration/sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', agentId: 'assistant' })
      })
      if (!res.ok) throw new Error('Failed to join session')
      toast({ title: 'Joined session', description: 'You have joined the session.' })
      // Refresh
      const r = await fetch('/api/collaboration/sessions', { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        setSessions(j.data?.sessions || [])
      }
    } catch {
      toast({ title: 'Join failed', description: 'Could not join session', variant: 'destructive' })
    }
  }

  const handlePauseResume = async (sessionId: string, action: 'pause' | 'resume') => {
    try {
      const res = await fetch(`/api/collaboration/sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!res.ok) throw new Error('Failed to update session')
      toast({ title: `Session ${action}d`, description: `Session has been ${action}d.` })
      // Refresh
      const r = await fetch('/api/collaboration/sessions', { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        setSessions(j.data?.sessions || [])
      }
    } catch {
      toast({ title: 'Update failed', description: 'Could not update session', variant: 'destructive' })
    }
  }

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/collaboration/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      })
      if (!res.ok) throw new Error('Failed to complete session')
      toast({ title: 'Session completed', description: 'Session marked as completed.' })
      const r = await fetch('/api/collaboration/sessions', { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        setSessions(j.data?.sessions || [])
      }
    } catch {
      toast({ title: 'Complete failed', description: 'Could not complete session', variant: 'destructive' })
    }
  }

  const openConfirm = (sessionId: string, action: 'pause' | 'resume' | 'complete') => {
    setConfirmSessionId(sessionId)
    setConfirmAction(action)
    setConfirmOpen(true)
  }

  const handleCreateSession = async () => {
    try {
      const res = await fetch('/api/collaboration/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoal || 'New Collaboration Session', requiredAgents: selectedAgentIds })
      })
      if (!res.ok) throw new Error('Failed to create session')
      toast({ title: 'Session created', description: 'New session has been created.' })
      const r = await fetch('/api/collaboration/sessions', { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        setSessions(j.data?.sessions || [])
      }
      setShowCreateDialog(false)
      setNewGoal('')
      setSelectedAgentIds([])
    } catch {
      toast({ title: 'Create failed', description: 'Could not create session', variant: 'destructive' })
    }
  }

  // Filter sessions based on search and status
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-dark-card text-neon-lime border border-neon-lime'
      case 'paused': return 'bg-dark-card text-neon-orange border border-neon-orange'
      case 'completed': return 'bg-dark-card text-neon-cyan border border-neon-cyan'
      case 'cancelled': return 'bg-dark-card text-gray-500 border border-gray-700'
      default: return 'bg-dark-card text-gray-500 border border-gray-700'
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-dark-card text-neon-lime border border-neon-lime'
      case 'busy': return 'bg-dark-card text-neon-magenta border border-neon-magenta'
      case 'offline': return 'bg-dark-card text-gray-500 border border-gray-700'
      default: return 'bg-dark-card text-gray-500 border border-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-gray-100 rounded shimmer mb-2" />
            <div className="h-4 w-72 bg-gray-100 rounded shimmer" />
          </div>
          <div className="h-10 w-36 bg-gray-100 rounded shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-6 w-28 bg-gray-100 rounded shimmer mb-2" />
              <div className="h-5 w-16 bg-gray-100 rounded shimmer" />
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="skull-loading" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-sm bg-dark-card border border-neon-magenta text-neon-magenta font-mono">{error}</div>
        <Button onClick={() => { location.reload() }}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron uppercase tracking-wider text-white">Collaboration Hub</h1>
          <p className="text-gray-300 font-mono">
            Manage and participate in multi-agent collaboration sessions
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-card border border-neon-lime rounded-sm">
              <Activity className="w-4 h-4 text-neon-lime" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 font-mono">Active Sessions</p>
              <p className="text-2xl font-bold font-mono">{stats.activeSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-card border border-neon-cyan rounded-sm">
              <FileText className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 font-mono">Total Sessions</p>
              <p className="text-2xl font-bold font-mono">{stats.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-card border border-neon-purple rounded-sm">
              <Users className="w-4 h-4 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 font-mono">Available Agents</p>
              <p className="text-2xl font-bold font-mono">{stats.availableAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-card border border-neon-orange rounded-sm">
              <MessageSquare className="w-4 h-4 text-neon-orange" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 font-mono">Total Messages</p>
              <p className="text-2xl font-bold font-mono">{stats.totalMessages}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-card border border-neon-cyan rounded-sm">
              <Settings className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 font-mono">Avg Duration</p>
              <p className="text-2xl font-bold font-mono">{stats.avgSessionDuration}m</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search sessions"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter sessions by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{session.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getStatusColor(session.status))}>
                      {session.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-300 font-mono">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.participatingAgents.length} agents
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {session.messageCount || 0} messages
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => handleJoinSession(session.id)}>
                      Join Session
                    </Button>
                    {session.status === 'active' ? (
                      <Button size="sm" variant="outline" onClick={() => openConfirm(session.id, 'pause')}>
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => openConfirm(session.id, 'resume')}>
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openConfirm(session.id, 'complete')}>Complete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first collaboration session to get started'
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold font-mono">{agent.name}</h3>
                    <p className="text-sm text-gray-300 font-mono">{agent.specialization}</p>
                  </div>
                  <Badge className={cn("text-xs", getAgentStatusColor(agent.status))}>
                    {agent.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sessions: </span>
                    {agent.currentSessions}/{agent.maxSessions}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button size="sm" className="w-full mt-3" disabled={agent.status !== 'available'}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite to Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-orbitron uppercase tracking-wider text-white">Session Activity</h3>
              <div className="h-64 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-mono">Analytics dashboard coming soon</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-orbitron uppercase tracking-wider text-white">Agent Performance</h3>
              <div className="h-64 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-mono">Performance metrics coming soon</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>Define the goal and choose agents to participate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Input id="goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="e.g., Research competitor pricing" />
            </div>
            <div>
              <Label>Agents</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-56 overflow-auto">
                {agents.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedAgentIds.includes(a.id)}
                      onChange={(e) => {
                        setSelectedAgentIds((prev) => e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id))
                      }}
                    />
                    <span>{a.name} <span className="text-muted-foreground">({a.specialization})</span></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSession}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              {confirmAction === 'complete' ? 'Mark this session as completed?' : `Are you sure you want to ${confirmAction} this session?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const id = confirmSessionId
              setConfirmOpen(false)
              if (!id) return
              if (confirmAction === 'complete') {
                handleCompleteSession(id)
              } else {
                handlePauseResume(id, confirmAction)
              }
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CollaborationDashboard