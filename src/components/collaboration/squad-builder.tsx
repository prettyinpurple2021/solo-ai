"use client"

import { useState, useEffect } from "react"
import { motion,} from "framer-motion"
import { Users, Sparkles, Target, Zap, CheckCircle, Search, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Agent {
  id: string
  name: string
  displayName: string
  description: string
  capabilities: string[]
  specializations: string[]
  accentColor: string
  status: 'available' | 'busy' | 'offline'
  availability: {
    utilizationPercent: number
  }
}

interface SquadBuilderProps {
  onSessionCreated?: (sessionId: string) => void
}

export function SquadBuilder({ onSessionCreated }: SquadBuilderProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [mission, setMission] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/collaboration/agents')
      const data = await response.json()
      if (data.success) {
        setAgents(data.data.agents)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error fetching agents",
        description: "Could not load available agents. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(prev => prev.filter(id => id !== agentId))
    } else {
      if (selectedAgents.length >= 4) {
        toast({
          title: "Squad limit reached",
          description: "You can select up to 4 agents for optimal collaboration.",
          variant: "warning"
        })
        return
      }
      setSelectedAgents(prev => [...prev, agentId])
    }
  }

  const handleCreateSession = async () => {
    if (!mission.trim()) {
      toast({
        title: "Mission is missing",
        description: "Please define a goal or mission for your squad.",
        variant: "destructive"
      })
      return
    }

    if (selectedAgents.length === 0) {
      toast({
         title: "No agents selected",
         description: "Please select at least one agent to collaborate with.",
         variant: "destructive"
       })
       return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/collaboration/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal: mission,
          requiredAgents: selectedAgents,
          configuration: {
            maxParticipants: 5,
            allowDynamicAgentJoining: true
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Squad Assembled!",
          description: "Collaboration session initialized successfully.",
          variant: "default"
        })
        
        if (onSessionCreated) {
          onSessionCreated(data.data.session.id)
        } else {
          router.push(`/collaboration/${data.data.session.id}`)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
       toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAgents = agents.filter(agent => 
    agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // const recommendedAgents = agents.filter(a => a.status === 'available').slice(0, 3)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Build Your AI Squad
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Assemble a team of specialized AI agents to tackle your project. 
          Define your mission and select the best experts for the job.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Mission Control */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-purple-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Target className="w-5 h-5" />
                  <h3 className="font-semibold">Mission Objective</h3>
                </div>
                <Textarea 
                  placeholder="Describe what you want to achieve... (e.g., 'Analyze market trends for AI fitness apps and draft a launch strategy')"
                  className="min-h-[150px] bg-white/5 border-white/10 resize-none focus:ring-purple-500/50"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                   <Users className="w-5 h-5" />
                   <h3 className="font-semibold">Squad Composition</h3>
                </div>
                
                {selectedAgents.length === 0 ? (
                  <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-sm text-muted-foreground">
                    Select agents from the right to build your squad
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAgents.map(id => {
                      const agent = agents.find(a => a.id === id)
                      if (!agent) return null
                      return (
                        <div key={id} className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.accentColor }} />
                            <span className="font-medium text-sm">{agent.displayName}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:text-red-400 hover:bg-white/5"
                            onClick={() => toggleAgent(id)}
                          >
                            <span className="sr-only">Remove</span>
                            x
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-6"
                onClick={handleCreateSession}
                disabled={isSubmitting || selectedAgents.length === 0 || !mission.trim()}
              >
                 {isSubmitting ? (
                    <motion.div 
                        animate={{ rotate: 360 }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                 ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                 )}
                 Initialize Squad
              </Button>
            </CardContent>
          </Card>

          {/* Tips or Recommendations */}
          <Card className="bg-blue-500/5 border-blue-500/10">
            <CardContent className="p-4 flex gap-3">
               <Info className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
               <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-blue-300">Pro Tip</p>
                  <p>Combine a <span className="text-purple-300">Researcher</span> (Echo) with a <span className="text-pink-300">Strategist</span> (Blaze) for best results on market analysis tasks.</p>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Agent Selection */}
        <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between gap-4 bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                      className="pl-9 bg-transparent border-none focus-visible:ring-0"
                      placeholder="Search agents by name or capability..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                    {/* Filter buttons could go here */}
                </div>
             </div>

             <ScrollArea className="h-[600px] pr-4">
                 {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                        {filteredAgents.map(agent => {
                           const isSelected = selectedAgents.includes(agent.id)
                           return (
                             <motion.div
                                key={agent.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => toggleAgent(agent.id)}
                                className={`
                                   cursor-pointer group relative overflow-hidden rounded-xl border p-5 transition-all duration-300
                                   ${isSelected 
                                      ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]' 
                                      : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                                   }
                                `}
                             >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isSelected ? <CheckCircle className="w-5 h-5 text-purple-400" /> : <div className="w-5 h-5 rounded-full border border-white/30" />}
                                </div>

                                <div className="flex items-start gap-4">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                                        style={{ 
                                            backgroundColor: `${agent.accentColor}20`,
                                            color: agent.accentColor,
                                            boxShadow: isSelected ? `0 0 15px ${agent.accentColor}30` : 'none'
                                        }}
                                    >
                                        {agent.displayName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            {agent.displayName}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                            {agent.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {agent.specializations.slice(0, 3).map(spec => (
                                        <Badge 
                                            key={spec} 
                                            variant="secondary" 
                                            className="bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground border-transparent"
                                        >
                                            {spec.replace('-', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                     <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <span className="text-muted-foreground capitalize">{agent.status}</span>
                                     </div>
                                     <div className="flex items-center gap-1 text-muted-foreground">
                                        <Zap className="w-3 h-3" />
                                        <span>{agent.availability.utilizationPercent}% Load</span>
                                     </div>
                                </div>
                             </motion.div>
                           )
                        })}
                    </div>
                 )}
             </ScrollArea>
        </div>

      </div>
    </div>
  )
}
