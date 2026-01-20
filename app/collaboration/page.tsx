"use client"

import { useState, useEffect } from "react"
import { SquadBuilder } from "@/components/collaboration/squad-builder"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CollaborationDashboard() {
  const router = useRouter()
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/collaboration/sessions?status=active')
      const data = await res.json()
      if (data.success) {
        setActiveSessions(data.data.sessions)
      }
    } catch (error) {
      console.error("Failed to load sessions", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Command Center</h1>
          <p className="text-muted-foreground">Orchestrate your AI workforce and manage collaboration sessions.</p>
        </div>
      </div>

      <Tabs defaultValue="squad" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="squad">New Mission</TabsTrigger>
          <TabsTrigger value="active">Active Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="squad" className="mt-6">
          <SquadBuilder onSessionCreated={(id) => router.push(`/collaboration/${id}`)} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl" />)
              ) : activeSessions.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                   <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                   <h3 className="text-xl font-semibold mb-2">No Active Operations</h3>
                   <p className="text-muted-foreground mb-6">Start a new mission to see it here.</p>
                   <Button onClick={() => (document.querySelector('[data-value="squad"]') as HTMLElement)?.click()}>
                     Launch Squad
                   </Button>
                </div>
              ) : (
                activeSessions.map(session => (
                    <Card key={session.id} className="bg-black/40 border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer group" onClick={() => router.push(`/collaboration/${session.id}`)}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                                <span className="text-xs text-muted-foreground">{new Date(session.updatedAt).toLocaleTimeString()}</span>
                            </div>
                            <CardTitle className="line-clamp-1 group-hover:text-purple-400 transition-colors">{session.projectName}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {session.configuration?.initialPrompt || "Collaboration session"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex -space-x-2">
                                    {session.agentDetails?.map((agent: any) => (
                                        <div 
                                            key={agent.id} 
                                            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white relative"
                                            style={{ backgroundColor: agent.accentColor }}
                                            title={agent.displayName}
                                        >
                                            {agent.displayName[0]}
                                        </div>
                                    ))}
                                    {session.agentDetails && session.agentDetails.length > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs text-white">
                                            +{session.agentDetails.length - 3}
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                    View <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
              )}
           </div>
        </TabsContent>
        
      </Tabs>
    </div>
  )
}
