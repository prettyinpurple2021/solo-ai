import { db } from '@/db';
import { competitorAlerts, competitorProfiles, intelligenceData } from '@/db/schema';
import { eq, and, desc, gte, lte, inArray, sql } from 'drizzle-orm';

export interface AlertTrigger {
  id: string;
  name: string;
  description: string;
  conditions: AlertCondition[];
  severity: AlertSeverity;
  cooldownMinutes: number;
  isActive: boolean;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'changed' | 'matches_pattern';
  value: any;
  weight: number;
}

export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'critical';
export type AlertType = 
  | 'pricing_change' 
  | 'product_launch' 
  | 'funding_announcement' 
  | 'key_hire' 
  | 'negative_news' 
  | 'website_change' 
  | 'social_activity' 
  | 'job_posting'
  | 'partnership'
  | 'acquisition'
  | 'market_expansion';

export interface AlertGenerationResult {
  alertsGenerated: number;
  alertsDeduped: number;
  errors: string[];
}

export class CompetitorAlertSystem {
  private static instance: CompetitorAlertSystem;
  private alertTriggers: Map<AlertType, AlertTrigger[]> = new Map();
  private recentAlerts: Map<string, Date> = new Map();

  static getInstance(): CompetitorAlertSystem {
    if (!CompetitorAlertSystem.instance) {
      CompetitorAlertSystem.instance = new CompetitorAlertSystem();
    }
    return CompetitorAlertSystem.instance;
  }

  constructor() {
    this.initializeDefaultTriggers();
  }

  private initializeDefaultTriggers() {
    // Pricing change alerts
    this.addTrigger('pricing_change', {
      id: 'pricing-change-critical',
      name: 'Critical Pricing Changes',
      description: 'Significant pricing changes that require immediate attention',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'pricing', weight: 1.0 },
        { field: 'change_percentage', operator: 'greater_than', value: 20, weight: 0.8 },
      ],
      severity: 'critical',
      cooldownMinutes: 60,
      isActive: true,
    });

    // Product launch alerts
    this.addTrigger('product_launch', {
      id: 'product-launch-urgent',
      name: 'New Product Launches',
      description: 'Competitor launches new products or features',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'product', weight: 1.0 },
        { field: 'content', operator: 'contains', value: 'launch|release|announce', weight: 0.9 },
      ],
      severity: 'urgent',
      cooldownMinutes: 30,
      isActive: true,
    });

    // Key hiring alerts
    this.addTrigger('key_hire', {
      id: 'key-hire-warning',
      name: 'Strategic Hiring',
      description: 'Competitor hires key personnel in strategic roles',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'job_posting', weight: 1.0 },
        { field: 'role_level', operator: 'equals', value: 'executive', weight: 0.9 },
      ],
      severity: 'warning',
      cooldownMinutes: 120,
      isActive: true,
    });

    // Funding alerts
    this.addTrigger('funding_announcement', {
      id: 'funding-critical',
      name: 'Funding Announcements',
      description: 'Competitor receives significant funding',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'news', weight: 1.0 },
        { field: 'content', operator: 'contains', value: 'funding|investment|raised', weight: 0.8 },
        { field: 'funding_amount', operator: 'greater_than', value: 1000000, weight: 0.9 },
      ],
      severity: 'critical',
      cooldownMinutes: 60,
      isActive: true,
    });

    // Website change alerts
    this.addTrigger('website_change', {
      id: 'website-change-info',
      name: 'Website Updates',
      description: 'Significant changes to competitor websites',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'website', weight: 1.0 },
        { field: 'change_significance', operator: 'greater_than', value: 0.3, weight: 0.7 },
      ],
      severity: 'info',
      cooldownMinutes: 240,
      isActive: true,
    });
  }

  private addTrigger(type: AlertType, trigger: AlertTrigger) {
    if (!this.alertTriggers.has(type)) {
      this.alertTriggers.set(type, []);
    }
    this.alertTriggers.get(type)!.push(trigger);
  }

  async processIntelligenceForAlerts(intelligenceId: number): Promise<AlertGenerationResult> {
    const result: AlertGenerationResult = {
      alertsGenerated: 0,
      alertsDeduped: 0,
      errors: [],
    };

    try {
      // Get intelligence data
      const intelligence = await db
        .select()
        .from(intelligenceData)
        .where(eq(intelligenceData.id, intelligenceId))
        .limit(1);

      if (intelligence.length === 0) {
        result.errors.push(`Intelligence data not found: ${intelligenceId}`);
        return result;
      }

      const intel = intelligence[0];
      
      // Get competitor profile for threat level context
      const competitor = await db
        .select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, intel.competitor_id))
        .limit(1);

      if (competitor.length === 0) {
        result.errors.push(`Competitor not found: ${intel.competitor_id}`);
        return result;
      }

      const comp = competitor[0];

      // Process each alert type
      for (const [alertType, triggers] of this.alertTriggers) {
        for (const trigger of triggers) {
          if (!trigger.isActive) continue;

          const shouldTrigger = await this.evaluateTrigger(trigger, intel, comp);
          if (shouldTrigger) {
            const isDuplicate = await this.checkForDuplicateAlert(
              intel.user_id,
              intel.competitor_id,
              alertType,
              trigger.cooldownMinutes
            );

            if (isDuplicate) {
              result.alertsDeduped++;
              continue;
            }

            await this.generateAlert(intel, comp, alertType, trigger);
            result.alertsGenerated++;
          }
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Error processing intelligence ${intelligenceId}: ${error}`);
      return result;
    }
  }

  private async evaluateTrigger(
    trigger: AlertTrigger,
    intelligence: any,
    competitor: any
  ): Promise<boolean> {
    let totalScore = 0;
    let maxScore = 0;

    for (const condition of trigger.conditions) {
      maxScore += condition.weight;
      
      const fieldValue = this.getFieldValue(condition.field, intelligence, competitor);
      const conditionMet = this.evaluateCondition(condition, fieldValue);
      
      if (conditionMet) {
        totalScore += condition.weight;
      }
    }

    // Require at least 70% of conditions to be met
    const threshold = maxScore * 0.7;
    return totalScore >= threshold;
  }

  private getFieldValue(field: string, intelligence: any, competitor: any): any {
    // Handle nested field access
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = intelligence;
      
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return null;
        }
      }
      
      return value;
    }

    // Direct field access
    if (intelligence.hasOwnProperty(field)) {
      return intelligence[field];
    }
    
    if (competitor.hasOwnProperty(field)) {
      return competitor[field];
    }

    // Check extracted data
    if (intelligence.extracted_data && intelligence.extracted_data[field]) {
      return intelligence.extracted_data[field];
    }

    return null;
  }

  private evaluateCondition(condition: AlertCondition, fieldValue: any): boolean {
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      
      case 'contains':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          const regex = new RegExp(condition.value, 'i');
          return regex.test(fieldValue);
        }
        return false;
      
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      
      case 'changed':
        // This would require historical comparison - simplified for now
        return true;
      
      case 'matches_pattern':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          const regex = new RegExp(condition.value, 'i');
          return regex.test(fieldValue);
        }
        return false;
      
      default:
        return false;
    }
  }

  private async checkForDuplicateAlert(
    userId: string,
    competitorId: number,
    alertType: AlertType,
    cooldownMinutes: number
  ): Promise<boolean> {
    const cooldownTime = new Date(Date.now() - cooldownMinutes * 60 * 1000);
    
    const recentAlert = await db
      .select()
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.user_id, userId),
          eq(competitorAlerts.competitor_id, competitorId),
          eq(competitorAlerts.alert_type, alertType),
          gte(competitorAlerts.created_at, cooldownTime)
        )
      )
      .limit(1);

    return recentAlert.length > 0;
  }

  private async generateAlert(
    intelligence: any,
    competitor: any,
    alertType: AlertType,
    trigger: AlertTrigger
  ): Promise<void> {
    const alertData = {
      competitor_id: intelligence.competitor_id,
      user_id: intelligence.user_id,
      intelligence_id: intelligence.id,
      alert_type: alertType,
      severity: trigger.severity,
      title: this.generateAlertTitle(alertType, competitor.name, intelligence),
      description: this.generateAlertDescription(alertType, intelligence, trigger),
      source_data: {
        intelligence_id: intelligence.id,
        trigger_id: trigger.id,
        confidence: intelligence.confidence,
        source_url: intelligence.source_url,
      },
      action_items: this.generateActionItems(alertType, intelligence, competitor),
      recommended_actions: this.generateRecommendedActions(alertType, intelligence, competitor),
    };

    await db.insert(competitorAlerts).values(alertData);
  }

  private generateAlertTitle(alertType: AlertType, competitorName: string, intelligence: any): string {
    const titles: Record<AlertType, string> = {
      pricing_change: `${competitorName} Changed Pricing`,
      product_launch: `${competitorName} Launched New Product`,
      funding_announcement: `${competitorName} Received Funding`,
      key_hire: `${competitorName} Made Strategic Hire`,
      negative_news: `Negative News About ${competitorName}`,
      website_change: `${competitorName} Updated Website`,
      social_activity: `${competitorName} Social Media Activity`,
      job_posting: `${competitorName} Posted New Jobs`,
      partnership: `${competitorName} Announced Partnership`,
      acquisition: `${competitorName} Acquisition News`,
      market_expansion: `${competitorName} Expanding Market`,
    };

    return titles[alertType] || `${competitorName} Activity Detected`;
  }

  private generateAlertDescription(alertType: AlertType, intelligence: any, trigger: AlertTrigger): string {
    const extractedData = intelligence.extracted_data || {};
    const content = extractedData.content || intelligence.raw_content || '';
    
    // Truncate content for description
    const truncatedContent = typeof content === 'string' 
      ? content.substring(0, 200) + (content.length > 200 ? '...' : '')
      : 'Intelligence data detected';

    return `${trigger.description}\n\nDetails: ${truncatedContent}`;
  }

  private generateActionItems(alertType: AlertType, intelligence: any, competitor: any): any[] {
    const baseActions = [
      {
        id: `review-${Date.now()}`,
        title: 'Review Intelligence Data',
        description: 'Analyze the collected intelligence for strategic implications',
        priority: 'medium',
        estimatedEffort: '15 minutes',
        potentialImpact: 'medium',
      },
    ];

    const typeSpecificActions: Record<AlertType, any[]> = {
      pricing_change: [
        {
          id: `pricing-analysis-${Date.now()}`,
          title: 'Analyze Pricing Impact',
          description: 'Evaluate how competitor pricing changes affect our positioning',
          priority: 'high',
          estimatedEffort: '30 minutes',
          potentialImpact: 'high',
        },
      ],
      product_launch: [
        {
          id: `product-comparison-${Date.now()}`,
          title: 'Compare Product Features',
          description: 'Analyze new product features against our offerings',
          priority: 'high',
          estimatedEffort: '45 minutes',
          potentialImpact: 'high',
        },
      ],
      funding_announcement: [
        {
          id: `funding-strategy-${Date.now()}`,
          title: 'Assess Competitive Threat',
          description: 'Evaluate increased competitive threat from new funding',
          priority: 'high',
          estimatedEffort: '60 minutes',
          potentialImpact: 'critical',
        },
      ],
      key_hire: [
        {
          id: `talent-strategy-${Date.now()}`,
          title: 'Review Talent Strategy',
          description: 'Consider talent acquisition in response to competitor hiring',
          priority: 'medium',
          estimatedEffort: '30 minutes',
          potentialImpact: 'medium',
        },
      ],
      negative_news: [
        {
          id: `opportunity-assessment-${Date.now()}`,
          title: 'Identify Market Opportunities',
          description: 'Assess opportunities arising from competitor challenges',
          priority: 'high',
          estimatedEffort: '45 minutes',
          potentialImpact: 'high',
        },
      ],
      website_change: baseActions,
      social_activity: baseActions,
      job_posting: baseActions,
      partnership: baseActions,
      acquisition: baseActions,
      market_expansion: baseActions,
    };

    return [...baseActions, ...(typeSpecificActions[alertType] || [])];
  }

  private generateRecommendedActions(alertType: AlertType, intelligence: any, competitor: any): string[] {
    const baseRecommendations = [
      'Monitor competitor response and market reaction',
      'Update competitive analysis documentation',
      'Share intelligence with relevant team members',
    ];

    const typeSpecificRecommendations: Record<AlertType, string[]> = {
      pricing_change: [
        'Consider adjusting pricing strategy',
        'Analyze customer price sensitivity',
        'Evaluate value proposition positioning',
      ],
      product_launch: [
        'Accelerate competing feature development',
        'Update product roadmap priorities',
        'Prepare competitive response messaging',
      ],
      funding_announcement: [
        'Increase market monitoring frequency',
        'Prepare for increased competitive pressure',
        'Consider strategic partnerships or funding',
      ],
      key_hire: [
        'Review talent retention strategies',
        'Identify potential talent acquisition targets',
        'Strengthen team in competing areas',
      ],
      negative_news: [
        'Capitalize on market opportunity',
        'Increase marketing and sales efforts',
        'Prepare messaging highlighting advantages',
      ],
      website_change: [
        'Analyze UX/UI improvements',
        'Consider similar website enhancements',
      ],
      social_activity: [
        'Monitor engagement patterns',
        'Adjust social media strategy',
      ],
      job_posting: [
        'Analyze hiring patterns for strategic insights',
        'Consider talent acquisition in similar roles',
      ],
      partnership: [
        'Evaluate partnership opportunities',
        'Assess impact on market positioning',
      ],
      acquisition: [
        'Analyze strategic implications',
        'Consider defensive or offensive moves',
      ],
      market_expansion: [
        'Evaluate market entry opportunities',
        'Prepare competitive response strategy',
      ],
    };

    return [...baseRecommendations, ...(typeSpecificRecommendations[alertType] || [])];
  }

  async getActiveAlerts(userId: string, limit: number = 50): Promise<any[]> {
    return await db
      .select({
        id: competitorAlerts.id,
        competitor_id: competitorAlerts.competitor_id,
        alert_type: competitorAlerts.alert_type,
        severity: competitorAlerts.severity,
        title: competitorAlerts.title,
        description: competitorAlerts.description,
        is_read: competitorAlerts.is_read,
        created_at: competitorAlerts.created_at,
        competitor_name: competitorProfiles.name,
        competitor_threat_level: competitorProfiles.threat_level,
      })
      .from(competitorAlerts)
      .leftJoin(competitorProfiles, eq(competitorAlerts.competitor_id, competitorProfiles.id))
      .where(
        and(
          eq(competitorAlerts.user_id, userId),
          eq(competitorAlerts.is_archived, false)
        )
      )
      .orderBy(desc(competitorAlerts.created_at))
      .limit(limit);
  }

  async markAlertAsRead(alertId: number, userId: string): Promise<void> {
    await db
      .update(competitorAlerts)
      .set({ 
        is_read: true,
        acknowledged_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(competitorAlerts.id, alertId),
          eq(competitorAlerts.user_id, userId)
        )
      );
  }

  async archiveAlert(alertId: number, userId: string): Promise<void> {
    await db
      .update(competitorAlerts)
      .set({ 
        is_archived: true,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(competitorAlerts.id, alertId),
          eq(competitorAlerts.user_id, userId)
        )
      );
  }

  async getAlertsByCompetitor(userId: string, competitorId: number, limit: number = 20): Promise<any[]> {
    return await db
      .select()
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.user_id, userId),
          eq(competitorAlerts.competitor_id, competitorId),
          eq(competitorAlerts.is_archived, false)
        )
      )
      .orderBy(desc(competitorAlerts.created_at))
      .limit(limit);
  }

  async getAlertStats(userId: string): Promise<{
    total: number;
    unread: number;
    critical: number;
    urgent: number;
    byType: Record<string, number>;
  }> {
    const alerts = await db
      .select({
        severity: competitorAlerts.severity,
        alert_type: competitorAlerts.alert_type,
        is_read: competitorAlerts.is_read,
      })
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.user_id, userId),
          eq(competitorAlerts.is_archived, false)
        )
      );

    const stats = {
      total: alerts.length,
      unread: alerts.filter(a => !a.is_read).length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      urgent: alerts.filter(a => a.severity === 'urgent').length,
      byType: {} as Record<string, number>,
    };

    // Count by type
    alerts.forEach(alert => {
      stats.byType[alert.alert_type] = (stats.byType[alert.alert_type] || 0) + 1;
    });

    return stats;
  }
}

export const alertSystem = CompetitorAlertSystem.getInstance();