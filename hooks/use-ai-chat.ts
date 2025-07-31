"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentId?: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  input: string
}

export interface UseAiChatOptions {
  agentId?: string
  initialMessages?: Message[]
  onError?: (error: Error) => void
  onFinish?: (message: Message) => void
}

export interface UseAiChatReturn {
  messages: Message[]
  input: string
  isLoading: boolean
  error: string | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  append: (message: Omit<Message, "id" | "timestamp">) => Promise<void>
  reload: () => Promise<void>
  stop: () => void
  setInput: (input: string) => void
  setMessages: (messages: Message[]) => void
}

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { agentId, initialMessages = [], onError, onFinish } = options

  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
    input: "",
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, input: e.target.value }))
  }, [])

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }))
  }, [])

  const setMessages = useCallback((messages: Message[]) => {
    setState((prev) => ({ ...prev, messages }))
  }, [])

  const append = useCallback(
    async (message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: new Date(),
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        isLoading: true,
        error: null,
      }))

      try {
        // Cancel any existing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...state.messages, newMessage],
            agentId: agentId || "general",
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("No response body")
        }

        const decoder = new TextDecoder()
        let assistantMessage = ""

        const assistantMessageObj: Message = {
          id: generateId(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
          agentId,
        }

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessageObj],
        }))

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantMessage += parsed.content
                  setState((prev) => ({
                    ...prev,
                    messages: prev.messages.map((msg) =>
                      msg.id === assistantMessageObj.id ? { ...msg, content: assistantMessage } : msg,
                    ),
                  }))
                }
              } catch (e) {
                // Ignore parsing errors for streaming data
              }
            }
          }
        }

        const finalMessage: Message = {
          ...assistantMessageObj,
          content: assistantMessage,
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: prev.messages.map((msg) => (msg.id === assistantMessageObj.id ? finalMessage : msg)),
        }))

        onFinish?.(finalMessage)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return // Request was cancelled
        }

        const errorMessage = error instanceof Error ? error.message : "An error occurred"
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))

        onError?.(error instanceof Error ? error : new Error(errorMessage))
      }
    },
    [state.messages, agentId, generateId, onError, onFinish],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!state.input.trim() || state.isLoading) {
        return
      }

      const userMessage = state.input.trim()
      setState((prev) => ({ ...prev, input: "" }))

      await append({
        role: "user",
        content: userMessage,
        agentId,
      })
    },
    [state.input, state.isLoading, append, agentId],
  )

  const reload = useCallback(async () => {
    if (state.messages.length === 0) return

    const lastUserMessage = [...state.messages].reverse().find((msg) => msg.role === "user")
    if (!lastUserMessage) return

    // Remove the last assistant message if it exists
    const messagesWithoutLastAssistant = state.messages.filter((msg, index) => {
      if (msg.role === "assistant" && index === state.messages.length - 1) {
        return false
      }
      return true
    })

    setState((prev) => ({ ...prev, messages: messagesWithoutLastAssistant }))

    await append({
      role: "user",
      content: lastUserMessage.content,
      agentId: lastUserMessage.agentId,
    })
  }, [state.messages, append])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages: state.messages,
    input: state.input,
    isLoading: state.isLoading,
    error: state.error,
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    setInput,
    setMessages,
  }
}
