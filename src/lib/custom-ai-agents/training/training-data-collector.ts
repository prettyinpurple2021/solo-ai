import { logError, logInfo } from '@/lib/logger'
import { getSql } from "@/lib/api-utils"
import { generateObject } from "ai"
import { openai } from "@/lib/ai-config"
import { z } from "zod"



export interface TrainingInteraction {
  id: string
  userId: string
  agentId: string
  timestamp: Date
  userMessage: string
  agentResponse: string
  context: Record<string, unknown>
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

export class TrainingDataCollector {
  async recordInteraction(interaction: Omit<TrainingInteraction, 'id' | 'timestamp'>): Promise<string> {
    const id = crypto.randomUUID()
    const timestamp = new Date()

    try {
      const sql = getSql()
      const contextJson = JSON.stringify(interaction.context)
      const collaborationJson = JSON.stringify(interaction.collaborationRequests)
      const followUpJson = JSON.stringify(interaction.followUpTasks)
      const metadataJson = JSON.stringify(interaction.metadata)
      
      await sql`
        INSERT INTO agent_training_interactions (
          id, user_id, agent_id, timestamp, user_message, agent_response,
          context, user_rating, user_feedback, success, response_time,
          confidence, collaboration_requests, follow_up_tasks, metadata
        ) VALUES (
          ${id}, ${interaction.userId}, ${interaction.agentId}, ${timestamp}, ${interaction.userMessage}, ${interaction.agentResponse},
          ${contextJson}: jsonb, ${interaction.userRating || null}, ${interaction.userFeedback || null}, ${interaction.success}, ${interaction.responseTime},
          ${interaction.confidence}, ${collaborationJson}: jsonb, ${followUpJson}: jsonb, ${metadataJson}: jsonb
        )
      `

      return id
    } catch (error) {
      logError('Error recording training interaction:', error)
      throw new Error('Failed to record training interaction')
    }
  }

  async updateInteractionRating(interactionId: string, rating: number, feedback?: string): Promise<void> {
    try {
      const sql = getSql()
      await sql`
        UPDATE agent_training_interactions 
        SET user_rating = ${rating}, user_feedback = ${feedback || null}, updated_at = NOW()
        WHERE id = ${interactionId}
      `
    } catch (error) {
      logError('Error updating interaction rating:', error)
      throw new Error('Failed to update interaction rating')
    }
  }

  async getTrainingMetrics(userId: string, timeRange?: { start: Date; end: Date }): Promise<TrainingMetrics> {
    try {
      const sql = getSql()

      // Get total interactions
      const totalResult = timeRange 
        ? await sql`
          SELECT COUNT(*) as total
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        ` as any[]
        : await sql`
          SELECT COUNT(*) as total
          FROM agent_training_interactions 
          WHERE user_id = ${userId}
        ` as any[]

      // Get average rating
      const ratingResult = timeRange 
        ? await sql`
          SELECT AVG(user_rating) as avg_rating
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND user_rating IS NOT NULL AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        ` as any[]
        : await sql`
          SELECT AVG(user_rating) as avg_rating
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND user_rating IS NOT NULL
        ` as any[]

      // Get success rate
      const successResult = timeRange 
        ? await sql`
          SELECT 
            COUNT(*) FILTER (WHERE success = true) as successful,
            COUNT(*) as total
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        ` as any[]
        : await sql`
          SELECT 
            COUNT(*) FILTER (WHERE success = true) as successful,
            COUNT(*) as total
          FROM agent_training_interactions 
          WHERE user_id = ${userId}
        ` as any[]

      // Get average response time
      const responseTimeResult = timeRange 
        ? await sql`
          SELECT AVG(response_time) as avg_response_time
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        ` as any[]
        : await sql`
          SELECT AVG(response_time) as avg_response_time
          FROM agent_training_interactions 
          WHERE user_id = ${userId}
        ` as any[]

      // Get average confidence
      const confidenceResult = timeRange 
        ? await sql`
          SELECT AVG(confidence) as avg_confidence
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        ` as any[]
        : await sql`
          SELECT AVG(confidence) as avg_confidence
          FROM agent_training_interactions 
          WHERE user_id = ${userId}
        ` as any[]

      // Get top performing agents
      const topAgentsResult = timeRange 
        ? await sql`
          SELECT 
            agent_id,
            COUNT(*) as total_interactions,
            AVG(user_rating) as avg_rating,
            COUNT(*) FILTER (WHERE success = true): float / COUNT(*) as success_rate
          FROM agent_training_interactions 
          WHERE user_id = ${userId} AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
          GROUP BY agent_id
          ORDER BY success_rate DESC, avg_rating DESC
          LIMIT 5
        ` as any[]
        : await sql`
          SELECT 
            agent_id,
            COUNT(*) as total_interactions,
            AVG(user_rating) as avg_rating,
            COUNT(*) FILTER (WHERE success = true): float / COUNT(*) as success_rate
          FROM agent_training_interactions 
          WHERE user_id = ${userId}
          GROUP BY agent_id
          ORDER BY success_rate DESC, avg_rating DESC
          LIMIT 5
        ` as any[]

      // Get user satisfaction trends (last 30 days)
      const trendsResult = await sql`
        SELECT 
          DATE(timestamp) as date,
          AVG(user_rating) as avg_rating,
          COUNT(*) as total_interactions
        FROM agent_training_interactions 
        WHERE user_id = ${userId} 
          AND timestamp >= NOW() - INTERVAL '30 days'
          AND user_rating IS NOT NULL
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      ` as any[]

      const total = parseInt(String(totalResult[0]?.total || '0'))
      const avgRating = parseFloat(String(ratingResult[0]?.avg_rating || '0'))
      const successData = successResult[0] as { successful: number; total: number } | undefined
      const successRate = successData ? 
        (parseInt(String(successData.successful || '0')) / parseInt(String(successData.total || '1'))) * 100 : 0
      const avgResponseTime = parseFloat(String(responseTimeResult[0]?.avg_response_time || '0'))
      const avgConfidence = parseFloat(String(confidenceResult[0]?.avg_confidence || '0'))

      return {
        totalInteractions: total,
        averageRating: avgRating,
        successRate,
        averageResponseTime: avgResponseTime,
        averageConfidence: avgConfidence,
        topPerformingAgents: topAgentsResult.map((row: any) => ({
          agentId: row.agent_id,
          successRate: parseFloat(String(row.success_rate || '0')) * 100,
          averageRating: parseFloat(String(row.avg_rating || '0')),
          totalInteractions: parseInt(String(row.total_interactions || '0'))
        })),
        commonFailurePatterns: await this.analyzeFailurePatterns(userId, timeRange),

        userSatisfactionTrends: trendsResult.map((row: any) => ({
          date: String(row.date),
          averageRating: parseFloat(String(row.avg_rating || '0')),
          totalInteractions: parseInt(String(row.total_interactions || '0'))
        }))
      }
    } catch (error) {
      logError('Error getting training metrics:', error)
      throw new Error('Failed to get training metrics')
    }
  }

  async getTrainingDataForAgent(agentId: string, userId: string, limit = 1000): Promise<TrainingInteraction[]> {
    try {
      const sql = getSql()
      const result = await sql`
        SELECT *
        FROM agent_training_interactions 
        WHERE agent_id = ${agentId} AND user_id = ${userId}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      ` as any[]

      return result.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        agentId: row.agent_id,
        timestamp: new Date(row.timestamp),
        userMessage: row.user_message,
        agentResponse: row.agent_response,
        context: typeof row.context === 'string' ? JSON.parse(row.context) : (row.context || {}),
        userRating: row.user_rating,
        userFeedback: row.user_feedback,
        success: row.success,
        responseTime: row.response_time,
        confidence: row.confidence,
        collaborationRequests: typeof row.collaboration_requests === 'string' ? JSON.parse(row.collaboration_requests) : (row.collaboration_requests || []),
        followUpTasks: typeof row.follow_up_tasks === 'string' ? JSON.parse(row.follow_up_tasks) : (row.follow_up_tasks || []),
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {})
      }))
    } catch (error) {
      logError('Error getting training data for agent:', error)
      throw new Error('Failed to get training data for agent')
    }
  }

  async exportTrainingData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const sql = getSql()
      const result = await sql`
        SELECT *
        FROM agent_training_interactions 
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
      ` as any[]

      const data = result.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        agentId: row.agent_id,
        timestamp: row.timestamp,
        userMessage: row.user_message,
        agentResponse: row.agent_response,
        context: typeof row.context === 'string' ? JSON.parse(row.context) : (row.context || {}),
        userRating: row.user_rating,
        userFeedback: row.user_feedback,
        success: row.success,
        responseTime: row.response_time,
        confidence: row.confidence,
        collaborationRequests: typeof row.collaboration_requests === 'string' ? JSON.parse(row.collaboration_requests) : (row.collaboration_requests || []),
        followUpTasks: typeof row.follow_up_tasks === 'string' ? JSON.parse(row.follow_up_tasks) : (row.follow_up_tasks || []),
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {})
      }))

      if (format === 'csv') {
        // Convert to CSV format
        const headers = Object.keys(data[0] || {})
        const csvRows = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => {
              const value = row[header as keyof typeof row]
              return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            }).join(',')
          )
        ]
        return csvRows.join('\n')
      }

      return JSON.stringify(data, null, 2)
    } catch (error) {
      logError('Error exporting training data:', error)
      throw new Error('Failed to export training data')
    }
  }

  async analyzeFailurePatterns(userId: string, timeRange?: { start: Date; end: Date }): Promise<TrainingMetrics['commonFailurePatterns']> {
    try {
      const sql = getSql()
      
      // Fetch recent low-rated or failed interactions (sample up to 50 for analysis)
      const failedInteractions = timeRange 
        ? await sql`
          SELECT user_message, agent_response, user_feedback, agent_id
          FROM agent_training_interactions 
          WHERE user_id = ${userId} 
            AND (success = false OR user_rating < 3)
            AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
          ORDER BY timestamp DESC
          LIMIT 50
        ` as any[]
        : await sql`
          SELECT user_message, agent_response, user_feedback, agent_id
          FROM agent_training_interactions 
          WHERE user_id = ${userId} 
            AND (success = false OR user_rating < 3)
          ORDER BY timestamp DESC
          LIMIT 50
        ` as any[]

      if (failedInteractions.length === 0) return []

      // Format data for AI analysis
      const interactionsText = failedInteractions.map(i => 
        `Agent: ${i.agent_id}\nUser: ${i.user_message}\nResponse: ${i.agent_response}\nFeedback: ${i.user_feedback || 'None'}`
      ).join('\n---\n')

      const result = (await generateObject({
        model: openai("gpt-4o"),
        schema: z.object({
          patterns: z.array(z.object({
            pattern: z.string().describe("Concise description of the failure pattern"),
            frequency: z.number().describe("Number of occurrences in the provided sample"),
            agents: z.array(z.string()).describe("IDs of agents exhibiting this pattern")
          }))
        }) as any,
        prompt: `Analyze the following failed or low-rated AI agent interactions and identify common failure patterns. 
        Cluster similar issues together (e.g., "Hallucination of links", "Lack of empathy", "Technical error").
21: 
        Interactions:
        ${interactionsText}`
      })) as any;

      return result.object.patterns
    } catch (error) {
      logError('Error analyzing failure patterns:', error)
      return []
    }
  }
}
