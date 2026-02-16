"use client"

import { logError } from '@/lib/logger'
import React, { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Send, 
  User, 
  Mic, 
  Copy, 
  ChevronDown,
  MessageSquare,
  X,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceInput } from '@/hooks/use-voice-input'

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

interface MobileChatInterfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: Agent[]
  onSendMessage: (message: string, agentId: string) => Promise<void>
  messages: Message[]
  isLoading?: boolean
  className?: string
}

export default function MobileChatInterface({
  open,
  onOpenChange,
  agents,
  onSendMessage,
  messages,
  isLoading = false,
  className = ""
}: MobileChatInterfaceProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [input, setInput] = useState('')
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Select first agent by default
  useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent(agents[0])
    }
  }, [selectedAgent, agents])

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || isLoading) return

    try {
      await onSendMessage(input.trim(), selectedAgent.id)
      setInput('')
      
      // Auto-resize textarea back to single line
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px'
      }
    } catch (error) {
      logError('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceInput()

  useEffect(() => {
    if (transcript) {
      setInput(prev => {
        // Avoid duplicating if the transcript is appending
        if (prev.endsWith(transcript)) return prev
        return prev + (prev ? " " : "") + transcript
      })
      resetTranscript()
      
      // Auto-resize
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px'
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
      }
    }
  }, [transcript, resetTranscript])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = '44px'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      logError('Failed to copy message:', error)
    }
  }

  const getAgentMessages = () => {
    return messages.filter(m => !selectedAgent || m.agentId === selectedAgent.id)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full sm:w-[400px] p-0 flex flex-col",
          isMobile && "w-full max-w-none",
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="flex-shrink-0 p-4 border-b border-gray-800 bg-dark-bg/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedAgent && (
                <Avatar 
                  className="w-8 h-8"
                  style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`}}
                >
                  <AvatarFallback 
                    style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`, color: 'white' }}
                    className="text-xs font-bold"
                  >
                    {selectedAgent.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <SheetTitle className="text-lg font-orbitron uppercase tracking-wider text-white">
                  {selectedAgent ? selectedAgent.display_name : 'AI Agents'}
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-300 font-mono">
                  {selectedAgent ? selectedAgent.description : 'Choose an AI agent to chat with'}
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showAgentSelector && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Agent Selector */}
          <AnimatePresence>
            {showAgentSelector && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <ScrollArea className="max-h-40">
                  <div className="space-y-1">
                    {agents.map((agent) => (
                      <Button
                        key={agent.id}
                        variant={selectedAgent?.id === agent.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-auto p-2 text-left font-mono"
                        onClick={() => {
                          setSelectedAgent(agent)
                          setShowAgentSelector(false)
                        }}
                      >
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback 
                            style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`, color: 'white' }}
                            className="text-xs"
                          >
                            {agent.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs">{agent.display_name}</div>
                          <div className="text-xs text-gray-300 truncate">{agent.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetHeader>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            {getAgentMessages().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-neon-purple" />
                </div>
                <h3 className="font-medium font-orbitron uppercase tracking-wider text-white mb-2">Start a conversation</h3>
                <p className="text-sm text-gray-300 font-mono mb-4">
                  {selectedAgent ? `Ask ${selectedAgent.display_name} anything!` : 'Select an agent to begin chatting'}
                </p>
                {selectedAgent && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {selectedAgent.capabilities.slice(0, 3).map((capability, index) => (
                      <Badge key={index} variant="cyan" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getAgentMessages().map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && selectedAgent && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback 
                          style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`, color: 'white' }}
                          className="text-xs"
                        >
                          {selectedAgent.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "flex flex-col max-w-[80%]",
                      message.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <Card className={cn(
                        "relative",
                        message.role === 'user' 
                          ? "bg-neon-purple text-white" 
                          : "bg-dark-card border border-gray-700"
                      )}>
                        <CardContent className="p-3">
                          <p className={cn(
                            "text-sm whitespace-pre-wrap break-words font-mono",
                            message.role === "user" ? "text-white" : "text-gray-300"
                          )}>
                            {message.content}
                          </p>
                        </CardContent>
                        
                        {/* Copy button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            message.role === 'user' ? "text-white hover:bg-white/20" : "text-gray-300 hover:bg-dark-hover"
                          )}
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </Card>
                      
                      <span className="text-xs text-gray-500 mt-1 px-1 font-mono">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    {selectedAgent && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback 
                          style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`, color: 'white' }}
                          className="text-xs"
                        >
                          {selectedAgent.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card className="bg-dark-card border border-gray-700">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-sm animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-sm animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-sm animate-bounce"></div>
                          </div>
                          <span className="text-xs text-gray-300 font-mono">Typing...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-dark-bg/90 backdrop-blur-sm">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={selectedAgent ? `Message ${selectedAgent.display_name}...` : "Select an agent first..."}
                  disabled={!selectedAgent || isLoading}
                  className="min-h-[44px] max-h-[120px] resize-none pr-10 text-sm"
                  rows={1}
                />
              </div>
              
                <Button 
                  onClick={isListening ? stopListening : startListening}
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "h-11 w-11 p-0 transition-colors",
                    isListening ? "text-red-500 hover:text-red-600 bg-red-500/10" : "text-gray-400 hover:text-white"
                  )}
                >
                  {isListening ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || !selectedAgent || isLoading}
                  size="sm"
                  className="h-11 w-11 p-0 bg-neon-purple hover:bg-neon-purple/80"
                >
                  <Send className="w-4 h-4" />
                </Button>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1">
                {selectedAgent && selectedAgent.capabilities.slice(0, 2).map((capability, index) => (
                  <Badge key={index} variant="cyan" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {capability}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <span>Enter to send</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
