"use client"

import { logError } from '@/lib/logger'
import, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Users, MessageSquare, Settings, Activity, Cpu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Loading } from "@/components/ui/loading"

// Import collaboration components
import MessageInterface from '@/components/collaboration/MessageInterface'
import AgentInterface from '@/components/collaboration/AgentInterface'
import SessionControls from '@/components/collaboration/SessionControls'

interface SessionData {
  id: string
  name: string
  description: string
  status: string
  type: string
  participatingAgents: string[]
  createdAt: string
  updatedAt: string
  userId: number
}

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData (null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('messages')
  const [resolvedParams, setResolvedParams] = useState<{ id: string } (null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Fetch session data
  useEffect(() => {
    if (!resolvedParams) return

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/collaboration/sessions/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setSession(data.data?.session)
        } else if (response.status === 404) {
          router.push('/dashboard/collaboration')
        }
      } catch (error) {
        logError('Error fetching session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [resolvedParams, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loading variant="pulse" size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-6 bg-black min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center bg-dark-card border-neon-cyan/30 max-w-md w-full">
          <h3 className="text-xl font-bold mb-2 text-white font-orbitron">Session Not Found</h3>
          <p className="text-gray-400 mb-6 font-mono">
            The collaboration session you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button 
            onClick={() => router.push('/dashboard/collaboration')}
            className="w-full bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collaboration Hub
          </Button>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/collaboration')}
              className="mt-1 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold font-orbitron text-white">{session.name}</h1>
                <Badge className={`${getStatusColor(session.status)} capitalize font-bold`}>
                  {session.status}
                </Badge>
              </div>
              <p className="text-gray-400 max-w-2xl">{session.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="purple" className="capitalize">
              {session.type}
            </Badge>
            <Badge variant="cyan" className="capitalize">
              <Users className="w-3 h-3 mr-2" />
              {session.participatingAgents.length} agents
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Messages and Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-dark-card border border-neon-cyan/30 p-1">
                <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <Cpu className="w-4 h-4" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <Activity className="w-4 h-4" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="mt-4">
                <Card className="bg-dark-card border-neon-cyan/30 h-[600px] flex flex-col">
                   <MessageInterface sessionId={session.id} />
                </Card>
              </TabsContent>

              <TabsContent value="agents" className="mt-4">
                 <Card className="bg-dark-card border-neon-cyan/30 p-4">
                  <AgentInterface />
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card className="bg-dark-card border-neon-cyan/30 p-6">
                  <h3 className="font-bold text-white mb-6 font-orbitron text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-cyan" />
                    Session Activity
                  </h3>
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
                    <div className="flex items-start gap-4 p-3 bg-dark-bg/50 rounded-lg relative z-10 ml-6 border border-gray-800">
                      <div className="absolute -left-[29px] top-4 w-4 h-4 bg-green-500 rounded-full border-4 border-black box-content" />
                      <div>
                        <p className="text-sm font-medium text-white">Session started</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {session.participatingAgents.map((agentId, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 bg-dark-bg/50 rounded-lg relative z-10 ml-6 border border-gray-800">
                        <div className="absolute -left-[29px] top-4 w-4 h-4 bg-blue-500 rounded-full border-4 border-black box-content" />
                        <div>
                          <p className="text-sm font-medium text-white">Agent {agentId} joined</p>
                          <p className="text-xs text-gray-500 font-mono">
                            Estimated join time
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {session.updatedAt !== session.createdAt && (
                      <div className="flex items-start gap-4 p-3 bg-dark-bg/50 rounded-lg relative z-10 ml-6 border border-gray-800">
                        <div className="absolute -left-[29px] top-4 w-4 h-4 bg-orange-500 rounded-full border-4 border-black box-content" />
                        <div>
                          <p className="text-sm font-medium text-white">Session updated</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {new Date(session.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Session Controls */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <SessionControls sessionId={session.id} />
              
              {/* Session Info */}
              <Card className="bg-dark-card border-neon-cyan/30">
                <CardHeader className="pb-3">
                  <CardTitle className="font-bold text-white flex items-center gap-2 font-orbitron text-base">
                    <Settings className="w-4 h-4 text-neon-cyan" />
                    Session Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-300">{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-300">{new Date(session.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Type</span>
                    <span className="text-neon-cyan capitalize">{session.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`capitalize font-bold ${
                      session.status === 'active' ? 'text-green-400' : 
                      session.status === 'paused' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>{session.status}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="bg-dark-card border-neon-cyan/30">
                <CardHeader className="pb-3">
                  <CardTitle className="font-bold text-white flex items-center gap-2 font-orbitron text-base">
                    <Users className="w-4 h-4 text-neon-cyan" />
                    Participants ({session.participatingAgents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {session.participatingAgents.map((agentId, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-bg rounded border border-neon-cyan/20">
                        <span className="text-sm font-medium text-gray-300 font-mono">Agent {agentId}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
                      </div>
                    ))}
                    
                    {session.participatingAgents.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4 font-mono italic">
                        No agents currently participating
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}