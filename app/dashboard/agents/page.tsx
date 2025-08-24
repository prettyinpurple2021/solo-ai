"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Send, 
  Sparkles,
  Users,
  Save,
  FileText,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Briefcase
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

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
    description: "Strategy Analyst & Data Queen",
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
  }
]

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [_conversations, setConversations] = useState<any[]>([])
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
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      agentId: selectedAgent.id
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
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
      let fileExtension = saveForm.format
      
      if (saveForm.format === 'md') {
        fileContent = `# ${saveForm.fileName}\n\n${selectedMessageToSave.content}`
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
      
      const response = await fetch('/api/briefcase/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast({
          title: "Saved Successfully!",
          description: `"${saveForm.fileName}" has been saved to your Briefcase.`,
          action: {
            label: "View Briefcase",
            onClick: () => window.location.href = '/dashboard/briefcase'
          }
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
      console.error('Save error:', error)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Squad</h1>
          <p className="text-gray-600">Chat with your specialized AI agents to dominate your empire</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          <Bot className="w-3 h-3 mr-1" />
          {AI_AGENTS.length} Agents Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Agent Selection */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your AI Squad
              </CardTitle>
              <CardDescription>
                Choose your AI agent to chat with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {AI_AGENTS.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => startNewConversation(agent)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedAgent?.id === agent.id 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: agent.accent_color }}
                        >
                          {agent.display_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{agent.display_name}</h3>
                          <p className="text-xs text-gray-600 truncate">{agent.description}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 2).map((capability, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            {selectedAgent ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: selectedAgent.accent_color }}
                      >
                        {selectedAgent.display_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedAgent.display_name}
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        </CardTitle>
                        <CardDescription>{selectedAgent.description}</CardDescription>
                      </div>
                    </div>
                    
                    {/* Conversation Actions */}
                    {messages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveConversation}
                          className="flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          Save Conversation
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-400px)] p-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                          style={{ backgroundColor: selectedAgent.accent_color }}
                        >
                          {selectedAgent.display_name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Chat with {selectedAgent.display_name}</h3>
                        <p className="text-gray-600 mb-4">{selectedAgent.personality}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedAgent.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline">
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
                              className={`max-w-[80%] p-3 rounded-lg relative ${
                                message.role === 'user'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                              
                              {/* Message Actions - Only show for assistant messages */}
                              {message.role === 'assistant' && (
                                <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg border p-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSaveMessage(message)}
                                      className="w-8 h-8 p-0 hover:bg-purple-100"
                                      title="Save to Briefcase"
                                    >
                                      <Briefcase className="w-3 h-3 text-purple-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(message.content)}
                                      className="w-8 h-8 p-0 hover:bg-gray-100"
                                      title="Copy to Clipboard"
                                    >
                                      <Copy className="w-3 h-3 text-gray-600" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                <span className="text-sm text-gray-600">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Message ${selectedAgent.display_name}...`}
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!input.trim() || isLoading}
                      className="px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an AI Agent</h3>
                  <p className="text-gray-600">Choose an agent from the sidebar to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Save to Briefcase Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Save to Briefcase
            </DialogTitle>
            <DialogDescription>
              Configure how you want to save this content to your Briefcase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={saveForm.fileName}
                onChange={(e) => setSaveForm(prev => ({ ...prev, fileName: e.target.value }))}
                placeholder="Enter filename..."
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the content..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={saveForm.category} onValueChange={(value) => setSaveForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={saveForm.format} onValueChange={(value) => setSaveForm(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">Text (.txt)</SelectItem>
                    <SelectItem value="md">Markdown (.md)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={saveForm.tags}
                onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="comma, separated, tags"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeSave} 
              disabled={!saveForm.fileName.trim() || isSaving}
              className="bg-purple-600 hover:bg-purple-700"
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
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
