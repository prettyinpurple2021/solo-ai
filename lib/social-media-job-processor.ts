import { socialMediaScheduler } from './social-media-scheduler';
import { socialMediaMonitor } from './social-media-monitor';
import { socialMediaAnalysisEngine } from './social-media-analysis-engine';
import { db } from '@/db';
import { competitorProfiles, competitorAlerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Social Media Job Processor
 * Handles background processing of social media monitoring jobs
 */
export class SocialMediaJobProcessor {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the job processor with specified interval
   */
  start(intervalMinutes: number = 15): void {
    if (this.processingInterval) {
      console.log('Social media job processor is already running');
      return;
    }

    console.log(`Starting social media job processor with ${intervalMinutes} minute intervals`);
    
    // Process immediately on start
    this.processJobs();
    
    // Set up recurring processing
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the job processor
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Social media job processor stopped');
    }
  }

  /**
   * Process all pending social media jobs
   */
  async processJobs(): Promise<void> {
    if (this.isProcessing) {
      console.log('Social media job processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    
    try {
      console.log('Starting social media job processing cycle');
      
      // Process pending monitoring jobs
      await socialMediaScheduler.processPendingJobs();
      
      // Run analysis on recently collected data
      await this.runAnalysisJobs();
      
      // Generate alerts for significant findings
      await this.generateAlerts();
      
      // Clean up old data
      await this.cleanupOldData();
      
      console.log('Social media job processing cycle completed');
      
    } catch (error) {
      console.error('Error during social media job processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Run analysis jobs on recently collected social media data
   */
  private async runAnalysisJobs(): Promise<void> {
    try {
      // Get all active competitors with recent social media data
      const activeCompetitors = await db
        .select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.monitoring_status, 'active'));

      console.log(`Running analysis for ${activeCompetitors.length} active competitors`);

      for (const competitor of activeCompetitors) {
        try {
          await this.runCompetitorAnalysis(competitor);
        } catch (error) {
          console.error(`Error analyzing competitor ${competitor.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error running analysis jobs:', error);
    }
  }

  /**
   * Run comprehensive analysis for a single competitor
   */
  private async runCompetitorAnalysis(competitor: any): Promise<void> {
    const competitorId = competitor.id;
    
    try {
      // Run engagement pattern analysis (last 7 days)
      const engagementAnalysis = await socialMediaAnalysisEngine.analyzeEngagementPatterns(
        competitorId,
        undefined, // All platforms
        7
      );

      // Run posting frequency analysis (last 30 days)
      const frequencyAnalysis = await socialMediaAnalysisEngine.analyzePostingFrequency(
        competitorId,
        undefined,
        30
      );

      // Run audience analysis (last 30 days)
      const audienceAnalysis = await socialMediaAnalysisEngine.analyzeAudience(
        competitorId,
        undefined,
        30
      );

      // Store analysis results and generate insights
      await this.processAnalysisResults(competitor, {
        engagement: engagementAnalysis,
        frequency: frequencyAnalysis,
        audience: audienceAnalysis
      });

    } catch (error) {
      console.error(`Error in competitor analysis for ${competitorId}:`, error);
    }
  }

  /**
   * Process analysis results and generate actionable insights
   */
  private async processAnalysisResults(competitor: any, analyses: any): Promise<void> {
    const insights = this.generateInsights(analyses);
    const alerts = this.identifyAlertableEvents(competitor, analyses, insights);

    // Create alerts for significant findings
    for (const alert of alerts) {
      await this.createAlert(competitor, alert);
    }

    // Update competitor's last analyzed timestamp
    await db
      .update(competitorProfiles)
      .set({ 
        last_analyzed: new Date(),
        updated_at: new Date()
      })
      .where(eq(competitorProfiles.id, competitor.id));
  }

  /**
   * Generate insights from analysis results
   */
  private generateInsights(analyses: any): any {
    const insights = {
      engagement_trends: [],
      content_opportunities: [],
      timing_insights: [],
      audience_changes: [],
      competitive_advantages: [],
      risk_factors: []
    };

    // Process engagement analysis
    if (analyses.engagement && analyses.engagement.length > 0) {
      analyses.engagement.forEach((analysis: any) => {
        // Identify high-performing content patterns
        if (analysis.patterns.contentType.length > 0) {
          const topContent = analysis.patterns.contentType[0];
          insights.content_opportunities.push({
            platform: analysis.platform,
            type: 'content_type',
            recommendation: `${topContent.type} content shows highest engagement`,
            impact: 'medium',
            data: topContent
          });
        }

        // Identify optimal timing patterns
        if (analysis.patterns.timeOfDay.length > 0) {
          const bestTime = analysis.patterns.timeOfDay[0];
          insights.timing_insights.push({
            platform: analysis.platform,
            type: 'optimal_timing',
            recommendation: `Peak engagement at ${bestTime.hour}:00`,
            impact: 'high',
            data: bestTime
          });
        }
      });
    }

    // Process frequency analysis
    if (analyses.frequency && analyses.frequency.length > 0) {
      analyses.frequency.forEach((analysis: any) => {
        // Identify consistency issues
        if (analysis.consistency.score < 70) {
          insights.risk_factors.push({
            platform: analysis.platform,
            type: 'inconsistent_posting',
            description: `Low posting consistency (${analysis.consistency.score}%)`,
            severity: 'medium',
            data: analysis.consistency
          });
        }

        // Identify posting frequency trends
        if (analysis.frequency.daily.trend === 'increasing') {
          insights.engagement_trends.push({
            platform: analysis.platform,
            type: 'increasing_activity',
            description: 'Posting frequency is increasing',
            impact: 'positive',
            data: analysis.frequency.daily
          });
        }
      });
    }

    // Process audience analysis
    if (analyses.audience && analyses.audience.length > 0) {
      analyses.audience.forEach((analysis: any) => {
        // Identify engagement trends
        if (analysis.engagement.engagementTrend === 'growing') {
          insights.competitive_advantages.push({
            platform: analysis.platform,
            type: 'growing_engagement',
            description: 'Audience engagement is growing',
            impact: 'high',
            data: analysis.engagement
          });
        } else if (analysis.engagement.engagementTrend === 'declining') {
          insights.risk_factors.push({
            platform: analysis.platform,
            type: 'declining_engagement',
            description: 'Audience engagement is declining',
            severity: 'high',
            data: analysis.engagement
          });
        }
      });
    }

    return insights;
  }

  /**
   * Identify events that should trigger alerts
   */
  private identifyAlertableEvents(competitor: any, analyses: any, insights: any): any[] {
    const alerts = [];

    // High-impact insights become alerts
    insights.competitive_advantages.forEach((advantage: any) => {
      if (advantage.impact === 'high') {
        alerts.push({
          type: 'competitive_advantage',
          severity: 'info',
          title: `${competitor.name} gaining competitive advantage`,
          description: `${advantage.description} on ${advantage.platform}`,
          data: advantage,
          actionItems: [
            'Analyze their content strategy',
            'Consider counter-positioning',
            'Monitor for campaign launches'
          ]
        });
      }
    });

    // Risk factors become warning alerts
    insights.risk_factors.forEach((risk: any) => {
      if (risk.severity === 'high') {
        alerts.push({
          type: 'competitive_opportunity',
          severity: 'warning',
          title: `Opportunity detected: ${competitor.name} showing weakness`,
          description: `${risk.description} on ${risk.platform}`,
          data: risk,
          actionItems: [
            'Capitalize on their weakness',
            'Increase activity on this platform',
            'Target their audience with better content'
          ]
        });
      }
    });

    // Content opportunities become actionable alerts
    insights.content_opportunities.forEach((opportunity: any) => {
      if (opportunity.impact === 'high' || opportunity.impact === 'medium') {
        alerts.push({
          type: 'content_insight',
          severity: 'info',
          title: `Content strategy insight for ${competitor.name}`,
          description: opportunity.recommendation,
          data: opportunity,
          actionItems: [
            'Analyze their content approach',
            'Adapt successful elements',
            'Create differentiated content'
          ]
        });
      }
    });

    return alerts;
  }

  /**
   * Create an alert in the database
   */
  private async createAlert(competitor: any, alertData: any): Promise<void> {
    try {
      await db.insert(competitorAlerts).values({
        competitor_id: competitor.id,
        user_id: competitor.user_id,
        alert_type: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        description: alertData.description,
        source_data: alertData.data,
        action_items: alertData.actionItems,
        recommended_actions: alertData.actionItems.map((item: string) => ({
          action: item,
          priority: 'medium',
          estimated_effort: '1-2 hours'
        })),
        is_read: false,
        is_archived: false
      });

      console.log(`Created alert for competitor ${competitor.id}: ${alertData.title}`);

    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  /**
   * Generate alerts for significant social media findings
   */
  private async generateAlerts(): Promise<void> {
    try {
      // This method processes the insights generated during analysis
      // and creates alerts for significant competitive intelligence
      
      console.log('Alert generation completed during analysis processing');
      
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }

  /**
   * Clean up old social media data and job results
   */
  private async cleanupOldData(): Promise<void> {
    try {
      // Clean up old scraping job results (keep last 30 days)
      await socialMediaScheduler.cleanupOldResults(30);
      
      console.log('Old social media data cleanup completed');
      
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  /**
   * Get processing status and statistics
   */
  getStatus(): any {
    return {
      is_running: this.processingInterval !== null,
      is_processing: this.isProcessing,
      interval_minutes: this.processingInterval ? 15 : 0, // Default interval
      last_processed: new Date().toISOString()
    };
  }

  /**
   * Process jobs manually (for testing or immediate execution)
   */
  async processJobsManually(): Promise<void> {
    console.log('Manual social media job processing triggered');
    await this.processJobs();
  }

  /**
   * Run analysis for a specific competitor manually
   */
  async analyzeCompetitorManually(competitorId: number): Promise<any> {
    try {
      const [competitor] = await db
        .select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorId))
        .limit(1);

      if (!competitor) {
        throw new Error(`Competitor ${competitorId} not found`);
      }

      console.log(`Manual analysis triggered for competitor ${competitorId}`);
      await this.runCompetitorAnalysis(competitor);
      
      return {
        success: true,
        competitor_id: competitorId,
        analyzed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error in manual competitor analysis:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const socialMediaJobProcessor = new SocialMediaJobProcessor();