"use client"

import { useState, useCallback } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface UseAiChatOptions {
  agentId?: string
  initialMessages?: Message[]
}

export interface UseAiChatReturn {
  messages: Message[]
  input: string
  isLoading: boolean
  error: string | null
  setInput: (input: string) => void
  sendMessage: (message?: string) => Promise<void>
  clearMessages: () => void
  regenerateLastMessage: () => Promise<void>
}

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { agentId, initialMessages = [] } = options

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (messageContent?: string) => {
      const content = messageContent || input.trim()
      if (!content || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            agentId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content || "Sorry, I encountered an error processing your request.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Chat error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [input, messages, isLoading, agentId],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const regenerateLastMessage = useCallback(async () => {
    if (messages.length < 2) return

    const lastUserMessage = messages[messages.length - 2]
    if (lastUserMessage.role !== "user") return

    // Remove the last assistant message
    setMessages((prev) => prev.slice(0, -1))

    // Resend the last user message
    await sendMessage(lastUserMessage.content)
  }, [messages, sendMessage])

  return {
    messages,
    input,
    isLoading,
    error,
    setInput,
    sendMessage,
    clearMessages,
    regenerateLastMessage,
  }
}

// Export types for external use
export type { Message, UseAiChatOptions, UseAiChatReturn }
