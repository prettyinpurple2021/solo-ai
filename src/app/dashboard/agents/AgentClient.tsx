"use client"

import { FeatureGate } from "@/components/subscription/FeatureGate"
import { logError } from '@/lib/logger'
import { useState } from "react"
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Badge } from "@/components/ui/badge"
import { AgentAvatar } from "@/components/agents/AgentAvatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, Send, Sparkles, Users, Save, Copy, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAnalytics, usePageTracking } from "@/hooks/use-analytics"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { AgentActionApproval } from "@/components/agents/AgentActionApproval"
import { createAgentAction } from "@/lib/actions/agent-actions"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentId?: string
}

interface Agent {
  id: string
  name: string
  display_name: string
  description: string
  personality: string
  capabilities: string[]
  accent_color: string
  avatar_url?: string
}

const AI_AGENTS: Agent[] = [
  {
    id: "roxy",
    name: "roxy",
    display_name: "Roxy",
    description: "Strategic Decision Architect & Executive Assistant",
    personality: "Efficiently rebellious, organized chaos master, proactively punk",
    capabilities: ["SPADE Framework", "Strategic Planning", "Schedule Management", "Risk Assessment"],
    accent_color: "#8B5CF6"
  },
  {
    id: "blaze",
    name: "blaze", 
    display_name: "Blaze",
    description: "Growth & Sales Strategist",
    personality: "Energetically rebellious, results-driven with punk rock passion",
    capabilities: ["Cost-Benefit Analysis", "Sales Funnels", "Market Strategy", "Growth Planning"],
    accent_color: "#F59E0B"
  },
  {
    id: "echo",
    name: "echo",
    display_name: "Echo", 
    description: "Marketing Maven & Content Creator",
    personality: "Creatively rebellious, high-converting with warm punk energy",
    capabilities: ["Content Creation", "Brand Strategy", "Social Media", "Campaign Planning"],
    accent_color: "#EC4899"
  },
  {
    id: "lumi",
    name: "lumi",
    display_name: "Lumi",
    description: "Guardian AI & Compliance Co-Pilot",
    personality: "Proactive compliance expert with ethical decision-making",
    capabilities: ["GDPR/CCPA Compliance", "Policy Generation", "Legal Guidance", "Risk Management"],
    accent_color: "#10B981"
  },
  {
    id: "vex",
    name: "vex",
    display_name: "Vex",
    description: "Technical Architect & Systems Optimizer",
    personality: "Systems rebel, automation architect, technical problem solver",
    capabilities: ["System Design", "Automation", "Technical Strategy", "Process Optimization"],
    accent_color: "#3B82F6"
  },
  {
    id: "lexi",
    name: "lexi",
    display_name: "Lexi",
    description: "Strategy Analyst & Data Architect",
    personality: "Data-driven insights insurgent, analytical powerhouse",
    capabilities: ["Data Analysis", "Market Research", "Performance Metrics", "Strategic Insights"],
    accent_color: "#6366F1"
  },
  {
    id: "nova",
    name: "nova",
    display_name: "Nova",
    description: "Productivity & Time Management Coach",
    personality: "Productivity revolutionary, time optimization expert",
    capabilities: ["Time Management", "Workflow Optimization", "Productivity Systems", "Focus Techniques"],
    accent_color: "#06B6D4"
  },
  {
    id: "glitch",
    name: "glitch",
    display_name: "Glitch",
    description: "Problem-Solving Architect",
    personality: "Root cause investigator, creative problem solver",
    capabilities: ["Five Whys Analysis", "Problem Solving", "Innovation", "Creative Solutions"],
    accent_color: "#EF4444"
  },
  {
    id: "aura",
    name: "aura",
    display_name: "Aura",
    description: "Brand Presence & Creative Synthesis",
    personality: "Visionary, rhythmic, emotionally intelligent storyteller for your founder voice",
    capabilities: ["Brand Narrative", "Campaign Hooks", "Voice & Tone", "Creative Direction"],
    accent_color: "#E879F9"
  },
  {
    id: "finn",
    name: "finn",
    display_name: "Finn",
    description: "Sales Closer & Pipeline Architect",
    personality: "Direct, high-trust closer — discovery, objections, and deal momentum",
    capabilities: ["Outbound Sequences", "Discovery & Demo", "Objection Handling", "Deal Strategy"],
    accent_color: "#FBBF24"
  }
]

interface AgentClientProps {
  initialConversations: any[];
  userId: string;
}

export default function AgentClient({ initialConversations, userId }: AgentClientProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [selectedMessageToSave, setSelectedMessageToSave] = useState<Message | null>(null)
  const [saveForm, setSaveForm] = useState({
    fileName: "",
    description: "",
    category: "document",
    tags: "",
    format: "txt"
  })
  const [isSaving, setIsSaving] = useState(false)
  const [pendingAction, setPendingAction] = useState<any | null>(null)
  
  const { toast } = useToast()
  const { track } = useAnalytics()

  // Track page views
  usePageTracking()

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      agentId: selectedAgent.id
    }

    // Track AI agent interaction
    track('ai_agent_interaction', {
      agentName: selectedAgent.name,
      agentId: selectedAgent.id,
      messageLength: input.length,
      timestamp: new Date().toISOString()
    })

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: input,
          agentId: selectedAgent.id
        }),
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          let assistantMessage = ""
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            assistantMessage += chunk
            
            // Update the last message in real-time
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content = assistantMessage
              } else {
                newMessages.push({
                  id: Date.now().toString(),
                  role: "assistant",
                  content: assistantMessage,
                  timestamp: new Date(),
                  agentId: selectedAgent.id
                })
              }
              return newMessages
            })
          }

          // Check for tool calls in the final message
          checkForToolCall(assistantMessage)
        }
      }
    } catch (error) {
      logError('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        agentId: selectedAgent.id
      }])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Simple parser for [TOOL_CALL: name, params] pattern
   */
  const checkForToolCall = async (content: string) => {
    const toolCallRegex = /\[TOOL_CALL:\s*(\w+),\s*({.*})\]/;
    const match = content.match(toolCallRegex);
    
    if (match) {
      const toolName = match[1];
      try {
        const params = JSON.parse(match[2]);
        
        // Create the real action in the database
        const result = await createAgentAction({
          agentId: selectedAgent?.id || 'unknown',
          actionType: toolName,
          payload: params
        });

        if (result.success) {
          setPendingAction(result.action);
        } else {
          toast({
            title: "Tool Call Failed",
            description: result.error || "Failed to initialize agent action.",
            variant: "destructive"
          });
        }
      } catch (e) {
        logError('Failed to parse tool call params:', e);
      }
    }
  }

  const startNewConversation = (agent: Agent) => {
    setSelectedAgent(agent)
    setMessages([])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Save message to briefcase
  const handleSaveMessage = (message: Message) => {
    setSelectedMessageToSave(message)
    
    // Generate smart defaults
    const agentName = selectedAgent?.display_name || 'AI'
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const defaultFileName = `${agentName}_Response_${timestamp}`
    
    // Smart categorization based on content
    let smartCategory = 'document'
    const content = message.content.toLowerCase()
    if (content.includes('strategy') || content.includes('plan')) smartCategory = 'document'
    if (content.includes('email') || content.includes('message')) smartCategory = 'document'
    if (content.includes('code') || content.includes('function')) smartCategory = 'document'
    if (content.includes('image') || content.includes('design')) smartCategory = 'image'
    
    // Generate smart tags
    const smartTags = [
      selectedAgent?.display_name.toLowerCase() || 'ai',
      message.role === 'assistant' ? 'ai-generated' : 'user-input',
      'chat-export'
    ]
    
    setSaveForm({
      fileName: defaultFileName,
      description: `Conversation with ${agentName} - ${message.content.substring(0, 100)}...`,
      category: smartCategory,
      tags: smartTags.join(', '),
      format: 'txt'
    })
    
    setShowSaveDialog(true)
  }

  // Save entire conversation
  const handleSaveConversation = () => {
    if (messages.length === 0) return
    
    const agentName = selectedAgent?.display_name || 'AI'
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const defaultFileName = `${agentName}_Conversation_${timestamp}`
    
    // Create conversation content
    const conversationContent = messages.map(msg => 
      `[${msg.role.toUpperCase()}] ${formatTime(msg.timestamp)}:\n${msg.content}\n`
    ).join('\n')
    
    const mockConversationMessage: Message = {
      id: 'conversation-export',
      role: 'assistant',
      content: conversationContent,
      timestamp: new Date(),
      agentId: selectedAgent?.id
    }
    
    setSelectedMessageToSave(mockConversationMessage)
    
    setSaveForm({
      fileName: defaultFileName,
      description: `Full conversation with ${agentName} (${messages.length} messages)`,
      category: 'document',
      tags: `${agentName.toLowerCase()}, conversation, full-export`,
      format: 'txt'
    })
    
    setShowSaveDialog(true)
  }

  // Execute save to briefcase
  const executeSave = async () => {
    if (!selectedMessageToSave) return
    
    setIsSaving(true)
    
    try {
      // Create file content based on format
      let fileContent = selectedMessageToSave.content
      let mimeType = 'text/plain'
      const fileExtension = saveForm.format
      
      if (saveForm.format === 'md') {
        fileContent = `# ${saveForm.fileName}

${selectedMessageToSave.content}`
        mimeType = 'text/markdown'
      } else if (saveForm.format === 'json') {
        fileContent = JSON.stringify({
          agent: selectedAgent?.display_name,
          timestamp: selectedMessageToSave.timestamp,
          content: selectedMessageToSave.content,
          metadata: {
            role: selectedMessageToSave.role,
            agentId: selectedMessageToSave.agentId
          }
        }, null, 2)
        mimeType = 'application/json'
      }
      
      // Create file blob
      const blob = new Blob([fileContent], { type: mimeType })
      const file = new File([blob], `${saveForm.fileName}.${fileExtension}`, { type: mimeType })
      
      // Upload to briefcase
      const formData = new FormData()
      formData.append('files', file)
      formData.append('category', saveForm.category)
      formData.append('description', saveForm.description)
      formData.append('tags', saveForm.tags)
      
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/briefcases/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData
      })
      
      if (response.ok) {
        toast({
          title: "Saved Successfully!",
          description: `"${saveForm.fileName}" has been saved to your Briefcase.`
        })
        setShowSaveDialog(false)
        setSaveForm({
          fileName: "",
          description: "",
          category: "document",
          tags: "",
          format: "txt"
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      logError('Save error:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save to Briefcase. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Copy message to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard."
    })
  }

  return (
    <FeatureGate feature="unlimited-agents">
      <div className="min-h-screen bg-dark-bg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">AI SQUAD</h1>
            <p className="text-gray-400 font-mono">Chat with your specialized AI agents to optimize your operations</p>
          </div>
          <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/50">
            <Bot className="w-3 h-3 mr-1" />
            {AI_AGENTS.length} Agents Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <HudBorder className="h-full bg-dark-card border-neon-purple/30 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-neon-purple" />
                  YOUR AI SQUAD
                </h2>
                <p className="text-sm text-gray-400 font-mono">
                  Choose your AI agent to chat with
                </p>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {AI_AGENTS.map((agent) => {
                    const card = (
                      <div
                        key={agent.id}
                        onClick={() => startNewConversation(agent)}
                        className={`p-4 border rounded-none cursor-pointer transition-all hover:bg-neon-purple/5 hover:border-neon-purple/50 ${
                          selectedAgent?.id === agent.id 
                            ? 'border-neon-purple/50 bg-neon-purple/10' 
                            : 'border-white/10 hover:border-neon-purple/30 bg-dark-bg/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <AgentAvatar 
                            displayName={agent.display_name}
                            accentColor={agent.accent_color}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white font-orbitron">{agent.display_name}</h3>
                            <p className="text-xs text-gray-400 truncate font-mono">{agent.description}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 2).map((capability, index) => (
                            <Badge key={index} className="text-xs bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 font-mono rounded-none">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 2 && (
                            <Badge className="text-xs bg-white/5 text-gray-400 border-white/10 font-mono rounded-none">
                              +{agent.capabilities.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )

                    // Tier 1: Free Agents (Aura)
                    if (agent.id === 'aura') {
                      return card
                    }

                    // Tier 2: Accelerator Agents — matches subscription-utils ACCELERATOR
                    if (['blaze', 'glitch', 'vex', 'finn'].includes(agent.id)) {
                      return (
                        <FeatureGate key={agent.id} feature="pro-agents">
                          {card}
                        </FeatureGate>
                      )
                    }

                    // Tier 3: Dominator Agents (Roxy, Lexi, Nova, Echo, Lumi)
                    return (
                        <FeatureGate key={agent.id} feature="elite-agents">
                          {card}
                        </FeatureGate>
                    )
                  })}
                </div>
              </ScrollArea>
            </HudBorder>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <HudBorder className="h-full flex flex-col bg-dark-card border-neon-cyan/30">
              {selectedAgent ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-neon-cyan/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AgentAvatar 
                          displayName={selectedAgent.display_name}
                          accentColor={selectedAgent.accent_color}
                          size="md"
                        />
                        <div>
                          <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                            {selectedAgent.display_name}
                            <Sparkles className="w-4 h-4 text-neon-purple" />
                          </h2>
                          <p className="text-sm text-gray-400 font-mono">{selectedAgent.description}</p>
                        </div>
                      </div>
                      
                      {/* Conversation Actions */}
                      {messages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CyberButton
                            size="sm"
                            variant="cyan"
                            onClick={handleSaveConversation}
                            className="flex items-center gap-2 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                          >
                            <Briefcase className="w-4 h-4" />
                            Save Conversation
                          </CyberButton>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-0">
                    <ScrollArea className="h-[calc(100vh-400px)] p-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="flex justify-center mb-4">
                            <AgentAvatar 
                              displayName={selectedAgent.display_name}
                              accentColor={selectedAgent.accent_color}
                              size="xl"
                              className="w-16 h-16 text-2xl"
                            />
                          </div>
                          <h3 className="text-lg font-orbitron font-bold text-white mb-2">Chat with {selectedAgent.display_name}</h3>
                          <p className="text-gray-400 mb-4 font-mono">{selectedAgent.personality}</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {selectedAgent.capabilities.map((capability, index) => (
                              <Badge key={index} className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 font-mono rounded-none">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-none border ${
                                  message.role === 'user'
                                    ? 'bg-neon-purple/20 border-neon-purple/50 text-white'
                                    : 'bg-dark-bg/50 text-gray-300 hover:bg-dark-bg border-neon-cyan/20'
                                }`}
                              >
                                <p className="text-sm font-mono">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-neon-purple/70' : 'text-gray-500'
                                } font-mono`}>
                                  {formatTime(message.timestamp)}
                                </p>
                                
                                {/* Message Actions - Only show for assistant messages */}
                                {message.role === 'assistant' && (
                                  <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex flex-col gap-1 bg-dark-card rounded-none shadow-lg border border-neon-cyan/30 p-1">
                                      <CyberButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSaveMessage(message)}
                                        className="w-8 h-8 p-0 hover:bg-neon-purple/20 border-transparent text-neon-purple"
                                        title="Save to Briefcase"
                                      >
                                        <Briefcase className="w-3 h-3" />
                                      </CyberButton>
                                      <CyberButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(message.content)}
                                        className="w-8 h-8 p-0 hover:bg-neon-cyan/20 border-transparent text-neon-cyan"
                                        title="Copy to Clipboard"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </CyberButton>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="bg-dark-bg/50 p-3 rounded-none border border-neon-purple/30">
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
                                  <span className="text-sm text-gray-400 font-mono">Thinking...</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {pendingAction && (
                            <div className="flex justify-start max-w-[400px]">
                              <AgentActionApproval 
                                action={pendingAction} 
                                onComplete={() => setPendingAction(null)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-neon-cyan/30">
                    <div className="flex gap-2">
                      <label htmlFor="agent-message-input" className="sr-only">
                        Message {selectedAgent.display_name}
                      </label>
                      <Textarea
                        id="agent-message-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        aria-label={`Message ${selectedAgent.display_name}`}
                        className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-dark-bg border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan font-mono rounded-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <CyberButton 
                        onClick={sendMessage} 
                        disabled={!input.trim() || isLoading}
                        variant="cyan"
                        className="px-4 h-auto"
                      >
                        <Send className="w-4 h-4" />
                      </CyberButton>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-orbitron font-bold text-white mb-2">SELECT AN AI AGENT</h3>
                    <p className="text-gray-400 font-mono">Choose an agent from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </HudBorder>
          </div>
        </div>

        {/* Save to Briefcase Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md bg-dark-card border-neon-purple/30 rounded-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white font-orbitron">
                <Briefcase className="w-5 h-5 text-neon-purple" />
                Save to Briefcase
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-mono">
                Configure how you want to save this content to your Briefcase.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fileName" className="text-neon-cyan font-mono text-xs uppercase">File Name</Label>
                <Input
                  id="fileName"
                  value={saveForm.fileName}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, fileName: e.target.value }))}
                  className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-neon-cyan font-mono text-xs uppercase">Description (Optional)</Label>
                <Input
                  id="description"
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category" className="text-neon-cyan font-mono text-xs uppercase">Category</Label>
                  <Select value={saveForm.category} onValueChange={(value) => setSaveForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-dark-bg border-neon-cyan/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-neon-cyan/30">
                      <SelectItem value="document" className="text-white">Document</SelectItem>
                      <SelectItem value="template" className="text-white">Template</SelectItem>
                      <SelectItem value="note" className="text-white">Note</SelectItem>
                      <SelectItem value="reference" className="text-white">Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="format" className="text-neon-cyan font-mono text-xs uppercase">Format</Label>
                  <Select value={saveForm.format} onValueChange={(value) => setSaveForm(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger className="bg-dark-bg border-neon-cyan/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-neon-cyan/30">
                      <SelectItem value="txt" className="text-white">Text (.txt)</SelectItem>
                      <SelectItem value="md" className="text-white">Markdown (.md)</SelectItem>
                      <SelectItem value="json" className="text-white">JSON (.json)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-neon-cyan font-mono text-xs uppercase">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <CyberButton variant="cyan" onClick={() => setShowSaveDialog(false)} className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                Cancel
              </CyberButton>
              <CyberButton 
                onClick={executeSave} 
                disabled={!saveForm.fileName.trim() || isSaving}
                variant="purple"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Briefcase
                  </>
                )}
              </CyberButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  )
}
