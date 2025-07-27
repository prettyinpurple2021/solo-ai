"use client"

import { useState } from "react"
import { useChat } from "ai/react"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: string
}

interface UseAiChatProps {
  memberId: string
  initialHistory?: ChatMessage[]
}

export function useAiChat({ memberId, initialHistory = [] }: UseAiChatProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialHistory)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      memberId: memberId.toLowerCase(),
      chatHistory,
    },
    onFinish: (message) => {
      // Add AI response to chat history
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message.content,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      }
      setChatHistory((prev) => [...prev, aiMessage])
    },
  })

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    setChatHistory((prev) => [...prev, userMessage])

    // Send message through useChat
    const syntheticEvent = {
      preventDefault: () => {},
      target: { value: messageText },
    } as any

    handleInputChange({ target: { value: messageText } } as any)
    handleSubmit(syntheticEvent)
  }

  const clearHistory = () => {
    setChatHistory([])
  }

  return {
    chatHistory,
    sendMessage,
    clearHistory,
    isLoading,
    error,
    currentInput: input,
    handleInputChange,
  }
}

// Export with the exact name expected
export { useAiChat as useAIChat }
