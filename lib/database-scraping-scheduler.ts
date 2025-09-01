import { eq, and, lte, desc, asc, sql, inArray, isNull, or } from 'drizzle-orm'
import { db } from '@/db'
import { scrapingJobs, scrapingJobResults, competitorProfiles, intelligenceData } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'

export type JobType = 'website' | 'pricing' | 'products' | 'jobs' | 'social'
export type JobPriority = 'low' | 'medium' | 'high' | 'critical'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused'
export type FrequencyType = 'interval' | 'cron' | 'manual'

export interface ScrapingJobConfig {
  changeDetection?: {
    enabled: boolean
    threshold: number // percentage change to trigger alert
    ignoreSelectors?: string[]
  }
  selectors?: {
    content?: string[]
    pricing?: string[]
    products?: string[]
  }
  headers?: Record<string, string>
  timeout?: number
  retryDelay?: number
  respectRobotsTxt?: boolean
}

export interface CreateJobParams {
  competitorId: number
  userId: string
  jobType: JobType
  url: string
  priority?: JobPriority
  frequencyType?: FrequencyType
  frequencyValue: string
  frequencyTimezone?: string
  config?: ScrapingJobConfig
  maxRetries?: number
}

export interface JobResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
  changesDetected: boolean
  retryCount: number
}

export class ScrapingScheduler {
  private static instance: ScrapingScheduler
  private jobQueue: Map<string, NodeJS.Timeout> = new Map()
  private runningJobs: Set<string> = new Set()

  static getInstance(): ScrapingScheduler {
    if (!ScrapingScheduler.instance) {
      ScrapingScheduler.instance = new ScrapingScheduler()
    }
    return ScrapingScheduler.instance
  }

  /**
   * Create a new scraping job
   */
  async createJob(params: CreateJobParams): Promise<string> {
    const jobId = uuidv4()
    const nextRunAt = this.calculateNextRun(params.frequencyType || 'interval', params.frequencyValue, params.frequencyTimezone)

    await db.insert(scrapingJobs).values({
      id: jobId,
      competitor_id: params.competitorId,
      user_id: params.userId,
      job_type: params.jobType,
      url: params.url,
      priority: params.priority || 'medium',
      frequency_type: params.frequencyType || 'interval',
      frequency_value: params.frequencyValue,
      frequency_timezone: params.frequencyTimezone,
      next_run_at: nextRunAt,
      max_retries: params.maxRetries || 3,
      config: params.config || {},
      status: 'pending'
    })

    // Schedule the job
    this.scheduleJob(jobId, nextRunAt)
    
    return jobId
  }

  /**
   * Get jobs ready to run
   */
  async getJobsToRun(): Promise<any[]> {
    const now = new Date()
    
    return await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          lte(scrapingJobs.next_run_at, now),
          inArray(scrapingJobs.status, ['pending', 'failed']),
          or(
            isNull(scrapingJobs.last_run_at),
            sql`${scrapingJobs.retry_count} < ${scrapingJobs.max_retries}`
          )
        )
      )
      .orderBy(
        desc(scrapingJobs.priority),
        asc(scrapingJobs.next_run_at)
      )
      .limit(10)
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: JobStatus, lastRunAt?: Date): Promise<void> {
    const updateData: any = { status }
    if (lastRunAt) {
      updateData.last_run_at = lastRunAt
    }

    await db
      .update(scrapingJobs)
      .set(updateData)
      .where(eq(scrapingJobs.id, jobId))
  }

  /**
   * Record job execution result
   */
  async recordJobResult(jobId: string, result: JobResult): Promise<void> {
    // Insert result record
    await db.insert(scrapingJobResults).values({
      job_id: jobId,
      success: result.success,
      data: result.data,
      error: result.error,
      execution_time: result.executionTime,
      changes_detected: result.changesDetected,
      retry_count: result.retryCount
    })

    // Update job based on result
    const job = await db
      .select()
      .from(scrapingJobs)
      .where(eq(scrapingJobs.id, jobId))
      .limit(1)

    if (job.length === 0) return

    const currentJob = job[0]

    if (result.success) {
      // Success - schedule next run
      const nextRun = this.calculateNextRun(
        currentJob.frequency_type as FrequencyType,
        currentJob.frequency_value,
        currentJob.frequency_timezone
      )

      await db
        .update(scrapingJobs)
        .set({
          status: 'completed',
          last_run_at: new Date(),
          next_run_at: nextRun,
          retry_count: 0
        })
        .where(eq(scrapingJobs.id, jobId))

      // Schedule next execution
      this.scheduleJob(jobId, nextRun)

      // Store intelligence data if changes detected
      if (result.changesDetected && result.data) {
        await this.storeIntelligenceData(currentJob, result.data)
      }
    } else {
      // Failure - handle retry logic
      const newRetryCount = currentJob.retry_count + 1
      
      if (newRetryCount >= currentJob.max_retries) {
        // Max retries reached - mark as failed
        await db
          .update(scrapingJobs)
          .set({
            status: 'failed',
            retry_count: newRetryCount
          })
          .where(eq(scrapingJobs.id, jobId))
      } else {
        // Schedule retry with exponential backoff
        const retryDelay = this.calculateRetryDelay(newRetryCount)
        const nextRetry = new Date(Date.now() + retryDelay)

        await db
          .update(scrapingJobs)
          .set({
            status: 'pending',
            retry_count: newRetryCount,
            next_run_at: nextRetry
          })
          .where(eq(scrapingJobs.id, jobId))

        // Schedule retry
        this.scheduleJob(jobId, nextRetry)
      }
    }
  }

  /**
   * Schedule a job for execution
   */
  private scheduleJob(jobId: string, runAt: Date): void {
    // Clear existing timeout if any
    const existingTimeout = this.jobQueue.get(jobId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const delay = runAt.getTime() - Date.now()
    
    if (delay <= 0) {
      // Job should run immediately
      this.executeJob(jobId)
    } else {
      // Schedule for future execution
      const timeout = setTimeout(() => {
        this.executeJob(jobId)
      }, delay)
      
      this.jobQueue.set(jobId, timeout)
    }
  }

  /**
   * Execute a scraping job
   */
  private async executeJob(jobId: string): Promise<void> {
    if (this.runningJobs.has(jobId)) {
      return // Job already running
    }

    this.runningJobs.add(jobId)
    this.jobQueue.delete(jobId)

    try {
      await this.updateJobStatus(jobId, 'running', new Date())
      
      // Get job details
      const job = await db
        .select()
        .from(scrapingJobs)
        .where(eq(scrapingJobs.id, jobId))
        .limit(1)

      if (job.length === 0) {
        throw new Error(`Job ${jobId} not found`)
      }

      const jobData = job[0]
      const startTime = Date.now()

      // Execute the actual scraping
      const result = await this.performScraping(jobData)
      const executionTime = Date.now() - startTime

      // Record the result
      await this.recordJobResult(jobId, {
        ...result,
        executionTime,
        retryCount: jobData.retry_count
      })

    } catch (error) {
      console.error(`Error executing job ${jobId}:`, error)
      
      await this.recordJobResult(jobId, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        changesDetected: false,
        retryCount: 0
      })
    } finally {
      this.runningJobs.delete(jobId)
    }
  }

  /**
   * Perform the actual scraping (placeholder - will be implemented with web scraper)
   */
  private async performScraping(job: any): Promise<Omit<JobResult, 'executionTime' | 'retryCount'>> {
    // This is a placeholder implementation
    // In the actual implementation, this would use the web scraper service
    
    try {
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful scraping result
      return {
        success: true,
        data: {
          url: job.url,
          content: 'Mock scraped content',
          timestamp: new Date().toISOString(),
          jobType: job.job_type
        },
        changesDetected: Math.random() > 0.7 // 30% chance of changes
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scraping failed',
        changesDetected: false
      }
    }
  }

  /**
   * Store intelligence data from successful scraping
   */
  private async storeIntelligenceData(job: any, scrapedData: any): Promise<void> {
    await db.insert(intelligenceData).values({
      competitor_id: job.competitor_id,
      user_id: job.user_id,
      source_type: 'website',
      source_url: job.url,
      data_type: job.job_type,
      raw_content: scrapedData,
      extracted_data: {
        jobId: job.id,
        scrapedAt: new Date().toISOString(),
        changeDetected: true
      },
      importance: this.mapPriorityToImportance(job.priority),
      tags: [job.job_type, 'automated'],
      collected_at: new Date()
    })
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(frequencyType: FrequencyType, frequencyValue: string, timezone?: string): Date {
    const now = new Date()
    
    switch (frequencyType) {
      case 'interval':
        // Frequency value is in minutes
        const minutes = parseInt(frequencyValue, 10)
        return new Date(now.getTime() + minutes * 60 * 1000)
      
      case 'cron':
        // For now, implement basic cron parsing
        // In production, use a proper cron library like node-cron
        return new Date(now.getTime() + 60 * 60 * 1000) // Default to 1 hour
      
      case 'manual':
        // Manual jobs don't auto-schedule
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year in future
      
      default:
        return new Date(now.getTime() + 60 * 60 * 1000) // Default to 1 hour
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount minutes, max 60 minutes
    const baseDelay = Math.min(Math.pow(2, retryCount), 60) * 60 * 1000
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * baseDelay
    return baseDelay + jitter
  }

  /**
   * Map job priority to intelligence importance
   */
  private mapPriorityToImportance(priority: string): string {
    switch (priority) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'medium'
    }
  }

  /**
   * Start the scheduler (process pending jobs)
   */
  async start(): Promise<void> {
    console.log('Starting scraping scheduler...')
    
    // Load and schedule existing jobs
    const pendingJobs = await db
      .select()
      .from(scrapingJobs)
      .where(inArray(scrapingJobs.status, ['pending', 'failed']))

    for (const job of pendingJobs) {
      this.scheduleJob(job.id, job.next_run_at)
    }

    console.log(`Scheduled ${pendingJobs.length} existing jobs`)
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('Stopping scraping scheduler...')
    
    // Clear all timeouts
    for (const timeout of this.jobQueue.values()) {
      clearTimeout(timeout)
    }
    
    this.jobQueue.clear()
    console.log('Scraping scheduler stopped')
  }

  /**
   * Get job statistics
   */
  async getJobStats(userId?: string): Promise<any> {
    const baseQuery = db.select({
      status: scrapingJobs.status,
      count: sql<number>`count(*)`
    }).from(scrapingJobs)

    const query = userId 
      ? baseQuery.where(eq(scrapingJobs.user_id, userId))
      : baseQuery

    const stats = await query.groupBy(scrapingJobs.status)
    
    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Pause a job
   */
  async pauseJob(jobId: string): Promise<void> {
    await this.updateJobStatus(jobId, 'paused')
    
    // Clear scheduled execution
    const timeout = this.jobQueue.get(jobId)
    if (timeout) {
      clearTimeout(timeout)
      this.jobQueue.delete(jobId)
    }
  }

  /**
   * Resume a paused job
   */
  async resumeJob(jobId: string): Promise<void> {
    const job = await db
      .select()
      .from(scrapingJobs)
      .where(eq(scrapingJobs.id, jobId))
      .limit(1)

    if (job.length === 0) {
      throw new Error(`Job ${jobId} not found`)
    }

    const jobData = job[0]
    const nextRun = this.calculateNextRun(
      jobData.frequency_type as FrequencyType,
      jobData.frequency_value,
      jobData.frequency_timezone
    )

    await db
      .update(scrapingJobs)
      .set({
        status: 'pending',
        next_run_at: nextRun
      })
      .where(eq(scrapingJobs.id, jobId))

    this.scheduleJob(jobId, nextRun)
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    // Clear scheduled execution
    const timeout = this.jobQueue.get(jobId)
    if (timeout) {
      clearTimeout(timeout)
      this.jobQueue.delete(jobId)
    }

    // Remove from running jobs
    this.runningJobs.delete(jobId)

    // Delete from database (cascade will handle results)
    await db
      .delete(scrapingJobs)
      .where(eq(scrapingJobs.id, jobId))
  }
}