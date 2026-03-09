"use client"

import { logError, logWarn, logInfo, logDebug,} from '@/lib/logger'
import React, { createContext, useContext, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const FloatingChatButton = dynamic(() => import('@/components/chat/floating-chat-button'), {
  ssr: false
})
import { useToast } from '@/hooks/use-toast'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useAuth } from '@/hooks/use-auth'


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

interface ChatContextValue {
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// Lazy context creation to prevent build errors
let ChatContext: React.Context<ChatContextValue | undefined> | undefined

function getChatContext() {
  if (!ChatContext) {
    ChatContext = createContext<ChatContextValue | undefined>(undefined)
  }
  return ChatContext
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
  }
]

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [chatbaseIdentified, setChatbaseIdentified] = useState(false)
  
  // Use database preferences for chat messages with localStorage fallback
  const { preferences, setPreference, loading: preferencesLoading } = useUserPreferences({
    defaultValues: {
      chatMessages: []
    },
    fallbackToLocalStorage: true
  })

  // Load cached messages on mount from preferences
  useEffect(() => {
    if (!preferencesLoading && preferences.chatMessages) {
      try {
        const cachedMessages = preferences.chatMessages
        if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
          setMessages(cachedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
        }
      } catch (error) {
        logError('Error loading cached messages:', error)
      }
    }
  }, [preferences.chatMessages, preferencesLoading])

  useEffect(() => {
    if (!user) {
      if (chatbaseIdentified) {
        setChatbaseIdentified(false)
      }
      return
    }
    if (chatbaseIdentified) {
      return
    }

    let active = true

    const identifyWithChatbase = async () => {
      try {
        const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null
        if (!authToken) {
          logDebug('Chatbase identify skipped: no auth token present')
          return
        }

        const response = await fetch('/api/chatbase/identity', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          logWarn('Chatbase identity request failed', { status: response.status })
          return
        }

        const data = await response.json() as { token?: string }
        if (!data.token) {
          logWarn('Chatbase identity token missing from response')
          return
        }

        if (!active) {
          return
        }

        const chatbase = (window as typeof window & { chatbase?: (...args: any[]) => void }).chatbase
        if (typeof chatbase === 'function') {
          chatbase('identify', { token: data.token })
          setChatbaseIdentified(true)
          logInfo('Chatbase user identified successfully', { userId: user.id })
        } else {
          logWarn('Chatbase identify skipped: widget not initialized')
        }
      } catch (error) {
        if (active) {
          logError('Failed to identify user with Chatbase', error)
        }
      }
    }

    void identifyWithChatbase()

    return () => {
      active = false
    }
  }, [user, chatbaseIdentified])

  // Cache messages when they change using preferences API
  useEffect(() => {
    if (messages.length > 0 && !preferencesLoading) {
      setPreference('chatMessages', messages).catch(error => {
        logError('Failed to save chat messages to preferences:', error)
        // Fallback to localStorage on error
        try {
          localStorage.setItem('solosuccess_chat_messages', JSON.stringify(messages))
        } catch (localError) {
          logError('Failed to save to localStorage as fallback:', localError)
        }
      })
    }
  }, [messages, setPreference, preferencesLoading])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
    // Clear from preferences API and fallback to localStorage cleanup
    setPreference('chatMessages', []).catch(error => {
      logError('Failed to clear chat messages from preferences:', error)
      // Fallback to localStorage cleanup
      try {
        localStorage.removeItem('solosuccess_chat_messages')
      } catch (localError) {
        logError('Failed to clear localStorage as fallback:', localError)
      }
    })
  }

  const handleSendMessage = async (messageContent: string, agentId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      agentId: agentId
    }

    addMessage(userMessage)
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
          message: messageContent,
          agentId: agentId
        }),
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          let assistantContent = ""
          
          // Create assistant message
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant", 
            content: "",
            timestamp: new Date(),
            agentId: agentId
          }
          
          addMessage(assistantMessage)
          
          // Stream response
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            assistantContent += chunk
            
            // Update the assistant message in real-time
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantContent }
                : msg
            ))
          }
        }
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      logError('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
        agentId: agentId
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: ChatContextValue = {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  }

  const Context = getChatContext()
  return (
    <Context.Provider value={contextValue}>
      {children}
      <FloatingChatButton
        agents={AI_AGENTS}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </Context.Provider>
  )
}

export const useChat = () => {
  const Context = getChatContext()
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
