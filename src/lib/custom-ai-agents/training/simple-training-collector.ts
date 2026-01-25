
// Simplified training data collector that works with the current setup
export interface TrainingInteraction {
  id: string
  userId: string
  agentId: string
  timestamp: Date
  userMessage: string
  agentResponse: string
  context: Record<string, any>
  userRating?: number
  userFeedback?: string
  success: boolean
  responseTime: number
  confidence: number
  collaborationRequests: string[]
  followUpTasks: string[]
  metadata: {
    model: string
    temperature: number
    maxOutputTokens: number
    framework: string
    specialization: string
  }
}

export interface TrainingMetrics {
  totalInteractions: number
  averageRating: number
  successRate: number
  averageResponseTime: number
  averageConfidence: number
  topPerformingAgents: Array<{
    agentId: string
    successRate: number
    averageRating: number
    totalInteractions: number
  }>
  commonFailurePatterns: Array<{
    pattern: string
    frequency: number
    agents: string[]
  }>
  userSatisfactionTrends: Array<{
    date: string
    averageRating: number
    totalInteractions: number
  }>
}

export class SimpleTrainingCollector {
  private static instance: SimpleTrainingCollector
  private interactions: TrainingInteraction[] = []

  private constructor() {}

  static getInstance(): SimpleTrainingCollector {
    if (!SimpleTrainingCollector.instance) {
      SimpleTrainingCollector.instance = new SimpleTrainingCollector()
    }
    return SimpleTrainingCollector.instance
  }

  async recordInteraction(interaction: Omit<TrainingInteraction, 'id' | 'timestamp'>): Promise<string> {
    const id = crypto.randomUUID()
    const timestamp = new Date()

    const fullInteraction: TrainingInteraction = {
      id,
      timestamp,
      ...interaction
    }

    this.interactions.push(fullInteraction)
    
    // Keep only last 1000 interactions in memory
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000)
    }

    logInfo(`Recorded training interaction for ${interaction.agentId}`, {
      id,
      userMessage: interaction.userMessage.substring(0, 50) + '...',
      success: interaction.success,
      confidence: interaction.confidence
    })

    return id
  }

  async updateInteractionRating(interactionId: string, rating: number, feedback?: string): Promise<void> {
    const interaction = this.interactions.find(i => i.id === interactionId)
    if (interaction) {
      interaction.userRating = rating
      interaction.userFeedback = feedback
      logInfo(`Updated rating for interaction ${interactionId}: ${rating} stars`)
    }
  }

  async getTrainingMetrics(userId: string, timeRange?: { start: Date; end: Date }): Promise<TrainingMetrics> {
    let filteredInteractions = this.interactions.filter(i => i.userId === userId)

    if (timeRange) {
      filteredInteractions = filteredInteractions.filter(i => 
        i.timestamp >= timeRange.start && i.timestamp <= timeRange.end
      )
    }

    const total = filteredInteractions.length
    const successful = filteredInteractions.filter(i => i.success).length
    const withRating = filteredInteractions.filter(i => i.userRating !== undefined)

    const averageRating = withRating.length > 0 
      ? withRating.reduce((sum, i) => sum + (i.userRating || 0), 0) / withRating.length 
      : 0

    const successRate = total > 0 ? (successful / total) * 100 : 0
    const averageResponseTime = total > 0 
      ? filteredInteractions.reduce((sum, i) => sum + i.responseTime, 0) / total 
      : 0
    const averageConfidence = total > 0 
      ? filteredInteractions.reduce((sum, i) => sum + i.confidence, 0) / total 
      : 0

    // Calculate top performing agents
    const agentStats = new Map<string, { total: number; successful: number; ratings: number[] }>()
    
    filteredInteractions.forEach(interaction => {
      const stats = agentStats.get(interaction.agentId) || { total: 0, successful: 0, ratings: [] }
      stats.total++
      if (interaction.success) stats.successful++
      if (interaction.userRating) stats.ratings.push(interaction.userRating)
      agentStats.set(interaction.agentId, stats)
    })

    const topPerformingAgents = Array.from(agentStats.entries())
      .map(([agentId, stats]) => ({
        agentId,
        successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
        averageRating: stats.ratings.length > 0 
          ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length 
          : 0,
        totalInteractions: stats.total
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)

    // Calculate trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentInteractions = filteredInteractions.filter(i => i.timestamp >= sevenDaysAgo)
    const trendsMap = new Map<string, { ratings: number[]; count: number }>()
    
    recentInteractions.forEach(interaction => {
      const date = interaction.timestamp.toISOString().split('T')[0]
      const trend = trendsMap.get(date) || { ratings: [], count: 0 }
      trend.count++
      if (interaction.userRating) trend.ratings.push(interaction.userRating)
      trendsMap.set(date, trend)
    })

    const userSatisfactionTrends = Array.from(trendsMap.entries())
      .map(([date, trend]) => ({
        date,
        averageRating: trend.ratings.length > 0 
          ? trend.ratings.reduce((sum, r) => sum + r, 0) / trend.ratings.length 
          : 0,
        totalInteractions: trend.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalInteractions: total,
      averageRating,
      successRate,
      averageResponseTime,
      averageConfidence,
      topPerformingAgents,
      commonFailurePatterns: this.analyzeFailurePatterns(filteredInteractions),
      userSatisfactionTrends
    }
  }

  async getTrainingDataForAgent(agentId: string, userId: string, limit = 1000): Promise<TrainingInteraction[]> {
    return this.interactions
      .filter(i => i.agentId === agentId && i.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async exportTrainingData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const data = this.interactions.filter(i => i.userId === userId)

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {})
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header as keyof TrainingInteraction]
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          }).join(',')
        )
      ]
      return csvRows.join('\n')
    }

    return JSON.stringify(data, null, 2)
  }

  // Get all interactions for debugging
  getAllInteractions(): TrainingInteraction[] {
    return [...this.interactions]
  }

  // Clear all data (for testing)
  clearData(): void {
    this.interactions = []
  }


  private analyzeFailurePatterns(interactions: TrainingInteraction[]): Array<{ pattern: string; frequency: number; agents: string[] }> {
    const failedInteractions = interactions.filter(i => !i.success || (i.userRating && i.userRating <= 2))
    if (failedInteractions.length === 0) return []

    const patterns = new Map<string, { count: number; agents: Set<string> }>()
    
    failedInteractions.forEach(i => {
      // Simple keyword extraction for basic pattern matching
      // Basic heuristic pattern matching
      let pattern = 'Unknown Error'
      const msg = i.userMessage.toLowerCase()
      
      if (msg.includes('error') || msg.includes('fail')) pattern = 'Explicit Error Mention'
      else if (msg.includes('wrong') || msg.includes('incorrect')) pattern = 'Incorrect Information'
      else if (msg.includes('slow') || msg.includes('latency')) pattern = 'High Latency'
      else if (msg.includes('format')) pattern = 'Formatting Issue'
      else if (i.confidence < 0.5) pattern = 'Low Confidence'
      
      const entry = patterns.get(pattern) || { count: 0, agents: new Set() }
      entry.count++
      entry.agents.add(i.agentId)
      patterns.set(pattern, entry)
    })

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        agents: Array.from(data.agents)
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }
}

import { logInfo,} from '@/lib/logger'