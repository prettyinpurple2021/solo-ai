"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Bot, Clock, Users, Play, Pause, Square, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  fromAgent: string
  content: string
  timestamp: string
  messageType: 'request' | 'response' | 'notification' | 'system' | 'handoff'
  metadata?: any
}

interface Agent {
  id: string
  displayName: string
  accentColor: string
  status: string
}

interface Session {
  id: string
  projectName: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  participatingAgents: string[] // IDs
  agentDetails: Agent[] // Expanded details
  createdAt: string
  sessionType?: string
}

interface ActiveSessionViewProps {
  sessionId: string
}

export function ActiveSessionView({ sessionId }: ActiveSessionViewProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Polling for updates
  useEffect(() => {
    fetchSessionData()
    const interval = setInterval(fetchSessionData, 3000) // Poll every 3s
    return () => clearInterval(interval)
  }, [sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchSessionData = async () => {
    try {
      // Fetch session details
      const sessionRes = await fetch(`/api/collaboration/sessions/${sessionId}`)
      const sessionData = await sessionRes.json()
      
      if (sessionData.success) {
        setSession(sessionData.data)
      }

      // Fetch messages
      const msgsRes = await fetch(`/api/collaboration/sessions/${sessionId}/messages`)
      const msgsData = await msgsRes.json()
      
      if (msgsData.success) {
        // Only update if new messages? For now just replace
        // Optimization: compare IDs or length
        setMessages(msgsData.data.messages)
      }
    } catch (error) {
      console.error("Error fetching session data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputText,
          messageType: 'request' // User request
        })
      })

      const data = await response.json()
      if (data.success) {
        setInputText("")
        fetchSessionData() // Refresh immediately
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleControlAction = async (action: 'pause' | 'resume' | 'complete') => {
    try {
      // Call control API (assuming it exists or using generic update)
      // For now, let's assume a patch to route or specific action endpoint
      // Using generic session update for status
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        fetchSessionData()
        toast({ title: `Session ${action}d` })
      }
    } catch (error) {
       toast({
        title: "Action failed",
        variant: "destructive"
      })
    }
  }

  if (isLoading && !session) {
    return (
        <div className="flex items-center justify-center h-[500px]">
             <motion.div 
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-muted-foreground"
             >
                Connecting to Squad...
             </motion.div>
        </div>
    )
  }

  if (!session) return <div>Session not found</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      
      {/* Main Chat Area */}
      <Card className="lg:col-span-3 flex flex-col border-purple-500/20 bg-black/40 backdrop-blur-xl h-full overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-3 h-3 rounded-full animate-pulse",
                        session.status === 'active' ? "bg-green-500" : 
                        session.status === 'paused' ? "bg-yellow-500" : "bg-gray-500"
                    )} />
                    <div>
                        <CardTitle>{session.projectName}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono mt-1">ID: {session.id.slice(0,8)}...</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {session.status === 'active' ? (
                        <Button variant="outline" size="sm" onClick={() => handleControlAction('pause')}>
                            <Pause className="w-4 h-4 mr-2" /> Pause
                        </Button>
                    ) : (
                         <Button variant="outline" size="sm" onClick={() => handleControlAction('resume')}>
                            <Play className="w-4 h-4 mr-2" /> Resume
                        </Button>
                    )}
                     <Button variant="destructive" size="sm" onClick={() => handleControlAction('complete')}>
                        <Square className="w-4 h-4 mr-2" /> End
                    </Button>
                </div>
            </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.map((msg) => {
                        const isUser = msg.fromAgent === 'user'
                        const isSystem = msg.fromAgent === 'system'
                        const agent = session.agentDetails.find(a => a.id === msg.fromAgent)
                        
                        // Grouping logic could go here
                        
                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <div className="bg-white/5 rounded-full px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                                        <Bot className="w-3 h-3" />
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex gap-4 max-w-[80%]",
                                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <Avatar className="w-10 h-10 border border-white/10 mt-1">
                                    <AvatarFallback 
                                        style={{ backgroundColor: isUser ? '#3b82f6' : agent?.accentColor }}
                                        className="text-white font-bold"
                                    >
                                        {isUser ? 'ME' : agent?.displayName.substring(0,2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className={cn(
                                    "rounded-2xl p-4 shadow-sm",
                                    isUser ? "bg-blue-600/80 text-white rounded-tr-none" : "bg-white/10 text-gray-200 rounded-tl-none"
                                )}>
                                    {!isUser && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span style={{ color: agent?.accentColor }} className="text-xs font-bold uppercase tracking-wider">
                                                {agent?.displayName}
                                            </span>
                                            {msg.messageType === 'handoff' && (
                                                <Badge className="text-[10px] h-4 border-yellow-500/50 text-yellow-500">
                                                    Handoff
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                    <div className="mt-2 text-[10px] opacity-50 flex justify-end">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-end gap-2">
                    <Textarea 
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         placeholder={session.status === 'active' ? "Type a message to your squad..." : "Session is paused"}
                         className="bg-white/5 border-white/10 min-h-[50px] max-h-[150px] resize-none focus:ring-purple-500/50"
                         disabled={session.status !== 'active' || isSending}
                         onKeyDown={(e) => {
                             if(e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault()
                                 handleSendMessage()
                             }
                         }}
                    />
                    <Button 
                        size="icon" 
                        className="h-[50px] w-[50px] bg-purple-600 hover:bg-purple-500"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || session.status !== 'active' || isSending}
                    >
                        {isSending ? (
                            <motion.div animate={{ rotate: 360 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Sidebar: Details & Agents */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-black/20 border-white/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Squad Members
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {session.agentDetails.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.accentColor }} />
                        <div>
                            <p className="text-sm font-medium">{agent.displayName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-white/5">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    Session Info
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>Started</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Type</span>
                    <span className="capitalize">{session.sessionType}</span>
                </div>
                <Separator className="bg-white/10" />
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white">
                    View Full Transcript <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </CardContent>
        </Card>
      </div>

    </div>
  )
}
