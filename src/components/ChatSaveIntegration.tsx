'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useEffect, useState } from 'react'
import { Save, Crown, Heart, Sparkles } from 'lucide-react'
import { briefcaseAutoSaver } from '@/utils/briefcase-auto-save'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'


interface ChatMessage {
  role: string
  content: string
  timestamp?: string
}

interface ChatSaveIntegrationProps {
  messages: ChatMessage[]
  conversationId: string
  agentName?: string
  title?: string
  className?: string
  autoSave?: boolean
}

export const ChatSaveIntegration: React.FC<ChatSaveIntegrationProps> = ({
  messages,
  conversationId,
  agentName = 'AI Assistant',
  title,
  className = '',
  autoSave = true
}) => {
  const [lastSavedLength, setLastSavedLength] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || messages.length < 3) return
    
    // Only save if we have new messages
    if (messages.length > lastSavedLength) {
      const chatTitle = title || `Chat with ${agentName} - ${new Date().toLocaleDateString()}`
      
      // Auto-save with debouncing handled by briefcaseAutoSaver
      briefcaseAutoSaver.saveChatConversation(
        conversationId,
        chatTitle,
        messages,
        agentName
      )
      
      setLastSavedLength(messages.length)
    }
  }, [messages, conversationId, agentName, title, autoSave, lastSavedLength])

  // Manual save function
  const handleManualSave = async () => {
    if (messages.length === 0) {
      toast({
        title: "No transmission data to log.",
        description: "Start chatting to save your conversation.",
        variant: "default"
      })
      return
    }

    setIsSaving(true)
    try {
      const chatTitle = title || `Chat with ${agentName} - ${new Date().toLocaleDateString()}`
      
      const response = await fetch('/api/unified-briefcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'chat',
          title: chatTitle,
          content: { messages },
          metadata: { 
            agentName,
            messageCount: messages.length,
            conversationId
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save chat')
      }

      toast({
        title: "Chat saved to briefcase! ✨",
        description: `Your conversation with ${agentName} has been saved successfully.`
      })
      
      setLastSavedLength(messages.length)
    } catch (error) {
      logError('Save error:', error)
      toast({
        title: "Save failed 💔",
        description: "Failed to save your chat. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (messages.length === 0) return null

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Auto-save indicator */}
      {autoSave && messages.length >= 3 && (
        <div className="flex items-center gap-2 text-xs text-purple-600/70 font-medium">
          <Sparkles size={12} className="text-teal-500 animate-pulse" />
          <span>Auto-saving to briefcase...</span>
        </div>
      )}

      {/* Manual save button */}
      <Button
        onClick={handleManualSave}
        disabled={isSaving}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-pink-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-pink-700 transition-all duration-300 rounded-full"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save size={14} />
            <span>Save Chat</span>
            <Crown size={12} className="opacity-70" />
          </>
        )}
      </Button>

      {/* Message count indicator */}
      <div className="flex items-center gap-1 text-xs text-purple-600/70 font-medium">
        <Heart size={12} className="text-pink-500" />
        <span>{messages.length} messages</span>
      </div>
    </div>
  )
}

export default ChatSaveIntegration
