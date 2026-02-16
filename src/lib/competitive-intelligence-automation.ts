import { logError, logInfo,} from '@/lib/logger'
import { CompetitiveIntelligenceIntegration } from './competitive-intelligence-integration'
import { notificationDelivery } from './notification-delivery-system'
import { CompetitorAlert } from '@/hooks/use-competitor-alerts'
import { getSql } from '@/lib/api-utils'


export interface AutomationRule {
  id: string
  userId: string
  name: string
  description: string
  enabled: boolean
  conditions: {
    alert_types: string[]
    threat_levels: string[]
    competitor_ids?: number[]
    severity_levels: string[]
  }
  actions: {
    create_task: boolean
    task_template_id?: string
    assign_to_goal?: number
    priority_override?: string
    notify_channels: string[]
  }
  created_at: Date
  updated_at: Date
}

export class CompetitiveIntelligenceAutomation {
  /**
   * Process new alert and trigger automation rules
   */
  static async processAlert(alertId: number, userId: string): Promise<void> {
    try {
      const sql = getSql()
      
      // Get the alert details
      const alertRows = await sql`
        SELECT ca.*, cp.threat_level, cp.name as competitor_name
        FROM competitor_alerts ca
        JOIN competitor_profiles cp ON ca.competitor_id = cp.id
        WHERE ca.id = ${alertId} AND ca.user_id = ${userId}
      `
      
      if (alertRows.length === 0) {
        logInfo(`Alert ${alertId} not found for user ${userId}`)
        return
      }
      
      const alert = alertRows[0] as any
      
      // Get automation rules for this user
      const automationRules = await this.getAutomationRules(userId)
      
      // Process each rule
      for (const rule of automationRules) {
        if (await this.shouldTriggerRule(rule, alert)) {
          await this.executeRule(rule, alert, userId)
        }
      }
    } catch (error) {
      logError('Error processing alert automation:', error)
    }
  }
  
  /**
   * Check if automation rule should be triggered for this alert
   */
  private static async shouldTriggerRule(rule: AutomationRule, alert: any): Promise<boolean> {
    if (!rule.enabled) {
      return false
    }
    
    const conditions = rule.conditions
    
    // Check alert type
    if (conditions.alert_types.length > 0 && !conditions.alert_types.includes(alert.alert_type)) {
      return false
    }
    
    // Check threat level
    if (conditions.threat_levels.length > 0 && !conditions.threat_levels.includes(alert.threat_level)) {
      return false
    }
    
    // Check competitor ID
    if (conditions.competitor_ids && conditions.competitor_ids.length > 0 && 
        !conditions.competitor_ids.includes(alert.competitor_id)) {
      return false
    }
    
    // Check severity level
    if (conditions.severity_levels.length > 0 && !conditions.severity_levels.includes(alert.severity)) {
      return false
    }
    
    return true
  }
  
  /**
   * Execute automation rule actions
   */
  private static async executeRule(rule: AutomationRule, alert: any, userId: string): Promise<void> {
    try {
      const actions = rule.actions
      
      // Create task if configured
      if (actions.create_task) {
        const taskId = await CompetitiveIntelligenceIntegration.createTaskFromAlert(alert, userId)
        
        if (taskId && actions.assign_to_goal) {
          // Assign task to specific goal
          const sql = getSql()
          await sql`
            UPDATE tasks SET goal_id = ${actions.assign_to_goal} WHERE id = ${taskId} AND user_id = ${userId}
          `
        }
        
        if (taskId && actions.priority_override) {
          // Override task priority
          const sql = getSql()
          await sql`
            UPDATE tasks SET priority = ${actions.priority_override} WHERE id = ${taskId} AND user_id = ${userId}
          `
        }
        
        logInfo(`Created task ${taskId} from alert ${alert.id} via automation rule ${rule.id}`)
      }
      
      // Send notifications if configured
      if (actions.notify_channels.length > 0) {
        await this.sendNotifications(actions.notify_channels, alert, rule, userId)
      }
    } catch (error) {
      logError(`Error executing automation rule ${rule.id}:`, error)
    }
  }
  
  /**
   * Send notifications through configured channels
   */
  private static async sendNotifications(
    channels: string[], 
    alert: any, 
    rule: AutomationRule, 
    userId: string
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await notificationDelivery.getNotificationPreferences(userId)
      
      // Filter channels based on rule configuration
      // If rule specifies channels, we only send to those ENABLED in user preferences
      const effectiveChannels = preferences.channels.filter(c => 
        c.enabled && channels.includes(c.type === 'email' ? 'email' : c.id)
      )
      
      // Create effective preferences for this specific alert
      const effectivePreferences = {
        ...preferences,
        channels: effectiveChannels,
        // Bypass quiet hours for critical automation rules if needed
        quietHours: rule.conditions.severity_levels.includes('critical') ? 
          { ...preferences.quietHours, enabled: false } : 
          preferences.quietHours
      }

      // Cast alert to CompetitorAlert
      const competitorAlert: CompetitorAlert = {
        id: alert.id,
        competitor_id: alert.competitor_id,
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        is_read: alert.is_read || false,
        created_at: alert.created_at instanceof Date ? alert.created_at.toISOString() : alert.created_at,
        competitor_name: alert.competitor_name,
        competitor_threat_level: alert.threat_level
      }
      
      await notificationDelivery.deliverNotification(competitorAlert, effectivePreferences)
      
      logInfo(`Notifications delivered for alert ${alert.id} via rule ${rule.id}`, {
        channels: effectiveChannels.map(c => c.id),
        alert_title: alert.title
      })
    } catch (error) {
      logError('Failed to deliver notifications for automation rule:', error)
    }
  }
  
  /**
   * Get automation rules for user
   */
  private static async getAutomationRules(userId: string): Promise<AutomationRule[]> {
    // Return standard V1 automation rules
    // In production, these would be stored in database and configurable by users
    return [
      {
        id: 'critical-threat-auto-task',
        userId,
        name: 'Critical Threat Auto-Task Creation',
        description: 'Automatically create high-priority tasks for critical competitive threats',
        enabled: true,
        conditions: {
          alert_types: ['pricing_change', 'product_launch', 'funding_announcement'],
          threat_levels: ['high', 'critical'],
          severity_levels: ['urgent', 'critical']
        },
        actions: {
          create_task: true,
          priority_override: 'high',
          notify_channels: ['in_app', 'email']
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'opportunity-detection-auto-task',
        userId,
        name: 'Opportunity Detection Auto-Task',
        description: 'Create tasks when competitor weaknesses or opportunities are detected',
        enabled: true,
        conditions: {
          alert_types: ['negative_news', 'service_outage', 'layoffs', 'key_departure'],
          threat_levels: ['low', 'medium', 'high', 'critical'],
          severity_levels: ['info', 'warning', 'urgent']
        },
        actions: {
          create_task: true,
          priority_override: 'medium',
          notify_channels: ['in_app']
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'market-expansion-tracking',
        userId,
        name: 'Market Expansion Tracking',
        description: 'Track competitor market expansion moves',
        enabled: true,
        conditions: {
          alert_types: ['market_expansion', 'new_geography', 'partnership_announcement'],
          threat_levels: ['medium', 'high', 'critical'],
          severity_levels: ['warning', 'urgent']
        },
        actions: {
          create_task: true,
          notify_channels: ['in_app', 'email']
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
  }
  
  /**
   * Create competitive benchmarking goals automatically
   */
  static async createBenchmarkingGoals(competitorId: number, userId: string): Promise<number[]> {
    try {
      const sql = getSql()
      
      // Get competitor information
      const competitorRows = await sql`
        SELECT name, industry, threat_level FROM competitor_profiles WHERE id = ${competitorId} AND user_id = ${userId}
      `
      
      if (competitorRows.length === 0) {
        return []
      }
      
      const competitor = competitorRows[0] as { name: string; industry: string; threat_level: string }
      const createdGoals: number[] = []
      
      // Create benchmarking goals based on competitor threat level
      const goalTemplates = this.getBenchmarkingGoalTemplates(competitor)
      
      for (const template of goalTemplates) {
        const title = template.title.replace('{competitor}', competitor.name)
        const description = template.description.replace(/{competitor}/g, competitor.name)
        const aiSuggestions = JSON.stringify({
          competitive_context: {
            competitorId,
            competitorName: competitor.name,
            threatLevel: competitor.threat_level,
            benchmarkingType: template.type,
            created_from_automation: true
          }
        })
        
        const goalRows = await sql`
          INSERT INTO goals (
            user_id, title, description, category, priority, status,
            ai_suggestions
          ) VALUES (${userId}, ${title}, ${description}, ${'Competitive Benchmarking'}, ${template.priority}, ${'active'}, ${aiSuggestions}) RETURNING id
        `
        
        const goalRow = goalRows[0] as { id: number } | undefined
        if (goalRow?.id) {
          createdGoals.push(goalRow.id)
          
          // Create initial milestones for the goal
          await this.createInitialMilestones(goalRow.id, competitorId, template.type, userId)
        }
      }
      
      return createdGoals
    } catch (error) {
      logError('Error creating benchmarking goals:', error)
      return []
    }
  }
  
  /**
   * Get benchmarking goal templates based on competitor
   */
  private static getBenchmarkingGoalTemplates(competitor: any) {
    const templates = [
      {
        type: 'market_share',
        title: 'Outperform {competitor} in Market Share',
        description: 'Develop strategies to gain market share against {competitor}. Focus on their weaknesses and our competitive advantages.',
        priority: competitor.threat_level === 'critical' ? 'high' : 'medium'
      },
      {
        type: 'product_features',
        title: 'Feature Parity and Innovation vs {competitor}',
        description: 'Maintain feature parity with {competitor} while developing innovative differentiators.',
        priority: 'medium'
      },
      {
        type: 'customer_satisfaction',
        title: 'Exceed {competitor} Customer Satisfaction',
        description: 'Achieve higher customer satisfaction scores than {competitor} through superior service and product quality.',
        priority: 'medium'
      }
    ]
    
    // Add high-priority goals for critical threats
    if (competitor.threat_level === 'critical') {
      templates.push({
        type: 'defensive_strategy',
        title: 'Defensive Strategy Against {competitor}',
        description: 'Implement defensive measures to protect market position against {competitor}\'s aggressive expansion.',
        priority: 'high'
      })
    }
    
    return templates
  }
  
  /**
   * Create initial milestones for benchmarking goals
   */
  private static async createInitialMilestones(
    goalId: number, 
    competitorId: number, 
    benchmarkType: string, 
    userId: string
  ): Promise<void> {
    const milestoneTemplates = {
      market_share: [
        {
          title: 'Analyze Current Market Position',
          description: 'Conduct comprehensive analysis of current market share vs competitor',
          targetMetric: 'Market Share Analysis',
          competitorBenchmark: 'TBD',
          targetValue: 'Complete Analysis'
        }
      ],
      product_features: [
        {
          title: 'Feature Gap Analysis',
          description: 'Identify feature gaps compared to competitor product',
          targetMetric: 'Feature Parity Score',
          competitorBenchmark: '100%',
          targetValue: '110%'
        }
      ],
      customer_satisfaction: [
        {
          title: 'Customer Satisfaction Benchmark',
          description: 'Establish baseline customer satisfaction metrics vs competitor',
          targetMetric: 'Customer Satisfaction Score',
          competitorBenchmark: 'TBD',
          targetValue: '+10% above competitor'
        }
      ]
    }
    
    const milestones = milestoneTemplates[benchmarkType as keyof typeof milestoneTemplates] || []
    
    for (const milestone of milestones) {
      await CompetitiveIntelligenceIntegration.createCompetitiveMilestone(
        goalId,
        competitorId,
        milestone,
        userId
      )
    }
  }
}
