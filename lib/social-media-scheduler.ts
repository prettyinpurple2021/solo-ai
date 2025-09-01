import { db } from '@/db';
import { competitorProfiles, scrapingJobs, scrapingJobResults } from '@/db/schema';
import { eq, and, lte, isNull, or } from 'drizzle-orm';
import { socialMediaMonitor } from './social-media-monitor';
import { v4 as uuidv4 } from 'uuid';

export interface SocialMediaJobConfig {
  platforms: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
  priority: 'low' | 'medium' | 'high';
  enabled: boolean;
}

/**
 * Social Media Scheduler Service
 * Manages automated social media monitoring jobs
 */
export class SocialMediaScheduler {
  private readonly defaultConfig: SocialMediaJobConfig = {
    platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
    frequency: 'daily',
    priority: 'medium',
    enabled: true
  };

  /**
   * Schedule social media monitoring for a competitor
   */
  async scheduleMonitoring(
    competitorId: number,
    userId: string,
    config: Partial<SocialMediaJobConfig> = {}
  ): Promise<string[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const jobIds: string[] = [];

    // Create monitoring jobs for each platform
    for (const platform of finalConfig.platforms) {
      const jobId = await this.createSocialMediaJob(
        competitorId,
        userId,
        platform,
        finalConfig
      );
      if (jobId) {
        jobIds.push(jobId);
      }
    }

    return jobIds;
  }

  /**
   * Create a social media monitoring job
   */
  private async createSocialMediaJob(
    competitorId: number,
    userId: string,
    platform: string,
    config: SocialMediaJobConfig
  ): Promise<string | null> {
    try {
      // Get competitor info
      const [competitor] = await db
        .select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorId))
        .limit(1);

      if (!competitor) {
        throw new Error(`Competitor ${competitorId} not found`);
      }

      const socialHandles = competitor.social_media_handles as any;
      const platformHandle = socialHandles?.[platform];

      if (!platformHandle) {
        console.log(`No ${platform} handle found for competitor ${competitorId}`);
        return null;
      }

      const jobId = uuidv4();
      const nextRunAt = this.calculateNextRun(config.frequency);

      await db.insert(scrapingJobs).values({
        id: jobId,
        competitor_id: competitorId,
        user_id: userId,
        job_type: 'social_media',
        url: this.getPlatformUrl(platform, platformHandle),
        priority: config.priority,
        frequency_type: 'interval',
        frequency_value: config.frequency,
        next_run_at: nextRunAt,
        status: config.enabled ? 'pending' : 'paused',
        config: {
          platform,
          handle: platformHandle,
          monitoring_config: config
        }
      });

      console.log(`Created social media job ${jobId} for ${platform} monitoring of competitor ${competitorId}`);
      return jobId;

    } catch (error) {
      console.error(`Error creating social media job for platform ${platform}:`, error);
      return null;
    }
  }

  /**
   * Process pending social media monitoring jobs
   */
  async processPendingJobs(): Promise<void> {
    try {
      // Get all pending social media jobs that are due
      const pendingJobs = await db
        .select()
        .from(scrapingJobs)
        .where(
          and(
            eq(scrapingJobs.job_type, 'social_media'),
            eq(scrapingJobs.status, 'pending'),
            lte(scrapingJobs.next_run_at, new Date())
          )
        );

      console.log(`Processing ${pendingJobs.length} pending social media jobs`);

      for (const job of pendingJobs) {
        await this.processJob(job);
      }

    } catch (error) {
      console.error('Error processing pending social media jobs:', error);
    }
  }

  /**
   * Process a single social media monitoring job
   */
  private async processJob(job: any): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let error: string | null = null;
    let changesDetected = false;

    try {
      // Update job status to running
      await db
        .update(scrapingJobs)
        .set({ status: 'running' })
        .where(eq(scrapingJobs.id, job.id));

      const config = job.config as any;
      const platform = config.platform;

      console.log(`Processing social media job ${job.id} for platform ${platform}`);

      // Execute the monitoring based on platform
      let result;
      switch (platform) {
        case 'linkedin':
          result = await socialMediaMonitor.monitorLinkedInActivity(job.competitor_id);
          break;
        case 'twitter':
          result = await socialMediaMonitor.monitorTwitterActivity(job.competitor_id);
          break;
        case 'facebook':
          result = await socialMediaMonitor.monitorFacebookActivity(job.competitor_id);
          break;
        case 'instagram':
          result = await socialMediaMonitor.monitorInstagramActivity(job.competitor_id);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      success = true;
      changesDetected = result && result.length > 0;

      // Update job for next run
      const nextRunAt = this.calculateNextRun(config.monitoring_config.frequency);
      await db
        .update(scrapingJobs)
        .set({
          status: 'pending',
          last_run_at: new Date(),
          next_run_at: nextRunAt,
          retry_count: 0
        })
        .where(eq(scrapingJobs.id, job.id));

    } catch (err) {
      console.error(`Error processing social media job ${job.id}:`, err);
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';

      // Handle retry logic
      const newRetryCount = (job.retry_count || 0) + 1;
      const maxRetries = job.max_retries || 3;

      if (newRetryCount >= maxRetries) {
        // Max retries reached, mark as failed
        await db
          .update(scrapingJobs)
          .set({
            status: 'failed',
            retry_count: newRetryCount
          })
          .where(eq(scrapingJobs.id, job.id));
      } else {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // 2^n minutes
        const nextRunAt = new Date(Date.now() + retryDelay);

        await db
          .update(scrapingJobs)
          .set({
            status: 'pending',
            retry_count: newRetryCount,
            next_run_at: nextRunAt
          })
          .where(eq(scrapingJobs.id, job.id));
      }
    } finally {
      // Record job result
      const executionTime = Date.now() - startTime;

      await db.insert(scrapingJobResults).values({
        job_id: job.id,
        success,
        data: success ? { platform: job.config.platform, posts_collected: true } : null,
        error,
        execution_time: executionTime,
        changes_detected: changesDetected,
        retry_count: job.retry_count || 0
      });
    }
  }

  /**
   * Update social media monitoring configuration for a competitor
   */
  async updateMonitoringConfig(
    competitorId: number,
    userId: string,
    config: Partial<SocialMediaJobConfig>
  ): Promise<void> {
    try {
      // Get existing jobs for this competitor
      const existingJobs = await db
        .select()
        .from(scrapingJobs)
        .where(
          and(
            eq(scrapingJobs.competitor_id, competitorId),
            eq(scrapingJobs.user_id, userId),
            eq(scrapingJobs.job_type, 'social_media')
          )
        );

      // Update existing jobs
      for (const job of existingJobs) {
        const currentConfig = job.config as any;
        const updatedConfig = {
          ...currentConfig,
          monitoring_config: { ...currentConfig.monitoring_config, ...config }
        };

        await db
          .update(scrapingJobs)
          .set({
            config: updatedConfig,
            status: config.enabled === false ? 'paused' : 'pending',
            priority: config.priority || job.priority,
            next_run_at: config.frequency ? this.calculateNextRun(config.frequency) : job.next_run_at
          })
          .where(eq(scrapingJobs.id, job.id));
      }

      // If new platforms are added, create new jobs
      if (config.platforms) {
        const existingPlatforms = existingJobs.map(job => (job.config as any).platform);
        const newPlatforms = config.platforms.filter(p => !existingPlatforms.includes(p));

        for (const platform of newPlatforms) {
          await this.createSocialMediaJob(competitorId, userId, platform, {
            ...this.defaultConfig,
            ...config
          });
        }
      }

    } catch (error) {
      console.error('Error updating social media monitoring config:', error);
      throw error;
    }
  }

  /**
   * Pause social media monitoring for a competitor
   */
  async pauseMonitoring(competitorId: number, userId: string): Promise<void> {
    await db
      .update(scrapingJobs)
      .set({ status: 'paused' })
      .where(
        and(
          eq(scrapingJobs.competitor_id, competitorId),
          eq(scrapingJobs.user_id, userId),
          eq(scrapingJobs.job_type, 'social_media')
        )
      );
  }

  /**
   * Resume social media monitoring for a competitor
   */
  async resumeMonitoring(competitorId: number, userId: string): Promise<void> {
    await db
      .update(scrapingJobs)
      .set({ 
        status: 'pending',
        next_run_at: new Date() // Run immediately
      })
      .where(
        and(
          eq(scrapingJobs.competitor_id, competitorId),
          eq(scrapingJobs.user_id, userId),
          eq(scrapingJobs.job_type, 'social_media'),
          eq(scrapingJobs.status, 'paused')
        )
      );
  }

  /**
   * Get social media monitoring status for a competitor
   */
  async getMonitoringStatus(competitorId: number, userId: string) {
    const jobs = await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.competitor_id, competitorId),
          eq(scrapingJobs.user_id, userId),
          eq(scrapingJobs.job_type, 'social_media')
        )
      );

    const recentResults = await db
      .select()
      .from(scrapingJobResults)
      .where(
        and(
          eq(scrapingJobResults.job_id, jobs[0]?.id || ''),
          lte(scrapingJobResults.completed_at, new Date())
        )
      )
      .orderBy(scrapingJobResults.completed_at)
      .limit(10);

    return {
      jobs: jobs.map(job => ({
        id: job.id,
        platform: (job.config as any).platform,
        status: job.status,
        priority: job.priority,
        frequency: job.frequency_value,
        next_run_at: job.next_run_at,
        last_run_at: job.last_run_at,
        retry_count: job.retry_count
      })),
      recent_results: recentResults,
      total_jobs: jobs.length,
      active_jobs: jobs.filter(j => j.status === 'pending' || j.status === 'running').length,
      paused_jobs: jobs.filter(j => j.status === 'paused').length,
      failed_jobs: jobs.filter(j => j.status === 'failed').length
    };
  }

  // Helper methods

  private calculateNextRun(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  private getPlatformUrl(platform: string, handle: string): string {
    switch (platform) {
      case 'linkedin':
        return `https://linkedin.com/company/${handle}`;
      case 'twitter':
        return `https://twitter.com/${handle}`;
      case 'facebook':
        return `https://facebook.com/${handle}`;
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'youtube':
        return `https://youtube.com/@${handle}`;
      default:
        return `https://${platform}.com/${handle}`;
    }
  }

  /**
   * Clean up old job results to prevent database bloat
   */
  async cleanupOldResults(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const result = await db
        .delete(scrapingJobResults)
        .where(lte(scrapingJobResults.completed_at, cutoffDate));

      console.log(`Cleaned up old social media job results older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up old job results:', error);
    }
  }

  /**
   * Get social media monitoring statistics
   */
  async getMonitoringStats(userId: string) {
    const jobs = await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.user_id, userId),
          eq(scrapingJobs.job_type, 'social_media')
        )
      );

    const results = await db
      .select()
      .from(scrapingJobResults)
      .where(
        and(
          eq(scrapingJobResults.job_id, jobs[0]?.id || ''),
          lte(scrapingJobResults.completed_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      );

    const successfulRuns = results.filter(r => r.success).length;
    const totalRuns = results.length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    return {
      total_jobs: jobs.length,
      active_jobs: jobs.filter(j => j.status === 'pending' || j.status === 'running').length,
      paused_jobs: jobs.filter(j => j.status === 'paused').length,
      failed_jobs: jobs.filter(j => j.status === 'failed').length,
      success_rate: Math.round(successRate),
      total_runs_last_week: totalRuns,
      successful_runs_last_week: successfulRuns,
      platforms_monitored: [...new Set(jobs.map(j => (j.config as any).platform))],
      avg_execution_time: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.execution_time, 0) / results.length)
        : 0
    };
  }
}

// Export singleton instance
export const socialMediaScheduler = new SocialMediaScheduler();