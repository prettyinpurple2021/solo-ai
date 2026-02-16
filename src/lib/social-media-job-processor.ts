import { logError, logInfo,} from '@/lib/logger'
import { socialMediaScheduler } from './social-media-scheduler';
// import { socialMediaMonitor } from './social-media-monitor';
import { 
  socialMediaAnalysisEngine, 
  EngagementPatternAnalysis, 
  PostingFrequencyAnalysis, 
  AudienceAnalysis 
} from './social-media-analysis-engine';
import { db } from '@/db';
import { competitorProfiles, competitorAlerts } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { CompetitorProfile } from '@/types/api';

interface AnalysisCollection {
  engagement: EngagementPatternAnalysis[];
  frequency: PostingFrequencyAnalysis[];
  audience: AudienceAnalysis[];
}

interface Insight {
  platform: string;
  type: string;
  recommendation?: string;
  description?: string;
  impact?: 'high' | 'medium' | 'low' | 'positive';
  severity?: 'high' | 'medium' | 'low' | 'info' | 'warning';
  data: unknown;
}

interface InsightsCollection {
  engagement_trends: Insight[];
  content_opportunities: Insight[];
  timing_insights: Insight[];
  audience_changes: Insight[];
  competitive_advantages: Insight[];
  risk_factors: Insight[];
}

interface ProcessorStatus {
  is_running: boolean;
  is_processing: boolean;
  interval_minutes: number;
  last_processed: string;
}

interface AlertableEvent {
    type: string;
    severity: 'info' | 'warning' | 'error';
    title: string;
    description: string;
    data: unknown;
    actionItems: string[];
}

/**
 * Social Media Job Processor
 * Handles background processing of social media monitoring jobs
 */
export class SocialMediaJobProcessor {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private idleCyclesWithoutWork = 0;
  private readonly IDLE_STOP_CYCLES = 8; // stop after ~2 hours at 15m intervals

  /**
   * Start the job processor with specified interval
   */
  start(intervalMinutes: number = 15): void {
    if (this.processingInterval) {
      logInfo('Social media job processor is already running');
      return;
    }

    logInfo(`Starting social media job processor with ${intervalMinutes} minute intervals`);
    
    // Process immediately on start
    this.processJobs();
    
    // Set up recurring processing
    this.processingInterval = setInterval(async () => {
      const processed = await this.processJobs();
      if (processed === 0) {
        this.idleCyclesWithoutWork += 1;
        if (this.idleCyclesWithoutWork >= this.IDLE_STOP_CYCLES) {
          logInfo('No social jobs for a while; stopping processor to save resources');
          this.stop();
          this.idleCyclesWithoutWork = 0;
        }
      } else {
        this.idleCyclesWithoutWork = 0;
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the job processor
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      logInfo('Social media job processor stopped');
    }
  }

  /**
   * Process all pending social media jobs
   */
  async processJobs(): Promise<number> {
    if (this.isProcessing) {
      logInfo('Social media job processing already in progress, skipping...');
      return 0;
    }

    this.isProcessing = true;
    
    try {
      logInfo('Starting social media job processing cycle');
      
      // Process pending monitoring jobs
      const before = Date.now();
      await socialMediaScheduler.processPendingJobs();
      
      // Run analysis on recently collected data
      await this.runAnalysisJobs();
      
      // Generate alerts for significant findings
      await this.generateAlerts();
      
      // Clean up old data
      await this.cleanupOldData();
      
      logInfo('Social media job processing cycle completed');
      const tookMs = Date.now() - before;
      return tookMs > 1000 ? 1 : 0;
    } catch (error) {
      logError('Error during social media job processing:', error);
      return 0;
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

      logInfo(`Running analysis for ${activeCompetitors.length} active competitors`);

      for (const competitor of activeCompetitors) {
        try {
          // Cast to CompetitorProfile since db schema might differ slightly from API type
          await this.runCompetitorAnalysis(competitor as unknown as CompetitorProfile);
        } catch (error) {
          logError(`Error analyzing competitor ${competitor.id}:`, error);
        }
      }

    } catch (error) {
      logError('Error running analysis jobs:', error);
    }
  }

  /**
   * Run comprehensive analysis for a single competitor
   */
  private async runCompetitorAnalysis(competitor: CompetitorProfile): Promise<void> {
    const competitorId = String(competitor.id);
    
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
      logError(`Error in competitor analysis for ${competitorId}:`, error);
    }
  }

  /**
   * Process analysis results and generate actionable insights
   */
  private async processAnalysisResults(competitor: CompetitorProfile, analyses: AnalysisCollection): Promise<void> {
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
  private generateInsights(analyses: AnalysisCollection): InsightsCollection {
    const insights: InsightsCollection = {
      engagement_trends: [],
      content_opportunities: [],
      timing_insights: [],
      audience_changes: [],
      competitive_advantages: [],
      risk_factors: []
    };

    // Process engagement analysis
    if (analyses.engagement && analyses.engagement.length > 0) {
      analyses.engagement.forEach((analysis) => {
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
      analyses.frequency.forEach((analysis) => {
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
      analyses.audience.forEach((analysis) => {
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
  private identifyAlertableEvents(competitor: CompetitorProfile, arg_AnalysisCollection: AnalysisCollection, insights: InsightsCollection): AlertableEvent[] {
    const alerts: AlertableEvent[] = [];

    // High-impact insights become alerts
    insights.competitive_advantages.forEach((advantage) => {
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
    insights.risk_factors.forEach((risk) => {
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
    insights.content_opportunities.forEach((opportunity) => {
      if (opportunity.impact === 'high' || opportunity.impact === 'medium') {
        alerts.push({
          type: 'content_insight',
          severity: 'info',
          title: `Content strategy insight for ${competitor.name}`,
          description: opportunity.recommendation || 'No specific recommendation',
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
  private async createAlert(competitor: CompetitorProfile, alertData: AlertableEvent): Promise<void> {
    try {
      await db.insert(competitorAlerts).values({
        competitor_id: competitor.id,
        user_id: competitor.user_id,
        alert_type: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        description: alertData.description,
        source_data: alertData.data as Record<string, unknown>,
        action_items: alertData.actionItems,
        recommended_actions: alertData.actionItems.map((item: string) => ({
          action: item,
          priority: 'medium',
          estimated_effort: '1-2 hours'
        })),
        is_read: false,
        is_archived: false
      });

      logInfo(`Created alert for competitor ${competitor.id}: ${alertData.title}`);

    } catch (error) {
      logError('Error creating alert:', error);
    }
  }

  /**
   * Generate alerts for significant social media findings
   */
  private async generateAlerts(): Promise<void> {
    try {
      // This method processes the insights generated during analysis
      // and creates alerts for significant competitive intelligence
      
      logInfo('Alert generation completed during analysis processing');
      
    } catch (error) {
      logError('Error generating alerts:', error);
    }
  }

  /**
   * Clean up old social media data and job results
   */
  private async cleanupOldData(): Promise<void> {
    try {
      // Clean up old scraping job results (keep last 30 days)
      await socialMediaScheduler.cleanupOldResults(30);
      
      logInfo('Old social media data cleanup completed');
      
    } catch (error) {
      logError('Error cleaning up old data:', error);
    }
  }

  /**
   * Get processing status and statistics
   */
  getStatus(): ProcessorStatus {
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
    logInfo('Manual social media job processing triggered');
    await this.processJobs();
  }

  /**
   * Run analysis for a specific competitor manually
   */
  async analyzeCompetitorManually(competitorId: string): Promise<ProcessorStatus | { error: string }> {
    try {
      const results = await db
        .select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorId))
        .limit(1);

      const competitor = results[0];

      if (!competitor) {
        throw new Error(`Competitor ${competitorId} not found`);
      }

      logInfo(`Manual analysis triggered for competitor ${competitorId}`);
      await this.runCompetitorAnalysis(competitor as unknown as CompetitorProfile);
      
      return {
        is_running: this.processingInterval !== null,
        is_processing: this.isProcessing,
        interval_minutes: this.processingInterval ? 15 : 0,
        last_processed: new Date().toISOString()
      };

    } catch (error) {
      logError(`Error in manual competitor analysis:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const socialMediaJobProcessor = new SocialMediaJobProcessor(); // not auto-started; call start() explicitly when needed
