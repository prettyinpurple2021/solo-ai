import { logError, logInfo,} from '@/lib/logger'
import { getSql } from '@/lib/api-utils'
import type { CompetitorAlert, CompetitiveOpportunity } from '@/lib/types'


export interface CompetitiveTaskTemplate {
  id: string
  name: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedMinutes: number
  alertTypes: string[]
  taskTemplate: {
    title: string
    description: string
    category: string
    priority: string
    tags: string[]
  }
}

export interface CompetitiveGoalContext {
  goalId: number
  competitorId: number
  competitorName: string
  threatLevel: string
  marketPosition: any
  benchmarkMetrics: {
    metric: string
    competitorValue: number | string
    ourValue?: number | string
    gap?: number
    trend?: 'improving' | 'declining' | 'stable'
  }[]
}

// Strategic response task templates based on competitive threats
export const COMPETITIVE_TASK_TEMPLATES: CompetitiveTaskTemplate[] = [
  {
    id: 'pricing-response',
    name: 'Pricing Strategy Response',
    description: 'Analyze and respond to competitor pricing changes',
    category: 'Strategic Response',
    priority: 'high',
    estimatedMinutes: 120,
    alertTypes: ['pricing_change', 'new_pricing_tier'],
    taskTemplate: {
      title: 'Respond to {competitor} pricing change',
      description: 'Analyze {competitor}\'s new pricing strategy and develop our response. Consider: 1) Impact on our positioning, 2) Customer retention risk, 3) Revenue implications, 4) Competitive advantages to highlight.',
      category: 'Strategic Response',
      priority: 'high',
      tags: ['competitive-intelligence', 'pricing', 'strategy']
    }
  },
  {
    id: 'product-launch-response',
    name: 'Product Launch Counter-Strategy',
    description: 'Develop response to competitor product launches',
    category: 'Product Strategy',
    priority: 'high',
    estimatedMinutes: 180,
    alertTypes: ['product_launch', 'feature_announcement'],
    taskTemplate: {
      title: 'Counter-strategy for {competitor} product launch',
      description: 'Develop response to {competitor}\'s new product/feature. Actions: 1) Feature gap analysis, 2) Accelerate roadmap items, 3) Marketing counter-narrative, 4) Customer retention strategy.',
      category: 'Product Strategy',
      priority: 'high',
      tags: ['competitive-intelligence', 'product', 'launch-response']
    }
  },
  {
    id: 'talent-acquisition-opportunity',
    name: 'Talent Acquisition Opportunity',
    description: 'Capitalize on competitor talent movements',
    category: 'Talent Strategy',
    priority: 'medium',
    estimatedMinutes: 90,
    alertTypes: ['layoffs', 'key_departure', 'hiring_freeze'],
    taskTemplate: {
      title: 'Talent opportunity from {competitor} changes',
      description: 'Capitalize on {competitor}\'s talent situation. Actions: 1) Identify key talent to recruit, 2) Reach out to affected employees, 3) Accelerate hiring in affected areas, 4) Improve employer branding.',
      category: 'Talent Strategy',
      priority: 'medium',
      tags: ['competitive-intelligence', 'talent', 'recruitment']
    }
  },
  {
    id: 'market-expansion-opportunity',
    name: 'Market Expansion Response',
    description: 'Respond to competitor market moves',
    category: 'Market Strategy',
    priority: 'medium',
    estimatedMinutes: 150,
    alertTypes: ['market_expansion', 'new_geography', 'partnership_announcement'],
    taskTemplate: {
      title: 'Market response to {competitor} expansion',
      description: 'Respond to {competitor}\'s market expansion. Consider: 1) First-mover advantage opportunities, 2) Partnership possibilities, 3) Resource allocation, 4) Competitive positioning in new market.',
      category: 'Market Strategy',
      priority: 'medium',
      tags: ['competitive-intelligence', 'market-expansion', 'strategy']
    }
  },
  {
    id: 'crisis-opportunity',
    name: 'Crisis Response Opportunity',
    description: 'Capitalize on competitor crises',
    category: 'Crisis Response',
    priority: 'critical',
    estimatedMinutes: 60,
    alertTypes: ['negative_news', 'security_breach', 'service_outage', 'legal_issues'],
    taskTemplate: {
      title: 'Capitalize on {competitor} crisis',
      description: 'Respond to {competitor}\'s crisis situation. Immediate actions: 1) Customer acquisition campaign, 2) Highlight our advantages, 3) Prepare crisis communications, 4) Monitor customer sentiment.',
      category: 'Crisis Response',
      priority: 'critical',
      tags: ['competitive-intelligence', 'crisis-response', 'opportunity']
    }
  }
]

export class CompetitiveIntelligenceIntegration {
  /**
   * Automatically create tasks from competitive intelligence alerts
   */
  static async createTaskFromAlert(alert: CompetitorAlert, userId: string): Promise<number | null> {
    try {
      // Find matching task template
      const template = COMPETITIVE_TASK_TEMPLATES.find(t => 
        t.alertTypes.includes(alert.alert_type)
      )
      
      if (!template) {
        logInfo(`No task template found for alert type: ${alert.alert_type}`)
        return null
      }
      
      // Get competitor name for template substitution
      const sql = getSql()
      const competitorRows = await sql`
        SELECT name FROM competitor_profiles WHERE id = ${alert.competitor_id}
      ` as any[]
      
      const competitorName = competitorRows[0]?.name || 'Unknown Competitor'
      
      // Create task with template
      const taskTitle = template.taskTemplate.title.replace('{competitor}', competitorName)
      const taskDescription = template.taskTemplate.description.replace(/{competitor}/g, competitorName)
      const tagsJson = JSON.stringify([...template.taskTemplate.tags, `alert-${alert.id}`])
      const aiSuggestionsJson = JSON.stringify({
        source: 'competitive_intelligence',
        alert_id: alert.id,
        competitor_id: alert.competitor_id,
        template_id: template.id,
        created_from_alert: true
      })
      
      const taskRows = await sql`
        INSERT INTO tasks (
          user_id, title, description, category, priority, 
          estimated_minutes, tags, ai_suggestions, status
        ) VALUES (${userId}, ${taskTitle}, ${taskDescription}, ${template.taskTemplate.category}, ${template.taskTemplate.priority}, ${template.estimatedMinutes}, ${tagsJson}: jsonb, ${aiSuggestionsJson}: jsonb, 'pending') RETURNING id
      ` as any[]
      
      return taskRows[0]?.id || null
    } catch (error) {
      logError('Error creating task from alert:', error)
      return null
    }
  }
  
  /**
   * Add competitive context to existing goals
   */
  static async addCompetitiveContextToGoal(
    goalId: number, 
    competitorId: number, 
    userId: string
  ): Promise<CompetitiveGoalContext | null> {
    try {
      const sql = getSql()
      
      // Get competitor information
      const competitorRows = await sql`
        SELECT name, threat_level, market_position FROM competitor_profiles WHERE id = ${competitorId} AND user_id = ${userId}
      ` as any[]
      
      if (competitorRows.length === 0) {
        return null
      }
      
      const competitor = competitorRows[0] as { name: string; threat_level: string; market_position: any }
      
      // Get recent intelligence for benchmarking
      const intelligenceRows = await sql`
        SELECT data_type, extracted_data, analysis_results 
         FROM intelligence_data 
         WHERE competitor_id = ${competitorId} AND user_id = ${userId} 
         AND importance IN ('high', 'critical')
         ORDER BY collected_at DESC 
         LIMIT 10
      ` as any[]
      
      // Extract benchmark metrics from intelligence data
      const benchmarkMetrics = this.extractBenchmarkMetrics(intelligenceRows)
      
      const context: CompetitiveGoalContext = {
        goalId,
        competitorId,
        competitorName: competitor.name,
        threatLevel: competitor.threat_level,
        marketPosition: competitor.market_position,
        benchmarkMetrics
      }
      
      // Update goal with competitive context
      const contextJson = JSON.stringify({
        competitive_context: context,
        updated_at: new Date().toISOString()
      })
      await sql`
        UPDATE goals 
         SET ai_suggestions = COALESCE(ai_suggestions, '{}'): jsonb || ${contextJson}: jsonb
         WHERE id = ${goalId} AND user_id = ${userId}
      `
      
      return context
    } catch (error) {
      logError('Error adding competitive context to goal:', error)
      return null
    }
  }
  
  /**
   * Create competitive milestone tracking for goals
   */
  static async createCompetitiveMilestone(
    goalId: number,
    competitorId: number,
    milestoneData: {
      title: string
      description: string
      targetMetric: string
      competitorBenchmark: number | string
      targetValue: number | string
      dueDate?: Date
    },
    userId: string
  ): Promise<number | null> {
    try {
      const sql = getSql()
      
      // Create a task that represents the competitive milestone
      const tagsJson = JSON.stringify(['competitive-milestone', 'benchmark', `competitor-${competitorId}`])
      const aiSuggestionsJson = JSON.stringify({
        milestone_type: 'competitive_benchmark',
        competitor_id: competitorId,
        target_metric: milestoneData.targetMetric,
        competitor_benchmark: milestoneData.competitorBenchmark,
        target_value: milestoneData.targetValue,
        created_from_intelligence: true
      })
      
      const taskRows = await sql`
        INSERT INTO tasks (
          user_id, goal_id, title, description, category, priority,
          due_date, tags, ai_suggestions, status
        ) VALUES (${userId}, ${goalId}, ${milestoneData.title}, ${milestoneData.description}, ${'Competitive Milestone'}, ${'high'}, ${milestoneData.dueDate || null}, ${tagsJson}: jsonb, ${aiSuggestionsJson}: jsonb, 'pending') RETURNING id
      ` as any[]
      
      return taskRows[0]?.id || null
    } catch (error) {
      logError('Error creating competitive milestone:', error)
      return null
    }
  }
  
  /**
   * Get competitive progress tracking for a goal
   */
  static async getCompetitiveProgress(goalId: number, userId: string) {
    try {
      const sql = getSql()
      
      // Get goal with competitive context
      const goalRows = await sql`
        SELECT title, description, ai_suggestions FROM goals WHERE id = ${goalId} AND user_id = ${userId}
      ` as any[]
      
      if (goalRows.length === 0) {
        return null
      }
      
      const goal = goalRows[0] as { title: string; description: string; ai_suggestions: any }
      const competitiveContext = goal.ai_suggestions?.competitive_context
      
      if (!competitiveContext) {
        return null
      }
      
      // Get competitive milestone tasks
      const milestoneRows = await sql`
        SELECT id, title, description, status, ai_suggestions, completed_at
         FROM tasks 
         WHERE goal_id = ${goalId} AND user_id = ${userId} 
         AND category = 'Competitive Milestone'
         ORDER BY created_at ASC
      ` as any[]
      
      // Get recent competitive intelligence updates  
      // Note: We need competitor_id from competitiveContext
      const competitorId = competitiveContext.competitorId
      const recentIntelligence = await sql`
        SELECT id.data_type, id.importance, id.collected_at, cp.name as competitor_name
         FROM intelligence_data id
         JOIN competitor_profiles cp ON cp.id = id.competitor_id
         WHERE id.competitor_id = ${competitorId} AND id.user_id = ${userId}
         AND id.collected_at > NOW() - INTERVAL '30 days'
         ORDER BY id.collected_at DESC
         LIMIT 5
      ` as any[]
      
      return {
        goal,
        competitiveContext,
        milestones: milestoneRows,
        recentIntelligence
      }
    } catch (error) {
      logError('Error getting competitive progress:', error)
      return null
    }
  }
  
  /**
   * Extract benchmark metrics from intelligence data
   */
  private static extractBenchmarkMetrics(intelligenceRows: any[]): any[] {
    const metrics: any[] = []
    
    for (const row of intelligenceRows) {
      const extractedData = row.extracted_data || {}
      const analysisResults = row.analysis_results || []
      
      // Extract metrics based on data type
      switch (row.data_type) {
        case 'pricing':
          if (extractedData.pricing_tiers) {
            metrics.push({
              metric: 'Pricing Tiers',
              competitorValue: extractedData.pricing_tiers.length,
              trend: 'stable'
            })
          }
          break
          
        case 'social_media':
          if (extractedData.engagement_rate) {
            metrics.push({
              metric: 'Social Engagement Rate',
              competitorValue: `${extractedData.engagement_rate}%`,
              trend: extractedData.engagement_trend || 'stable'
            })
          }
          break
          
        case 'product_features':
          if (extractedData.feature_count) {
            metrics.push({
              metric: 'Product Features',
              competitorValue: extractedData.feature_count,
              trend: 'improving'
            })
          }
          break
          
        case 'job_postings':
          if (extractedData.open_positions) {
            metrics.push({
              metric: 'Open Positions',
              competitorValue: extractedData.open_positions,
              trend: extractedData.hiring_trend || 'stable'
            })
          }
          break
      }
      
      // Extract metrics from AI analysis results
      for (const analysis of analysisResults) {
        if (analysis.insights) {
          for (const insight of analysis.insights) {
            if (insight.metric && insight.value) {
              metrics.push({
                metric: insight.metric,
                competitorValue: insight.value,
                trend: insight.trend || 'stable'
              })
            }
          }
        }
      }
    }
    
    return metrics.slice(0, 10) // Limit to top 10 metrics
  }
}