import { ScrapingScheduler } from './database-scraping-scheduler'
import { db } from '@/db'
import { scrapingJobs } from '@/db/schema'
import { eq, and, lte, inArray } from 'drizzle-orm'

export class ScrapingQueueProcessor {
  private static instance: ScrapingQueueProcessor
  private scheduler: ScrapingScheduler
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private readonly PROCESSING_INTERVAL = 30000 // 30 seconds
  private readonly MAX_CONCURRENT_JOBS = 5

  constructor() {
    this.scheduler = ScrapingScheduler.getInstance()
  }

  static getInstance(): ScrapingQueueProcessor {
    if (!ScrapingQueueProcessor.instance) {
      ScrapingQueueProcessor.instance = new ScrapingQueueProcessor()
    }
    return ScrapingQueueProcessor.instance
  }

  /**
   * Start the queue processor
   */
  async start(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processor already running')
      return
    }

    console.log('Starting scraping queue processor...')
    this.isProcessing = true

    // Start the scheduler
    await this.scheduler.start()

    // Start periodic processing
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error('Error processing queue:', error)
      })
    }, this.PROCESSING_INTERVAL)

    // Process queue immediately
    await this.processQueue()

    console.log('Scraping queue processor started')
  }

  /**
   * Stop the queue processor
   */
  stop(): void {
    if (!this.isProcessing) {
      return
    }

    console.log('Stopping scraping queue processor...')
    this.isProcessing = false

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    this.scheduler.stop()
    console.log('Scraping queue processor stopped')
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (!this.isProcessing) {
      return
    }

    try {
      // Get jobs ready to run
      const jobsToRun = await this.scheduler.getJobsToRun()
      
      if (jobsToRun.length === 0) {
        return
      }

      console.log(`Processing ${jobsToRun.length} jobs from queue`)

      // Process jobs with concurrency limit
      const chunks = this.chunkArray(jobsToRun, this.MAX_CONCURRENT_JOBS)
      
      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(job => this.processJob(job))
        )
      }

    } catch (error) {
      console.error('Error in queue processing:', error)
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: any): Promise<void> {
    try {
      console.log(`Processing job ${job.id} (${job.job_type}) for competitor ${job.competitor_id}`)
      
      // Update job status to running
      await this.scheduler.updateJobStatus(job.id, 'running', new Date())

      // Execute the job (this will be handled by the scheduler)
      // The scheduler's executeJob method will handle the actual execution
      
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error)
      
      // Record failure
      await this.scheduler.recordJobResult(job.id, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        changesDetected: false,
        retryCount: job.retry_count || 0
      })
    }
  }

  /**
   * Add a new job to the queue
   */
  async addJob(params: {
    competitorId: number
    userId: string
    jobType: 'website' | 'pricing' | 'products' | 'jobs' | 'social'
    url: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    frequencyType?: 'interval' | 'cron' | 'manual'
    frequencyValue: string
    frequencyTimezone?: string
    config?: any
  }): Promise<string> {
    console.log(`Adding new job: ${params.jobType} for competitor ${params.competitorId}`)
    
    const jobId = await this.scheduler.createJob(params)
    
    console.log(`Job ${jobId} added to queue`)
    return jobId
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number
    pending: number
    running: number
    completed: number
    failed: number
    paused: number
  }> {
    const stats = await this.scheduler.getJobStats()
    
    return {
      total: Object.values(stats).reduce((sum, count) => sum + count, 0),
      pending: stats.pending || 0,
      running: stats.running || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      paused: stats.paused || 0
    }
  }

  /**
   * Get jobs for a specific competitor
   */
  async getCompetitorJobs(competitorId: number, userId: string): Promise<any[]> {
    return await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.competitor_id, competitorId),
          eq(scrapingJobs.user_id, userId)
        )
      )
      .orderBy(scrapingJobs.created_at)
  }

  /**
   * Pause all jobs for a competitor
   */
  async pauseCompetitorJobs(competitorId: number, userId: string): Promise<void> {
    const jobs = await this.getCompetitorJobs(competitorId, userId)
    
    await Promise.all(
      jobs
        .filter(job => job.status === 'pending')
        .map(job => this.scheduler.pauseJob(job.id))
    )
  }

  /**
   * Resume all jobs for a competitor
   */
  async resumeCompetitorJobs(competitorId: number, userId: string): Promise<void> {
    const jobs = await this.getCompetitorJobs(competitorId, userId)
    
    await Promise.all(
      jobs
        .filter(job => job.status === 'paused')
        .map(job => this.scheduler.resumeJob(job.id))
    )
  }

  /**
   * Delete all jobs for a competitor
   */
  async deleteCompetitorJobs(competitorId: number, userId: string): Promise<void> {
    const jobs = await this.getCompetitorJobs(competitorId, userId)
    
    await Promise.all(
      jobs.map(job => this.scheduler.deleteJob(job.id))
    )
  }

  /**
   * Create default monitoring jobs for a new competitor
   */
  async createDefaultJobs(competitorId: number, userId: string, competitorData: {
    domain?: string
    socialMediaHandles?: any
  }): Promise<string[]> {
    const jobIds: string[] = []

    // Website monitoring job
    if (competitorData.domain) {
      const websiteJobId = await this.addJob({
        competitorId,
        userId,
        jobType: 'website',
        url: `https://${competitorData.domain}`,
        priority: 'medium',
        frequencyType: 'interval',
        frequencyValue: '360', // 6 hours
        config: {
          changeDetection: {
            enabled: true,
            threshold: 5 // 5% change threshold
          },
          selectors: {
            content: ['main', '.content', '#content', 'article']
          },
          respectRobotsTxt: true
        }
      })
      jobIds.push(websiteJobId)

      // Pricing page monitoring
      const pricingJobId = await this.addJob({
        competitorId,
        userId,
        jobType: 'pricing',
        url: `https://${competitorData.domain}/pricing`,
        priority: 'high',
        frequencyType: 'interval',
        frequencyValue: '180', // 3 hours
        config: {
          changeDetection: {
            enabled: true,
            threshold: 1 // 1% change threshold for pricing
          },
          selectors: {
            pricing: ['.price', '.pricing', '[data-price]', '.cost']
          },
          respectRobotsTxt: true
        }
      })
      jobIds.push(pricingJobId)

      // Products page monitoring
      const productsJobId = await this.addJob({
        competitorId,
        userId,
        jobType: 'products',
        url: `https://${competitorData.domain}/products`,
        priority: 'medium',
        frequencyType: 'interval',
        frequencyValue: '720', // 12 hours
        config: {
          changeDetection: {
            enabled: true,
            threshold: 3 // 3% change threshold
          },
          selectors: {
            products: ['.product', '.feature', '.service']
          },
          respectRobotsTxt: true
        }
      })
      jobIds.push(productsJobId)

      // Jobs page monitoring
      const jobsJobId = await this.addJob({
        competitorId,
        userId,
        jobType: 'jobs',
        url: `https://${competitorData.domain}/careers`,
        priority: 'medium',
        frequencyType: 'interval',
        frequencyValue: '1440', // 24 hours
        config: {
          changeDetection: {
            enabled: true,
            threshold: 1 // Any new job posting
          },
          respectRobotsTxt: true
        }
      })
      jobIds.push(jobsJobId)
    }

    // Social media monitoring jobs
    if (competitorData.socialMediaHandles) {
      const handles = competitorData.socialMediaHandles

      if (handles.linkedin) {
        const linkedinJobId = await this.addJob({
          competitorId,
          userId,
          jobType: 'social',
          url: handles.linkedin,
          priority: 'medium',
          frequencyType: 'interval',
          frequencyValue: '480', // 8 hours
          config: {
            platform: 'linkedin',
            changeDetection: {
              enabled: true,
              threshold: 1
            }
          }
        })
        jobIds.push(linkedinJobId)
      }

      if (handles.twitter) {
        const twitterJobId = await this.addJob({
          competitorId,
          userId,
          jobType: 'social',
          url: handles.twitter,
          priority: 'medium',
          frequencyType: 'interval',
          frequencyValue: '240', // 4 hours
          config: {
            platform: 'twitter',
            changeDetection: {
              enabled: true,
              threshold: 1
            }
          }
        })
        jobIds.push(twitterJobId)
      }
    }

    console.log(`Created ${jobIds.length} default monitoring jobs for competitor ${competitorId}`)
    return jobIds
  }

  /**
   * Update job frequency based on competitor importance
   */
  async updateJobFrequencies(competitorId: number, userId: string, threatLevel: string): Promise<void> {
    const jobs = await this.getCompetitorJobs(competitorId, userId)
    
    // Adjust frequencies based on threat level
    const frequencyMultiplier = this.getThreatLevelMultiplier(threatLevel)
    
    for (const job of jobs) {
      if (job.frequency_type === 'interval') {
        const currentMinutes = parseInt(job.frequency_value, 10)
        const newMinutes = Math.max(30, Math.floor(currentMinutes / frequencyMultiplier))
        
        await db
          .update(scrapingJobs)
          .set({
            frequency_value: newMinutes.toString(),
            next_run_at: new Date(Date.now() + newMinutes * 60 * 1000)
          })
          .where(eq(scrapingJobs.id, job.id))
      }
    }
  }

  /**
   * Get frequency multiplier based on threat level
   */
  private getThreatLevelMultiplier(threatLevel: string): number {
    switch (threatLevel) {
      case 'critical': return 4 // 4x more frequent
      case 'high': return 2 // 2x more frequent
      case 'medium': return 1 // Same frequency
      case 'low': return 0.5 // Half frequency
      default: return 1
    }
  }

  /**
   * Utility function to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Health check for the queue processor
   */
  getHealthStatus(): {
    isRunning: boolean
    processingInterval: number
    maxConcurrentJobs: number
    uptime: number
  } {
    return {
      isRunning: this.isProcessing,
      processingInterval: this.PROCESSING_INTERVAL,
      maxConcurrentJobs: this.MAX_CONCURRENT_JOBS,
      uptime: process.uptime()
    }
  }
}

// Export singleton instance
export const queueProcessor = ScrapingQueueProcessor.getInstance()