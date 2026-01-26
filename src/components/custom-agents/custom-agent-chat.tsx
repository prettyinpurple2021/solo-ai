"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence} from "framer-motion"
import { useCustomAgents, Workflow} from "@/hooks/use-custom-agents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Badge} from "@/components/ui/badge"
import { ScrollArea} from "@/components/ui/scroll-area"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { 
  Brain, Users, Workflow as WorkflowIcon, Send, Loader2, CheckCircle, AlertCircle, TrendingUp, Target, Zap} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "agent" | "collaboration"
  content: string
  agentId?: string
  confidence?: number
  reasoning?: string
  suggestedActions?: string[]
  timestamp: Date
}

interface CustomAgentChatProps {
  className?: string
}

const AGENT_COLORS = {
  roxy: "bg-neon-purple",
  blaze: "bg-neon-orange", 
  echo: "bg-neon-purple",
  lumi: "bg-neon-lime",
  vex: "bg-neon-cyan",
  lexi: "bg-neon-purple",
  nova: "bg-neon-cyan",
  glitch: "bg-neon-magenta"
}

const AGENT_NAMES = {
  roxy: "Roxy",
  blaze: "Blaze",
  echo: "Echo", 
  lumi: "Lumi",
  vex: "Vex",
  lexi: "Lexi",
  nova: "Nova",
  glitch: "Glitch"
}

export function CustomAgentChat({ className = "" }: CustomAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("auto")
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    sendMessage,
    executeWorkflow,
    isLoading,
    error,
    insights
  } = useCustomAgents({
    onWorkflowCreated: (workflow) => {
      setActiveWorkflow(workflow)
      addMessage({
        role: "agent",
        content: `🚀 New collaborative workflow created: "${workflow.name}" with ${workflow.steps.length} steps. Ready to execute!`,
        agentId: "system"
      })
    },
    onWorkflowCompleted: (workflow) => {
      addMessage({
        role: "agent", 
        content: `✅ Workflow "${workflow.name}" completed successfully! All agents have finished their tasks.`,
        agentId: "system"
      })
      setActiveWorkflow(null)
    }
  })

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message
    addMessage({
      role: "user",
      content: userMessage
    })

    try {
      const agentId = selectedAgent === "auto" ? undefined : selectedAgent
      const result = await sendMessage(userMessage, agentId)

      // Add primary agent response
      addMessage({
        role: "agent",
        content: result.primaryResponse.content,
        agentId: agentId || "roxy",
        confidence: result.primaryResponse.confidence,
        reasoning: result.primaryResponse.reasoning,
        suggestedActions: result.primaryResponse.suggestedActions
      })

      // Add collaboration responses
      for (const collabResponse of result.collaborationResponses) {
        addMessage({
          role: "collaboration",
          content: collabResponse.content,
          agentId: collabResponse.agentId,
          confidence: collabResponse.confidence,
          reasoning: collabResponse.reasoning
        })
      }

    } catch (error) {
      addMessage({
        role: "agent",
        content: `❌ Error: ${error instanceof Error ? error.message : "Failed to process message"}`,
        agentId: "system"
      })
    }
  }

  const handleExecuteWorkflow = async () => {
    if (!activeWorkflow) return

    try {
      await executeWorkflow(activeWorkflow.id)
    } catch (error) {
      addMessage({
        role: "agent",
        content: `❌ Workflow execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        agentId: "system"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl">Custom AI Agents</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {insights && (
                <>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{insights.workflowStats.total} Workflows</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{insights.successfulCollaborations} Collaborations</span>
                  </Badge>
                </>
              )}
            </div>
          </div>
          <CardDescription className="font-mono">
            Your 8 specialized AI agents working together as a team
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Agent Selection */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Agent:</span>
            </div>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🤖 Auto-Select</SelectItem>
                <SelectItem value="roxy">💜 Roxy (Strategic)</SelectItem>
                <SelectItem value="blaze">🔥 Blaze (Growth)</SelectItem>
                <SelectItem value="echo">🎨 Echo (Marketing)</SelectItem>
                <SelectItem value="lumi">🛡️ Lumi (Compliance)</SelectItem>
                <SelectItem value="vex">⚡ Vex (Technical)</SelectItem>
                <SelectItem value="lexi">📊 Lexi (Analytics)</SelectItem>
                <SelectItem value="nova">✨ Nova (Design)</SelectItem>
                <SelectItem value="glitch">🔧 Glitch (Debug)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflow */}
      {activeWorkflow && (
        <Card className="mb-4 border-neon-orange bg-dark-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WorkflowIcon className="h-5 w-5 text-neon-orange" />
                <div>
                  <p className="font-medium text-neon-orange font-mono">{activeWorkflow.name}</p>
                  <p className="text-sm text-gray-300 font-mono">
                    {activeWorkflow.steps.length} steps • {activeWorkflow.status}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={isLoading}
                size="sm"
                className="bg-neon-orange hover:bg-neon-orange/80 font-mono font-bold uppercase tracking-wider"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Execute Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-0 h-full">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                      {message.role !== "user" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            AGENT_COLORS[message.agentId as keyof typeof AGENT_COLORS] || "bg-gray-500"
                          }`}>
                            {message.agentId ? AGENT_NAMES[message.agentId as keyof typeof AGENT_NAMES]?.[0] || "?" : "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {message.agentId ? AGENT_NAMES[message.agentId as keyof typeof AGENT_NAMES] || "System" : "System"}
                          </span>
                          {message.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(message.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className={`rounded-sm p-3 ${
                        message.role === "user" 
                          ? "bg-neon-purple text-white" 
                          : message.role === "collaboration"
                          ? "bg-dark-card border border-neon-cyan"
                          : "bg-dark-card border border-gray-700"
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm font-medium text-gray-300 mb-2 font-mono">Suggested Actions:</p>
                            <div className="space-y-1">
                              {message.suggestedActions.map((action, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-300 font-mono">
                                  <CheckCircle className="h-3 w-3 text-neon-lime" />
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Agents are collaborating...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI agents anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-neon-purple hover:bg-neon-purple/80 font-mono font-bold uppercase tracking-wider"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
