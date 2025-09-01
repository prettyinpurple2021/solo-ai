import { createClient } from '@/lib/db'
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
      const client = await createClient()
      
      // Find matching task template
      const template = COMPETITIVE_TASK_TEMPLATES.find(t => 
        t.alertTypes.includes(alert.alert_type)
      )
      
      if (!template) {
        console.log(`No task template found for alert type: ${alert.alert_type}`)
        return null
      }
      
      // Get competitor name for template substitution
      const { rows: competitorRows } = await client.query(
        'SELECT name FROM competitor_profiles WHERE id = $1',
        [alert.competitor_id]
      )
      
      const competitorName = competitorRows[0]?.name || 'Unknown Competitor'
      
      // Create task with template
      const taskTitle = template.taskTemplate.title.replace('{competitor}', competitorName)
      const taskDescription = template.taskTemplate.description.replace(/{competitor}/g, competitorName)
      
      const { rows: taskRows } = await client.query(
        `INSERT INTO tasks (
          user_id, title, description, category, priority, 
          estimated_minutes, tags, ai_suggestions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING id`,
        [
          userId,
          taskTitle,
          taskDescription,
          template.taskTemplate.category,
          template.taskTemplate.priority,
          template.estimatedMinutes,
          JSON.stringify([...template.taskTemplate.tags, `alert-${alert.id}`]),
          JSON.stringify({
            source: 'competitive_intelligence',
            alert_id: alert.id,
            competitor_id: alert.competitor_id,
            template_id: template.id,
            created_from_alert: true
          })
        ]
      )
      
      return taskRows[0]?.id || null
    } catch (error) {
      console.error('Error creating task from alert:', error)
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
      const client = await createClient()
      
      // Get competitor information
      const { rows: competitorRows } = await client.query(
        'SELECT name, threat_level, market_position FROM competitor_profiles WHERE id = $1 AND user_id = $2',
        [competitorId, userId]
      )
      
      if (competitorRows.length === 0) {
        return null
      }
      
      const competitor = competitorRows[0]
      
      // Get recent intelligence for benchmarking
      const { rows: intelligenceRows } = await client.query(
        `SELECT data_type, extracted_data, analysis_results 
         FROM intelligence_data 
         WHERE competitor_id = $1 AND user_id = $2 
         AND importance IN ('high', 'critical')
         ORDER BY collected_at DESC 
         LIMIT 10`,
        [competitorId, userId]
      )
      
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
      await client.query(
        `UPDATE goals 
         SET ai_suggestions = COALESCE(ai_suggestions, '{}')::jsonb || $1::jsonb
         WHERE id = $2 AND user_id = $3`,
        [
          JSON.stringify({
            competitive_context: context,
            updated_at: new Date().toISOString()
          }),
          goalId,
          userId
        ]
      )
      
      return context
    } catch (error) {
      console.error('Error adding competitive context to goal:', error)
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
      const client = await createClient()
      
      // Create a task that represents the competitive milestone
      const { rows: taskRows } = await client.query(
        `INSERT INTO tasks (
          user_id, goal_id, title, description, category, priority,
          due_date, tags, ai_suggestions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING id`,
        [
          userId,
          goalId,
          milestoneData.title,
          milestoneData.description,
          'Competitive Milestone',
          'high',
          milestoneData.dueDate,
          JSON.stringify(['competitive-milestone', 'benchmark', `competitor-${competitorId}`]),
          JSON.stringify({
            milestone_type: 'competitive_benchmark',
            competitor_id: competitorId,
            target_metric: milestoneData.targetMetric,
            competitor_benchmark: milestoneData.competitorBenchmark,
            target_value: milestoneData.targetValue,
            created_from_intelligence: true
          })
        ]
      )
      
      return taskRows[0]?.id || null
    } catch (error) {
      console.error('Error creating competitive milestone:', error)
      return null
    }
  }
  
  /**
   * Get competitive progress tracking for a goal
   */
  static async getCompetitiveProgress(goalId: number, userId: string) {
    try {
      const client = await createClient()
      
      // Get goal with competitive context
      const { rows: goalRows } = await client.query(
        'SELECT title, description, ai_suggestions FROM goals WHERE id = $1 AND user_id = $2',
        [goalId, userId]
      )
      
      if (goalRows.length === 0) {
        return null
      }
      
      const goal = goalRows[0]
      const competitiveContext = goal.ai_suggestions?.competitive_context
      
      if (!competitiveContext) {
        return null
      }
      
      // Get competitive milestone tasks
      const { rows: milestoneRows } = await client.query(
        `SELECT id, title, description, status, ai_suggestions, completed_at
         FROM tasks 
         WHERE goal_id = $1 AND user_id = $2 
         AND category = 'Competitive Milestone'
         ORDER BY created_at ASC`,
        [goalId, userId]
      )
      
      // Get recent competitive intelligence updates
      const { rows: recentIntelligence } = await client.query(
        `SELECT id.data_type, id.importance, id.collected_at, cp.name as competitor_name
         FROM intelligence_data id
         JOIN competitor_profiles cp ON cp.id = id.competitor_id
         WHERE id.competitor_id = $1 AND id.user_id = $2
         AND id.collected_at > NOW() - INTERVAL '30 days'
         ORDER BY id.collected_at DESC
         LIMIT 5`,
        [competitiveContext.competitorId, userId]
      )
      
      return {
        goal,
        competitiveContext,
        milestones: milestoneRows,
        recentIntelligence
      }
    } catch (error) {
      console.error('Error getting competitive progress:', error)
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