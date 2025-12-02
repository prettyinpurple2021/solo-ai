/**
 * Context Manager - Manages conversation context and shared knowledge across agents
 * Handles context persistence, retrieval, and context switching for multi-agent collaboration
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { z } from 'zod'


// Context types and schemas
export const ContextEntrySchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  agentId: z.string(),
  contextType: z.enum(['conversation', 'task', 'knowledge', 'preference', 'state']),
  key: z.string(),
  value: z.any(),
  timestamp: z.date(),
  expiresAt: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).optional()
})

export const ConversationContextSchema = z.object({
  sessionId: z.string().uuid(),
  participants: z.array(z.string()),
  currentTopic: z.string().optional(),
  conversationHistory: z.array(z.object({
    messageId: z.string().uuid(),
    agentId: z.string(),
    content: z.string(),
    timestamp: z.date(),
    importance: z.enum(['low', 'medium', 'high']).default('medium')
  })),
  sharedKnowledge: z.record(z.string(), z.any()).default({}),
  activeGoals: z.array(z.object({
    id: z.string(),
    description: z.string(),
    assignedAgent: z.string().optional(),
    status: z.enum(['pending', 'active', 'completed', 'blocked']),
    priority: z.enum(['low', 'medium', 'high']).default('medium')
  })).default([]),
  contextSummary: z.string().optional(),
  lastUpdated: z.date()
})

export type ContextEntry = z.infer<typeof ContextEntrySchema>
export type ConversationContext = z.infer<typeof ConversationContextSchema>

export interface ContextQuery {
  sessionId?: string
  agentId?: string
  contextType?: string[]
  keys?: string[]
  tags?: string[]
  timeRange?: {
    start: Date
    end: Date
  }
  priority?: string[]
  limit?: number
}

export interface ContextSummary {
  sessionId: string
  totalEntries: number
  activeAgents: string[]
  mainTopics: string[]
  recentActivity: Date
  keyInsights: string[]
  completedGoals: number
  pendingGoals: number
}

/**
 * Context Manager Class
 * Manages conversation context and shared knowledge across agents
 */
export class ContextManager {
  private contextStore: Map<string, ContextEntry> = new Map()
  private sessionContexts: Map<string, ConversationContext> = new Map()
  private contextIndices: {
    bySession: Map<string, Set<string>>
    byAgent: Map<string, Set<string>>
    byType: Map<string, Set<string>>
    byTags: Map<string, Set<string>>
  } = {
      bySession: new Map(),
      byAgent: new Map(),
      byType: new Map(),
      byTags: new Map()
    }

  constructor() {
    this.startContextCleanup()
  }

  /**
   * Store context information
   */
  async storeContext(entry: Omit<ContextEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const contextEntry: ContextEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }

      // Validate entry
      const validatedEntry = ContextEntrySchema.parse(contextEntry)

      // Store the entry
      this.contextStore.set(validatedEntry.id, validatedEntry)

      // Update indices
      this.updateIndices(validatedEntry)

      // Update session context
      await this.updateSessionContext(validatedEntry)

      logInfo(`📝 Context stored: ${validatedEntry.contextType}/${validatedEntry.key} for ${validatedEntry.agentId}`)

      return validatedEntry.id

    } catch (error) {
      logError('Error storing context:', error)
      throw error
    }
  }

  /**
   * Retrieve context information
   */
  async getContext(query: ContextQuery): Promise<ContextEntry[]> {
    try {
      let candidateIds = new Set<string>(this.contextStore.keys())

      // Apply filters based on indices
      if (query.sessionId) {
        const sessionIds = this.contextIndices.bySession.get(query.sessionId) || new Set()
        candidateIds = new Set([...candidateIds].filter(id => sessionIds.has(id)))
      }

      if (query.agentId) {
        const agentIds = this.contextIndices.byAgent.get(query.agentId) || new Set()
        candidateIds = new Set([...candidateIds].filter(id => agentIds.has(id)))
      }

      if (query.contextType?.length) {
        const typeIds = new Set<string>()
        query.contextType.forEach(type => {
          const ids = this.contextIndices.byType.get(type) || new Set()
          ids.forEach(id => typeIds.add(id))
        })
        candidateIds = new Set([...candidateIds].filter(id => typeIds.has(id)))
      }

      if (query.tags?.length) {
        const tagIds = new Set<string>()
        query.tags.forEach(tag => {
          const ids = this.contextIndices.byTags.get(tag) || new Set()
          ids.forEach(id => tagIds.add(id))
        })
        candidateIds = new Set([...candidateIds].filter(id => tagIds.has(id)))
      }

      // Get the actual entries and apply additional filters
      let results: ContextEntry[] = []

      for (const id of candidateIds) {
        const entry = this.contextStore.get(id)
        if (!entry) continue

        // Apply time range filter
        if (query.timeRange) {
          const entryTime = entry.timestamp.getTime()
          if (entryTime < query.timeRange.start.getTime() ||
            entryTime > query.timeRange.end.getTime()) {
            continue
          }
        }

        // Apply key filter
        if (query.keys?.length && !query.keys.includes(entry.key)) {
          continue
        }

        // Apply priority filter
        if (query.priority?.length && !query.priority.includes(entry.priority)) {
          continue
        }

        // Check if expired
        if (entry.expiresAt && entry.expiresAt < new Date()) {
          continue
        }

        results.push(entry)
      }

      // Sort by timestamp (most recent first) and priority
      results.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority]
        const bPriority = priorityOrder[b.priority]

        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }

        return b.timestamp.getTime() - a.timestamp.getTime()
      })

      // Apply limit
      if (query.limit && query.limit > 0) {
        results = results.slice(0, query.limit)
      }

      return results

    } catch (error) {
      logError('Error retrieving context:', error)
      throw error
    }
  }

  /**
   * Get conversation context for a session
   */
  async getConversationContext(sessionId: string): Promise<ConversationContext | null> {
    return this.sessionContexts.get(sessionId) || null
  }

  /**
   * Update conversation context
   */
  async updateConversationContext(
    sessionId: string,
    updates: Partial<Omit<ConversationContext, 'sessionId' | 'lastUpdated'>>
  ): Promise<void> {
    try {
      const existing = this.sessionContexts.get(sessionId)

      if (!existing) {
        // Create new conversation context
        const newContext: ConversationContext = {
          sessionId,
          participants: updates.participants || [],
          conversationHistory: updates.conversationHistory || [],
          sharedKnowledge: updates.sharedKnowledge || {},
          activeGoals: updates.activeGoals || [],
          lastUpdated: new Date(),
          ...updates
        }

        this.sessionContexts.set(sessionId, newContext)
      } else {
        // Update existing context
        const updatedContext = {
          ...existing,
          ...updates,
          lastUpdated: new Date()
        }

        this.sessionContexts.set(sessionId, updatedContext)
      }

      logInfo(`🔄 Conversation context updated for session ${sessionId}`)

    } catch (error) {
      logError('Error updating conversation context:', error)
      throw error
    }
  }

  /**
   * Add message to conversation history
   */
  async addToConversationHistory(
    sessionId: string,
    messageId: string,
    agentId: string,
    content: string,
    importance: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      let context = this.sessionContexts.get(sessionId)

      if (!context) {
        context = {
          sessionId,
          participants: [agentId],
          conversationHistory: [],
          sharedKnowledge: {},
          activeGoals: [],
          lastUpdated: new Date()
        }
      }

      // Add to history
      context.conversationHistory.push({
        messageId,
        agentId,
        content,
        timestamp: new Date(),
        importance
      })

      // Keep only last 100 messages to manage memory
      if (context.conversationHistory.length > 100) {
        context.conversationHistory = context.conversationHistory.slice(-100)
      }

      // Update participants if new
      if (!context.participants.includes(agentId)) {
        context.participants.push(agentId)
      }

      context.lastUpdated = new Date()
      this.sessionContexts.set(sessionId, context)

    } catch (error) {
      logError('Error adding to conversation history:', error)
      throw error
    }
  }

  /**
   * Store shared knowledge
   */
  async storeSharedKnowledge(
    sessionId: string,
    key: string,
    value: any,
    agentId?: string
  ): Promise<void> {
    try {
      // Store as context entry
      await this.storeContext({
        sessionId,
        agentId: agentId || 'system',
        contextType: 'knowledge',
        key,
        value,
        priority: 'medium',
        tags: ['shared-knowledge']
      })

      // Update session context
      let context = this.sessionContexts.get(sessionId)

      if (!context) {
        context = {
          sessionId,
          participants: agentId ? [agentId] : [],
          conversationHistory: [],
          sharedKnowledge: {},
          activeGoals: [],
          lastUpdated: new Date()
        }
      }

      context.sharedKnowledge[key] = value
      context.lastUpdated = new Date()
      this.sessionContexts.set(sessionId, context)

      logInfo(`🧠 Shared knowledge stored: ${key} for session ${sessionId}`)

    } catch (error) {
      logError('Error storing shared knowledge:', error)
      throw error
    }
  }

  /**
   * Get shared knowledge
   */
  async getSharedKnowledge(sessionId: string, key?: string): Promise<any> {
    const context = this.sessionContexts.get(sessionId)

    if (!context) {
      return key ? undefined : {}
    }

    return key ? context.sharedKnowledge[key] : context.sharedKnowledge
  }

  /**
   * Add or update goal
   */
  async updateGoal(
    sessionId: string,
    goal: {
      id: string
      description: string
      assignedAgent?: string
      status: 'pending' | 'active' | 'completed' | 'blocked'
      priority?: 'low' | 'medium' | 'high'
    }
  ): Promise<void> {
    try {
      let context = this.sessionContexts.get(sessionId)

      if (!context) {
        context = {
          sessionId,
          participants: [],
          conversationHistory: [],
          sharedKnowledge: {},
          activeGoals: [],
          lastUpdated: new Date()
        }
      }

      // Find existing goal or add new one
      const existingIndex = context.activeGoals.findIndex(g => g.id === goal.id)

      if (existingIndex !== -1) {
        context.activeGoals[existingIndex] = { ...goal, priority: goal.priority || 'medium' }
      } else {
        context.activeGoals.push({ ...goal, priority: goal.priority || 'medium' })
      }

      context.lastUpdated = new Date()
      this.sessionContexts.set(sessionId, context)

      // Store as context entry
      await this.storeContext({
        sessionId,
        agentId: goal.assignedAgent || 'system',
        contextType: 'task',
        key: `goal-${goal.id}`,
        value: goal,
        priority: goal.priority === 'high' ? 'high' : 'medium',
        tags: ['goal', goal.status]
      })

      logInfo(`🎯 Goal updated: ${goal.id} (${goal.status}) for session ${sessionId}`)

    } catch (error) {
      logError('Error updating goal:', error)
      throw error
    }
  }

  /**
   * Generate context summary for a session
   */
  async generateContextSummary(sessionId: string): Promise<ContextSummary> {
    try {
      const context = this.sessionContexts.get(sessionId)
      const contextEntries = await this.getContext({ sessionId, limit: 1000 })

      if (!context) {
        return {
          sessionId,
          totalEntries: contextEntries.length,
          activeAgents: [],
          mainTopics: [],
          recentActivity: new Date(),
          keyInsights: [],
          completedGoals: 0,
          pendingGoals: 0
        }
      }

      // Analyze context entries
      const agentSet = new Set<string>()
      const topicMap = new Map<string, number>()
      const keyInsights: string[] = []

      contextEntries.forEach(entry => {
        agentSet.add(entry.agentId)

        // Extract topics from tags
        entry.tags.forEach(tag => {
          topicMap.set(tag, (topicMap.get(tag) || 0) + 1)
        })

        // Collect high-priority insights
        if (entry.priority === 'high' || entry.priority === 'critical') {
          if (typeof entry.value === 'string') {
            keyInsights.push(entry.value)
          }
        }
      })

      // Get top topics
      const mainTopics = Array.from(topicMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic)

      // Count goals
      const completedGoals = context.activeGoals.filter(g => g.status === 'completed').length
      const pendingGoals = context.activeGoals.filter(g => g.status !== 'completed').length

      return {
        sessionId,
        totalEntries: contextEntries.length,
        activeAgents: Array.from(agentSet),
        mainTopics,
        recentActivity: context.lastUpdated,
        keyInsights: keyInsights.slice(0, 10), // Top 10 insights
        completedGoals,
        pendingGoals
      }

    } catch (error) {
      logError('Error generating context summary:', error)
      throw error
    }
  }

  /**
   * Clear expired context entries
   */
  async clearExpiredContext(): Promise<number> {
    try {
      const now = new Date()
      let clearedCount = 0

      for (const [id, entry] of this.contextStore.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
          this.contextStore.delete(id)
          this.removeFromIndices(entry)
          clearedCount++
        }
      }

      if (clearedCount > 0) {
        logInfo(`🧹 Cleared ${clearedCount} expired context entries`)
      }

      return clearedCount

    } catch (error) {
      logError('Error clearing expired context:', error)
      return 0
    }
  }

  /**
   * Export context for a session
   */
  async exportSessionContext(sessionId: string): Promise<{
    conversationContext: ConversationContext | null
    contextEntries: ContextEntry[]
  }> {
    const conversationContext = this.sessionContexts.get(sessionId) || null
    const contextEntries = await this.getContext({ sessionId })

    return {
      conversationContext,
      contextEntries
    }
  }

  /**
   * Import context for a session
   */
  async importSessionContext(data: {
    conversationContext: ConversationContext
    contextEntries: ContextEntry[]
  }): Promise<void> {
    try {
      // Import conversation context
      this.sessionContexts.set(data.conversationContext.sessionId, data.conversationContext)

      // Import context entries
      for (const entry of data.contextEntries) {
        this.contextStore.set(entry.id, entry)
        this.updateIndices(entry)
      }

      logInfo(`📥 Imported context for session ${data.conversationContext.sessionId}`)

    } catch (error) {
      logError('Error importing session context:', error)
      throw error
    }
  }

  /**
   * Update indices for fast lookups
   */
  private updateIndices(entry: ContextEntry): void {
    // Session index
    if (!this.contextIndices.bySession.has(entry.sessionId)) {
      this.contextIndices.bySession.set(entry.sessionId, new Set())
    }
    this.contextIndices.bySession.get(entry.sessionId)!.add(entry.id)

    // Agent index
    if (!this.contextIndices.byAgent.has(entry.agentId)) {
      this.contextIndices.byAgent.set(entry.agentId, new Set())
    }
    this.contextIndices.byAgent.get(entry.agentId)!.add(entry.id)

    // Type index
    if (!this.contextIndices.byType.has(entry.contextType)) {
      this.contextIndices.byType.set(entry.contextType, new Set())
    }
    this.contextIndices.byType.get(entry.contextType)!.add(entry.id)

    // Tags index
    entry.tags.forEach(tag => {
      if (!this.contextIndices.byTags.has(tag)) {
        this.contextIndices.byTags.set(tag, new Set())
      }
      this.contextIndices.byTags.get(tag)!.add(entry.id)
    })
  }

  /**
   * Remove from indices
   */
  private removeFromIndices(entry: ContextEntry): void {
    this.contextIndices.bySession.get(entry.sessionId)?.delete(entry.id)
    this.contextIndices.byAgent.get(entry.agentId)?.delete(entry.id)
    this.contextIndices.byType.get(entry.contextType)?.delete(entry.id)
    entry.tags.forEach(tag => {
      this.contextIndices.byTags.get(tag)?.delete(entry.id)
    })
  }

  /**
   * Update session context when new context entry is added
   */
  private async updateSessionContext(entry: ContextEntry): Promise<void> {
    // This method can be expanded to automatically update conversation context
    // based on new context entries, such as updating current topic, etc.
  }

  /**
   * Start periodic cleanup of expired context
   */
  private startContextCleanup(): void {
    setInterval(() => {
      this.clearExpiredContext().catch((err) => {
        logError('Failed to clear expired context', err)
      })
    }, 300000) // Run every 5 minutes
  }

  /**
   * Get context statistics
   */
  getContextStats(): {
    totalEntries: number
    activeSessions: number
    memoryUsage: {
      contextStore: number
      sessionContexts: number
      indices: number
    }
  } {
    return {
      totalEntries: this.contextStore.size,
      activeSessions: this.sessionContexts.size,
      memoryUsage: {
        contextStore: this.contextStore.size,
        sessionContexts: this.sessionContexts.size,
        indices: Object.values(this.contextIndices).reduce((total, index) => total + index.size, 0)
      }
    }
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    this.contextStore.clear()
    this.sessionContexts.clear()
    Object.values(this.contextIndices).forEach(index => index.clear())
  }
}