// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Reply, 
  Forward,
  Copy,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  FileText,
  Image as ImageIcon,
  Code,
  Link,
  Download,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


// Types
interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderType: 'user' | 'agent'
  timestamp: string
  type: 'text' | 'file' | 'image' | 'code' | 'system'
  status: 'sending' | 'sent' | 'delivered' | 'error'
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    codeLanguage?: string
    replyTo?: string
    priority?: 'low' | 'medium' | 'high'
  }
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url: string
  }[]
}

interface SessionParticipant {
  id: string
  name: string
  type: 'user' | 'agent'
  status: 'online' | 'offline' | 'typing'
  avatar?: string
}

// Message Component
const MessageBubble: React.FC<{ 
  message: Message
  isOwn: boolean
  showSender?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message, newContent: string) => void
  onDelete?: (message: Message) => void
}> = ({ message, isOwn, showSender = true, onReply, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false)

  const getMessageIcon = () => {
    switch (message.type) {
      case 'file':
        return <FileText className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'code':
        return <Code className="w-4 h-4" />
      case 'system':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-gray-500" />
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-neon-lime" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-neon-magenta" />
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleSaveEdit = () => {
    if (editContent !== message.content) {
      onEdit?.(message, editContent)
    }
    setIsEditing(false)
  }

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showSender && !isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={`/avatars/${message.senderId}.png`} />
          <AvatarFallback>
            {message.senderType === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender Name & Time */}
        {showSender && (
          <div className={cn(
            "flex items-center gap-2 mb-1 text-xs text-muted-foreground",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="font-medium">{message.senderName}</span>
            <span>{formatTime(message.timestamp)}</span>
            {message.metadata?.priority === 'high' && (
              <Badge variant="destructive" className="text-xs h-4">
                Priority
              </Badge>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-sm px-3 py-2 max-w-full",
            message.type === 'system' 
              ? "bg-muted text-muted-foreground text-center italic"
              : isOwn 
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            message.status === 'error' && "border border-neon-magenta"
          )}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)}
                className="text-black min-h-[60px]"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Message Type Icon */}
              {getMessageIcon() && (
                <div className="flex items-center gap-2 mb-1">
                  {getMessageIcon()}
                  <span className="text-xs font-medium">
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </div>

              {/* Code Block Styling */}
              {message.type === 'code' && (
                <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
                  {message.metadata?.codeLanguage && (
                    <div className="text-xs text-muted-foreground mb-1">
                      {message.metadata.codeLanguage}
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap">{message.content}</pre>
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs flex-1 truncate">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)}KB
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          {showActions && !isEditing && message.type !== 'system' && (
            <div className={cn(
              "absolute top-0 flex gap-1 bg-background border rounded shadow-sm p-1",
              isOwn ? "-left-20" : "-right-20"
            )}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-foreground" onClick={() => onReply?.(message)}>
                      <Reply className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Reply</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-foreground" onClick={() => navigator.clipboard.writeText(message.content)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copy</p></TooltipContent>
                </Tooltip>

                {isOwn && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-foreground" onClick={() => setIsEditing(true)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Edit</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-neon-magenta" onClick={() => onDelete?.(message)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Delete</p></TooltipContent>
                    </Tooltip>
                  </>
                )}
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Status */}
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          {getStatusIcon()}
          {message.status === 'error' && (
            <span className="text-xs text-neon-magenta font-mono">Failed to send</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Typing Indicator Component
const TypingIndicator: React.FC<{ participants: SessionParticipant[] }> = ({ participants }) => {
  const typingParticipants = participants.filter(p => p.status === 'typing')
  
  if (typingParticipants.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>
        {typingParticipants.map(p => p.name).join(', ')} 
        {typingParticipants.length === 1 ? ' is' : ' are'} typing...
      </span>
    </div>
  )
}

// Main Message Interface Component
const MessageInterface: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [messageType, setMessageType] = useState<'text' | 'code'>('text')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.data?.messages || [])
        }
      } catch (error) {
        logError('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchMessages()
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    const tempId = `temp-${Date.now()}`
    
    // Add optimistic update
    const tempMessage: Message = {
      id: tempId,
      content: newMessage,
      senderId: 'current-user',
      senderName: 'You',
      senderType: 'user',
      timestamp: new Date().toISOString(),
      type: messageType,
      status: 'sending',
      metadata: replyingTo ? { replyTo: replyingTo.id } : undefined
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    setReplyingTo(null)

    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          type: messageType,
          priority: 'medium',
          metadata: {
            replyTo: replyingTo?.id,
            codeLanguage: messageType === 'code' ? 'javascript' : undefined
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Replace temp message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...data.data.message, status: 'sent' }
              : msg
          )
        )
      } else {
        // Mark message as failed
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, status: 'error' }
              : msg
          )
        )
        toast.error('Failed to send message')
      }
    } catch (error) {
      logError('Error sending message:', error)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'error' }
            : msg
        )
      )
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle reply
  const handleReply = (message: Message) => {
    setReplyingTo(message)
    textareaRef.current?.focus()
  }

  // Handle edit
  const handleEdit = async (message: Message, newContent: string) => {
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, content: newContent } : msg
        ))
        toast.success('Message updated')
        setEditingMessage(null)
      } else {
        toast.error('Failed to update message')
      }
    } catch (error) {
      logError('Error updating message:', error)
      toast.error('Failed to update message')
    }
  }

  // Handle delete (placeholder)
  // Handle delete
  const handleDelete = async (message: Message) => {
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages/${message.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== message.id))
        toast.success('Message deleted')
      } else {
        toast.error('Failed to delete message')
      }
    } catch (error) {
      logError('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Session Messages</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {messages.length} messages
          </Badge>
          <Badge variant="outline">
            {participants.filter(p => p.status === 'online').length} online
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const previousMessage = messages[index - 1]
            const showSender = !previousMessage || 
              previousMessage.senderId !== message.senderId ||
              new Date(message.timestamp).getTime() - new Date(previousMessage.timestamp).getTime() > 300000 // 5 minutes

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderType === 'user' && message.senderId === 'current-user'}
                showSender={showSender}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          })}

          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <TypingIndicator participants={participants} />
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Reply className="w-4 h-4" />
              <span className="font-medium">Replying to {replyingTo.senderName}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {replyingTo.content}
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="sm"
            variant={messageType === 'text' ? 'default' : 'outline'}
            onClick={() => setMessageType('text')}
          >
            Text
          </Button>
          <Button
            size="sm"
            variant={messageType === 'code' ? 'default' : 'outline'}
            onClick={() => setMessageType('code')}
          >
            <Code className="w-4 h-4 mr-1" />
            Code
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={messageType === 'code' ? 'Enter code...' : 'Type a message...'}
              className={cn(
                "min-h-[60px] resize-none",
                messageType === 'code' && "font-mono text-sm"
              )}
              disabled={sending}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" disabled>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Attach File</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MessageInterface