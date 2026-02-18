
"use client"

import React, { useState } from 'react'
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
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CollaborationSession, AgentInfo } from '@/lib/services/collaboration-service'
import { createSession, updateSessionStatus } from '@/lib/actions/collaboration-actions'

interface CollaborationClientProps {
  initialSessions: CollaborationSession[];
  initialAgents: AgentInfo[];
  user: any;
}

export function CollaborationClient({ initialSessions, initialAgents, user }: CollaborationClientProps) {
  const [sessions, setSessions] = useState<CollaborationSession[]>(initialSessions)
  const [agents, setAgents] = useState<AgentInfo[]>(initialAgents)
  const [activeTab, setActiveTab] = useState('sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)

  const handleCreateSession = async () => {
    if (!newGoal.trim()) return
    setIsPending(true)
    try {
      const result = await createSession({ 
        goal: newGoal, 
        name: newGoal,
        requiredAgents: selectedAgentIds 
      })
      if (result.success) {
        toast.success("Collaboration session initialized.")
        setShowCreateDialog(false)
        setNewGoal('')
        setSelectedAgentIds([])
        // For a full production experience, we'd ideally get the new session back 
        // or wait for the page to revalidate.
      }
    } catch (error) {
      toast.error("Failed to create session.")
    } finally {
      setIsPending(false)
    }
  }

  const handleUpdateStatus = async (sessionId: string, status: any) => {
    try {
      await updateSessionStatus(sessionId, status)
      toast.success(`Session ${status}.`)
    } catch (error) {
      toast.error("Status update failed.")
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.goal?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-dark-card text-neon-lime border border-neon-lime'
      case 'paused': return 'bg-dark-card text-neon-orange border border-neon-orange'
      case 'completed': return 'bg-dark-card text-neon-cyan border border-neon-cyan'
      default: return 'bg-dark-card text-gray-500 border border-gray-700'
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-dark-card text-neon-lime border border-neon-lime'
      case 'busy': return 'bg-dark-card text-neon-magenta border border-neon-magenta'
      default: return 'bg-dark-card text-gray-500 border border-gray-700'
    }
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
        <Button className="flex items-center gap-2 font-bold uppercase tracking-tighter" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          New Session
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-black/40 border border-white/10">
          <TabsTrigger value="sessions" className="flex items-center gap-2 font-mono uppercase">
            <FileText className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2 font-mono uppercase">
            <Users className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 font-mono uppercase">
            <Activity className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-none focus:outline-none focus:border-neon-cyan font-mono text-sm text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-none focus:outline-none focus:border-neon-cyan font-mono text-sm text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="p-4 bg-dark-card border-white/5 hover:border-neon-cyan/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white uppercase tracking-tight">{session.name}</h3>
                    <p className="text-xs text-gray-400 font-mono line-clamp-2">
                      {session.goal}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-none", getStatusColor(session.status))}>
                      {session.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-neon-cyan" />
                      {session.messageCount} messages
                    </div>
                    <div>
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1 font-bold uppercase tracking-tighter bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20">
                      Sync Link
                    </Button>
                    {session.status === 'active' ? (
                      <Button size="sm" variant="outline" className="border-white/10 hover:border-neon-orange" onClick={() => handleUpdateStatus(session.id, 'paused')}>
                        <Pause className="w-4 h-4 text-neon-orange" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-white/10 hover:border-neon-lime" onClick={() => handleUpdateStatus(session.id, 'active')}>
                        <Play className="w-4 h-4 text-neon-lime" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-4 bg-dark-card border-white/5 hover:border-neon-purple/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold font-mono text-white uppercase tracking-tight">{agent.name}</h3>
                    <p className="text-[10px] text-neon-purple font-mono uppercase tracking-widest">{agent.specialization}</p>
                  </div>
                  <Badge className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-none", getAgentStatusColor(agent.status))}>
                    {agent.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-[9px] bg-white/5 text-gray-400 border-none rounded-none font-mono uppercase">
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  <Button size="sm" className="w-full mt-3 font-bold uppercase tracking-tighter" disabled={agent.status !== 'available'}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enlist
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-12 bg-black/20 border-white/5 border-dashed flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-lg font-orbitron text-gray-500 uppercase">System Insights Offline</h3>
            <p className="text-sm text-gray-600 font-mono mt-2">Analytical subroutines are currently synchronizing.</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-zinc-950 border-neon-cyan/30 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-neon-cyan uppercase">Initialize Session</DialogTitle>
            <DialogDescription className="font-mono text-gray-400">Define the objective and enlist agents for collaboration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal" className="font-mono uppercase text-xs text-gray-500">Objective</Label>
              <Input 
                id="goal" 
                value={newGoal} 
                onChange={(e) => setNewGoal(e.target.value)} 
                placeholder="Enter tactical goal..." 
                className="bg-black/50 border-white/10 rounded-none focus:border-neon-cyan text-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono uppercase text-xs text-gray-500">Operatives</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-56 overflow-auto p-2 border border-white/5 bg-black/20">
                {agents.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm font-mono cursor-pointer hover:text-neon-cyan transition-colors">
                    <input
                      type="checkbox"
                      className="accent-neon-cyan"
                      checked={selectedAgentIds.includes(a.id)}
                      onChange={(e) => {
                        setSelectedAgentIds((prev) => e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id))
                      }}
                    />
                    <span>{a.name} <span className="text-[9px] text-gray-600">[{a.specialization}]</span></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-none font-mono uppercase" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSession} disabled={isPending} className="bg-neon-cyan text-black font-bold uppercase tracking-tighter rounded-none hover:bg-neon-cyan/80">
              {isPending ? "INITIALIZING..." : "INITIALIZE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
