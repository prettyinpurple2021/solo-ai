"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const MobileChatInterface = dynamic(() => import('./mobile-chat-interface'), {
  loading: () => <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>,
  ssr: false
})

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

interface FloatingChatButtonProps {
  agents: Agent[]
  messages: Message[]
  onSendMessage: (message: string, agentId: string) => Promise<void>
  isLoading?: boolean
  className?: string
}

export default function FloatingChatButton({
  agents,
  messages,
  onSendMessage,
  isLoading = false,
  className = ""
}: FloatingChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // Show on tablet and mobile
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track new messages for notification badge
  useEffect(() => {
    if (messages.length > lastMessageCount && !isChatOpen) {
      setHasNewMessages(true)
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, isChatOpen])

  // Clear new message notification when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setHasNewMessages(false)
    }
  }, [isChatOpen])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "fixed bottom-4 right-4 z-50",
              className
            )}
          >
            <div className="relative">
              <Button
                onClick={() => setIsChatOpen(true)}
                size="lg"
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg",
                  "bg-gradient-to-r from-purple-600 to-blue-600",
                  "hover:from-purple-700 hover:to-blue-700",
                  "transform hover:scale-105 transition-all duration-200",
                  "border-2 border-white"
                )}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </Button>

              {/* New message notification badge */}
              {hasNewMessages && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="h-5 w-5 p-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                </motion.div>
              )}

              {/* Pulse animation for attention */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Chat Interface */}
      <MobileChatInterface
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        agents={agents}
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </>
  )
}
