
interface ChatMessage {
  role: string
  content: string
  timestamp?: string
}

interface AutoSaveOptions {
  minMessageCount?: number
  debounceMs?: number
}

class BriefcaseAutoSaver {
  private saveQueue = new Map<string, NodeJS.Timeout>()
  private readonly options: Required<AutoSaveOptions>

  constructor(options: AutoSaveOptions = {}) {
    this.options = {
      minMessageCount: options.minMessageCount ?? 3,
      debounceMs: options.debounceMs ?? 2000
    }
  }

  /**
   * Auto-save chat conversation to briefcase
   */
  async saveChatConversation(
    conversationId: string,
    title: string,
    messages: ChatMessage[],
    agentName?: string
  ) {
    // Only save conversations with meaningful length
    if (messages.length < this.options.minMessageCount) {
      return
    }

    // Clear any existing timeout for this conversation
    const existingTimeout = this.saveQueue.get(conversationId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new debounced save
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/unified-briefcase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
              ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
              : {})
          },
          body: JSON.stringify({
            type: 'chat',
            title: this.generateChatTitle(title, messages, agentName),
            content: { messages },
            metadata: {
              agentName,
              messageCount: messages.length,
              conversationId
            }
          })
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Failed to save chat')
        }

        logInfo('Chat conversation saved to briefcase:', conversationId)

      } catch (error) {
        logError('Auto-save chat error:', error)
      } finally {
        this.saveQueue.delete(conversationId)
      }
    }, this.options.debounceMs)

    this.saveQueue.set(conversationId, timeout)
  }

  /**
   * Save template progress to briefcase
   */
  async saveTemplateProgress(
    templateSlug: string,
    title: string,
    content: any,
    progress: number
  ) {
    try {
      const response = await fetch('/api/unified-briefcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {})
        },
        body: JSON.stringify({
          type: 'template_save',
          title: `${title} (${progress}% complete)`,
          content,
          metadata: {
            templateSlug,
            progress,
            autoSaved: true
          }
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save template')
      }

      logInfo('Template progress saved to briefcase:', templateSlug)

    } catch (error) {
      logError('Auto-save template error:', error)
    }
  }

  /**
   * Save brand work to briefcase
   */
  async saveBrandWork(
    title: string,
    brandData: any
  ) {
    try {
      const response = await fetch('/api/unified-briefcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {})
        },
        body: JSON.stringify({
          type: 'brand',
          title,
          content: brandData
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save brand work')
      }

      logInfo('Brand work saved to briefcase:', title)

    } catch (error) {
      logError('Auto-save brand work error:', error)
    }
  }

  /**
   * Generate a meaningful title for chat conversations
   */
  private generateChatTitle(
    providedTitle: string,
    messages: ChatMessage[],
    agentName?: string
  ): string {
    if (providedTitle && providedTitle !== 'New Chat') {
      return providedTitle
    }

    // Try to extract a meaningful title from the first user message
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim()
      const truncated = content.length > 50 ? content.substring(0, 50) + '...' : content
      return agentName
        ? `${agentName}: ${truncated}`
        : `Chat: ${truncated}`
    }

    // Fallback to generic title with agent name if available
    const timestamp = new Date().toLocaleDateString()
    return agentName
      ? `${agentName} Chat - ${timestamp}`
      : `Chat Conversation - ${timestamp}`
  }

  /**
   * Clear all pending saves
   */
  clearPendingSaves() {
    for (const timeout of Array.from(this.saveQueue.values())) {
      clearTimeout(timeout)
    }
    this.saveQueue.clear()
  }

  /**
   * Get count of pending saves
   */
  getPendingSaveCount(): number {
    return this.saveQueue.size
  }
}

// Export singleton instance
export const briefcaseAutoSaver = new BriefcaseAutoSaver()

// Export class for custom instances
export { BriefcaseAutoSaver }

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
// Export types
export type { ChatMessage, AutoSaveOptions }