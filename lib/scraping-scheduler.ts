import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { z } from 'zod'
import { webScrapingService, type ScrapingResult } from './web-scraping-service'
import type { CompetitorProfile } from './competitor-intelligence-types'


// Types for scheduling system
export interface ScrapingJob {
  id: string
  competitorId: number
  userId: string
  jobType: 'website' | 'pricing' | 'products' | 'jobs' | 'social'
  url: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: ScrapingFrequency
  nextRunAt: Date
  lastRunAt?: Date
  retryCount: number
  maxRetries: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  config: ScrapingJobConfig
  createdAt: Date
  updatedAt: Date
}

export interface ScrapingJobConfig {
  enableChangeDetection: boolean
  changeThreshold: number
  notifyOnChange: boolean
  storeHistory: boolean
  customSelectors?: Record<string, string>
  excludePatterns?: string[]
}

export interface ScrapingFrequency {
  type: 'interval' | 'cron' | 'manual'
  value: string | number // minutes for interval, cron expression for cron
  timezone?: string
}

export interface QueueMetrics {
  totalJobs: number
  pendingJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  averageExecutionTime: number
  successRate: number
}

export interface ScrapingJobResult {
  jobId: string
  success: boolean
  data?: any
  error?: string
  executionTime: number
  changesDetected: boolean
  retryCount: number
  completedAt: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

// Default job configuration
const DEFAULT_JOB_CONFIG: ScrapingJobConfig = {
  enableChangeDetection: true,
  changeThreshold: 0.1, // 10% change threshold
  notifyOnChange: true,
  storeHistory: true,
}

/**
 * Scraping Scheduler and Queue System
 * 
 * This service manages the scheduling and execution of web scraping jobs with:
 * - Intelligent scheduling based on competitor importance and change frequency
 * - Background job queue with priority handling
 * - Retry mechanisms with exponential backoff
 * - Data quality validation and monitoring
 * - Performance optimization and resource management
 */
export class ScrapingScheduler {
  private jobQueue: Map<string, ScrapingJob> = new Map()
  private runningJobs: Set<string> = new Set()
  private jobHistory: Map<string, ScrapingJobResult[]> = new Map()
  private metrics: QueueMetrics = {
    totalJobs: 0,
    pendingJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageExecutionTime: 0,
    successRate: 0,
  }
  private isRunning = false
  private processingInterval?: NodeJS.Timeout
  private idleCyclesWithoutWork = 0
  private readonly IDLE_STOP_CYCLES = 40 // ~20 minutes at 30s interval
  private lastLoopAt: Date | null = null
  private readonly MAX_CONCURRENT_JOBS = 5
  private readonly PROCESSING_INTERVAL = 30000 // 30 seconds

  constructor(autoStart: boolean = true) {
    if (autoStart && process.env.NODE_ENV !== 'test') {
      this.startProcessing()
    }
  }

  /**
   * Schedule a new scraping job
   */
  async scheduleJob(
    competitorId: number,
    userId: string,
    jobType: ScrapingJob['jobType'],
    url: string,
    frequency: ScrapingFrequency,
    config: Partial<ScrapingJobConfig> = {}
  ): Promise<string> {
    try {
      const jobId = this.generateJobId(competitorId, jobType, url)

      const job: ScrapingJob = {
        id: jobId,
        competitorId,
        userId,
        jobType,
        url,
        priority: this.calculateJobPriority(competitorId, jobType),
        frequency,
        nextRunAt: this.calculateNextRun(frequency),
        retryCount: 0,
        maxRetries: 3,
        status: 'pending',
        config: { ...DEFAULT_JOB_CONFIG, ...config },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.jobQueue.set(jobId, job)
      this.updateMetrics()

      logInfo(`Scheduled scraping job: ${jobId} for ${url}`)
      return jobId
    } catch (error) {
      // Only log errors in non-test environments to reduce test noise
      if (process.env.NODE_ENV !== 'test') {
        logError('Error in scheduleJob:', error)
      }
      throw error
    }
  }

  /**
   * Schedule jobs for a competitor based on their profile and importance
   */
  async scheduleCompetitorJobs(
    competitor: CompetitorProfile,
    userId: string
  ): Promise<string[]> {
    const jobIds: string[] = []

    // Determine scraping frequency based on threat level
    const frequency = this.getFrequencyByThreatLevel(competitor.threatLevel)

    // Schedule website monitoring
    if (competitor.domain) {
      const websiteJobId = await this.scheduleJob(
        competitor.id,
        userId,
        'website',
        `https://${competitor.domain}`,
        frequency
      )
      jobIds.push(websiteJobId)

      // Schedule pricing page monitoring if likely to have pricing
      const pricingUrl = await this.guessPricingUrl(competitor.domain)
      if (pricingUrl) {
        const pricingJobId = await this.scheduleJob(
          competitor.id,
          userId,
          'pricing',
          pricingUrl,
          frequency
        )
        jobIds.push(pricingJobId)
      }

      // Schedule product page monitoring
      const productUrl = await this.guessProductUrl(competitor.domain)
      if (productUrl) {
        const productJobId = await this.scheduleJob(
          competitor.id,
          userId,
          'products',
          productUrl,
          frequency
        )
        jobIds.push(productJobId)
      }

      // Schedule job posting monitoring
      const jobsUrl = await this.guessJobsUrl(competitor.domain)
      if (jobsUrl) {
        const jobsJobId = await this.scheduleJob(
          competitor.id,
          userId,
          'jobs',
          jobsUrl,
          { ...frequency, type: 'interval', value: frequency.value as number * 2 } // Less frequent
        )
        jobIds.push(jobsJobId)
      }
    }

    return jobIds
  }

  /**
   * Execute a specific job immediately
   */
  async executeJob(jobId: string): Promise<ScrapingJobResult> {
    const job = this.jobQueue.get(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    if (this.runningJobs.has(jobId)) {
      throw new Error(`Job already running: ${jobId}`)
    }

    return await this.processJob(job)
  }

  /**
   * Pause a scheduled job
   */
  pauseJob(jobId: string): boolean {
    const job = this.jobQueue.get(jobId)
    if (!job) return false

    job.status = 'paused'
    job.updatedAt = new Date()
    this.updateMetrics()
    return true
  }

  /**
   * Resume a paused job
   */
  resumeJob(jobId: string): boolean {
    const job = this.jobQueue.get(jobId)
    if (!job || job.status !== 'paused') return false

    job.status = 'pending'
    job.nextRunAt = this.calculateNextRun(job.frequency)
    job.updatedAt = new Date()
    this.updateMetrics()
    return true
  }

  /**
   * Cancel and remove a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobQueue.get(jobId)
    if (!job) return false

    if (this.runningJobs.has(jobId)) {
      // Mark for cancellation, will be removed when execution completes
      job.status = 'cancelled'
    } else {
      this.jobQueue.delete(jobId)
    }

    this.updateMetrics()
    return true
  }

  /**
   * Get job status and details
   */
  getJob(jobId: string): ScrapingJob | null {
    return this.jobQueue.get(jobId) || null
  }

  /**
   * Get all jobs for a competitor
   */
  getCompetitorJobs(competitorId: number): ScrapingJob[] {
    return Array.from(this.jobQueue.values()).filter(job => job.competitorId === competitorId)
  }

  /**
   * Get job execution history
   */
  getJobHistory(jobId: string): ScrapingJobResult[] {
    return this.jobHistory.get(jobId) || []
  }

  /**
   * Get queue metrics and performance statistics
   */
  getMetrics(): QueueMetrics {
    return { ...this.metrics }
  }

  /**
   * Validate scraping results for quality and accuracy
   */
  validateScrapingResult(result: ScrapingResult, job: ScrapingJob): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      confidence: 1.0,
    }

    if (!result.success) {
      validation.isValid = false
      validation.errors.push(result.error || 'Scraping failed')
      validation.confidence = 0
      return validation
    }

    if (!result.data) {
      validation.isValid = false
      validation.errors.push('No data returned from scraping')
      validation.confidence = 0
      return validation
    }

    // Validate based on job type
    switch (job.jobType) {
      case 'website':
        validation.confidence *= this.validateWebsiteData(result.data)
        break
      case 'pricing':
        validation.confidence *= this.validatePricingData(result.data)
        break
      case 'products':
        validation.confidence *= this.validateProductData(result.data)
        break
      case 'jobs':
        validation.confidence *= this.validateJobData(result.data)
        break
    }

    // Check response time
    if (result.responseTime > 30000) {
      validation.warnings.push('Slow response time detected')
      validation.confidence *= 0.9
    }

    // Check if cached result is too old
    if (result.cached) {
      validation.warnings.push('Using cached data')
      validation.confidence *= 0.95
    }

    return validation
  }

  // Private methods

  private startProcessing(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.processingInterval = setInterval(() => {
      this.processQueue().then(processed => {
        this.lastLoopAt = new Date()
        if (processed === 0) {
          this.idleCyclesWithoutWork += 1
          if (this.idleCyclesWithoutWork >= this.IDLE_STOP_CYCLES) {
            logInfo('No scraping jobs to process for a while; stopping scheduler to save resources')
            this.stopProcessing()
            this.idleCyclesWithoutWork = 0
          }
        } else {
          this.idleCyclesWithoutWork = 0
        }
      }).catch(error => logError('Error in scheduler loop:', error))
    }, this.PROCESSING_INTERVAL)

    logInfo('Scraping scheduler started')
  }

  /** Public status summary for admin */
  getStatus(): { running: boolean; lastLoopAt: string | null; metrics: QueueMetrics } {
    return {
      running: !!this.processingInterval,
      lastLoopAt: this.lastLoopAt ? this.lastLoopAt.toISOString() : null,
      metrics: this.getMetrics()
    }
  }

  private stopProcessing(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
    }

    logInfo('Scraping scheduler stopped')
  }

  private async processQueue(): Promise<number> {
    if (this.runningJobs.size >= this.MAX_CONCURRENT_JOBS) {
      return 0 // Queue is full
    }

    // Get pending jobs that are ready to run
    const readyJobs = Array.from(this.jobQueue.values())
      .filter(job =>
        job.status === 'pending' &&
        job.nextRunAt <= new Date() &&
        !this.runningJobs.has(job.id)
      )
      .sort((a, b) => {
        // Sort by priority, then by next run time
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.nextRunAt.getTime() - b.nextRunAt.getTime()
      })

    // Process jobs up to the concurrent limit
    const jobsToProcess = readyJobs.slice(0, this.MAX_CONCURRENT_JOBS - this.runningJobs.size)

    for (const job of jobsToProcess) {
      this.processJob(job).catch(error => {
        logError(`Error processing job ${job.id}:`, error)
      })
    }
    return jobsToProcess.length
  }

  private async processJob(job: ScrapingJob): Promise<ScrapingJobResult> {
    // Immediately handle jobs that were cancelled while pending in the queue
    if (job.status === 'cancelled') {
      this._cleanupCancelledJob(job.id)
      return {
        jobId: job.id,
        success: false,
        error: 'Job cancelled before execution',
        executionTime: 0,
        changesDetected: false,
        retryCount: job.retryCount,
        completedAt: new Date(),
      }
    }

    const startTime = Date.now()

    try {
      logInfo(`Processing scraping job: ${job.id} (${job.jobType}) for ${job.url}`)

      // Now update job status to running since it wasn't cancelled
      this.runningJobs.add(job.id)
      job.status = 'running'
      job.lastRunAt = new Date()
      job.updatedAt = new Date()

      // Execute the scraping based on job type
      let scrapingResult: ScrapingResult

      switch (job.jobType) {
        case 'website':
          scrapingResult = await webScrapingService.scrapeCompetitorWebsite(job.url)
          break
        case 'pricing':
          scrapingResult = await webScrapingService.monitorPricingPages(job.url)
          break
        case 'products':
          scrapingResult = await webScrapingService.trackProductPages(job.url)
          break
        case 'jobs':
          scrapingResult = await webScrapingService.scrapeJobPostings(job.url)
          break
        default:
          throw new Error(`Unknown job type: ${job.jobType}`)
      }

      // Validate the result
      const validation = this.validateScrapingResult(scrapingResult, job)

      const result: ScrapingJobResult = {
        jobId: job.id,
        success: scrapingResult.success && validation.isValid,
        data: scrapingResult.data,
        error: scrapingResult.error || (validation.errors.length > 0 ? validation.errors.join('; ') : undefined),
        executionTime: Date.now() - startTime,
        changesDetected: false, // Will be determined by change detection logic
        retryCount: job.retryCount,
        completedAt: new Date(),
      }

      if (result.success) {
        // Job completed successfully
        job.status = 'completed'
        job.retryCount = 0
        job.nextRunAt = this.calculateNextRun(job.frequency)
        this.metrics.completedJobs++
      } else if ((job.status as any) !== 'cancelled') {
        // Job failed, check if we should retry
        job.retryCount++

        if (job.retryCount <= job.maxRetries) {
          job.status = 'pending'
          job.nextRunAt = this.calculateRetryTime(job.retryCount)
          logError(`Job ${job.id} failed, scheduling retry ${job.retryCount}/${job.maxRetries}`)
        } else {
          job.status = 'failed'
          job.nextRunAt = this.calculateNextRun(job.frequency) // Try again next cycle
          this.metrics.failedJobs++
          logError(`Job ${job.id} failed permanently after ${job.maxRetries} retries`)
        }
      }

      // Store result in history
      const history = this.jobHistory.get(job.id) || []
      history.push(result)
      // Keep only last 10 results
      if (history.length > 10) {
        history.splice(0, history.length - 10)
      }
      this.jobHistory.set(job.id, history)

      job.updatedAt = new Date()
      this.updateMetrics()

      return result
    } catch (error) {
      // Unexpected error during processing
      job.retryCount++

      const result: ScrapingJobResult = {
        jobId: job.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error',
        executionTime: Date.now() - startTime,
        changesDetected: false,
        retryCount: job.retryCount,
        completedAt: new Date(),
      }

      if (job.retryCount <= job.maxRetries) {
        job.status = 'pending'
        job.nextRunAt = this.calculateRetryTime(job.retryCount)
      } else {
        job.status = 'failed'
        job.nextRunAt = this.calculateNextRun(job.frequency)
        this.metrics.failedJobs++
      }

      job.updatedAt = new Date()
      this.updateMetrics()

      return result
    } finally {
      this.runningJobs.delete(job.id)
      // If job was cancelled during execution, remove it from the queue
      if ((job.status as any) === 'cancelled') {
        this._cleanupCancelledJob(job.id)
      }
    }
  }

  private _cleanupCancelledJob(jobId: string): void {
    this.jobQueue.delete(jobId)
    logInfo(`Cleaned up cancelled job: ${jobId}`)
    this.updateMetrics()
  }

  private generateJobId(competitorId: number, jobType: string, url: string): string {
    const hash = Buffer.from(`${competitorId}-${jobType}-${url}`).toString('base64')
    return `job_${hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`
  }

  private calculateJobPriority(competitorId: number, jobType: string): ScrapingJob['priority'] {
    // This would typically query the competitor's threat level from the database
    // For now, we'll use a simple heuristic

    if (jobType === 'pricing') return 'high' // Pricing changes are important
    if (jobType === 'website') return 'medium' // General website changes
    if (jobType === 'products') return 'medium' // Product updates
    if (jobType === 'jobs') return 'low' // Job postings are less urgent

    return 'medium'
  }

  private getFrequencyByThreatLevel(threatLevel: string): ScrapingFrequency {
    switch (threatLevel) {
      case 'critical':
        return { type: 'interval', value: 60 } // Every hour
      case 'high':
        return { type: 'interval', value: 240 } // Every 4 hours
      case 'medium':
        return { type: 'interval', value: 720 } // Every 12 hours
      case 'low':
      default:
        return { type: 'interval', value: 1440 } // Daily
    }
  }

  private calculateNextRun(frequency: ScrapingFrequency): Date {
    const now = new Date()

    switch (frequency.type) {
      case 'interval':
        const minutes = typeof frequency.value === 'number' ? frequency.value : parseInt(frequency.value as string)
        return new Date(now.getTime() + minutes * 60 * 1000)

      case 'cron':
        // For cron expressions, we'd use a cron parser library
        // For now, default to 1 hour
        return new Date(now.getTime() + 60 * 60 * 1000)

      case 'manual':
      default:
        // Manual jobs don't auto-schedule
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  }

  private calculateRetryTime(retryCount: number): Date {
    // Exponential backoff: 2^retryCount minutes
    const delayMinutes = Math.pow(2, retryCount)
    return new Date(Date.now() + delayMinutes * 60 * 1000)
  }

  private async guessPricingUrl(domain: string): Promise<string | null> {
    const commonPaths = ['/pricing', '/plans', '/subscribe', '/buy', '/purchase']
    return this.findFirstExistingUrl(domain, commonPaths)
  }

  private async guessProductUrl(domain: string): Promise<string | null> {
    const commonPaths = ['/products', '/features', '/solutions', '/services']
    return this.findFirstExistingUrl(domain, commonPaths)
  }

  private async guessJobsUrl(domain: string): Promise<string | null> {
    const commonPaths = ['/careers', '/jobs', '/hiring', '/join', '/work-with-us']
    return this.findFirstExistingUrl(domain, commonPaths)
  }

  private async findFirstExistingUrl(domain: string, paths: string[]): Promise<string | null> {
    for (const path of paths) {
      const url = `https://${domain}${path}`
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          return url
        }
      } catch (error) {
        // Ignore errors and try next path
        continue
      }
    }
    return null
  }

  private validateWebsiteData(data: any): number {
    if (!data || typeof data !== 'object') return 0

    let confidence = 1.0

    // Check for basic website data
    if (!data.title) confidence *= 0.8
    if (!data.description) confidence *= 0.9
    if (!data.content || data.content.length < 100) confidence *= 0.7

    return confidence
  }

  private validatePricingData(data: any): number {
    if (!data || !data.plans || !Array.isArray(data.plans)) return 0

    let confidence = 1.0

    // Check pricing plan quality
    if (data.plans.length === 0) return 0

    for (const plan of data.plans) {
      if (!plan.name || typeof plan.price !== 'number') {
        confidence *= 0.5
      }
    }

    return confidence
  }

  private validateProductData(data: any): number {
    if (!data || !data.products || !Array.isArray(data.products)) return 0

    let confidence = 1.0

    if (data.products.length === 0) return 0

    for (const product of data.products) {
      if (!product.name) {
        confidence *= 0.7
      }
    }

    return confidence
  }

  private validateJobData(data: any): number {
    if (!Array.isArray(data)) return 0

    let confidence = 1.0

    if (data.length === 0) return 0.5 // No jobs might be valid

    for (const job of data) {
      if (!job.title || !job.description) {
        confidence *= 0.8
      }
    }

    return confidence
  }

  private updateMetrics(): void {
    const jobs = Array.from(this.jobQueue.values())

    this.metrics.totalJobs = jobs.length
    this.metrics.pendingJobs = jobs.filter(j => j.status === 'pending').length
    this.metrics.runningJobs = this.runningJobs.size
    this.metrics.completedJobs = jobs.filter(j => j.status === 'completed').length
    this.metrics.failedJobs = jobs.filter(j => j.status === 'failed').length

    // Calculate success rate
    const totalCompleted = this.metrics.completedJobs + this.metrics.failedJobs
    this.metrics.successRate = totalCompleted > 0 ? this.metrics.completedJobs / totalCompleted : 0

    // Calculate average execution time from recent job history
    const allResults = Array.from(this.jobHistory.values()).flat()
    if (allResults.length > 0) {
      const totalTime = allResults.reduce((sum, result) => sum + result.executionTime, 0)
      this.metrics.averageExecutionTime = totalTime / allResults.length
    }
  }

  /**
   * Manually start processing (useful for tests)
   */
  start(): void {
    this.startProcessing()
  }

  /**
   * Cleanup method to stop processing and clear resources
   */
  destroy(): void {
    this.stopProcessing()
    this.jobQueue.clear()
    this.runningJobs.clear()
    this.jobHistory.clear()
  }

  /** Public stop method for admin controls */
  stop(): void {
    this.stopProcessing()
  }

  /**
   * Test-only method to manually set a job's status to running
   * @param jobId The ID of the job to set as running
   */
  _setJobAsRunningForTesting(jobId: string): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('This method is for testing purposes only.')
    }
    this.runningJobs.add(jobId)
  }
}

// Export singleton instance
// Only auto-start when explicitly enabled and on the server
// Auto-start in server environments so user-triggered scheduling works without ops toggles
const shouldAutoStart = typeof window === 'undefined'
export const scrapingScheduler = new ScrapingScheduler(shouldAutoStart)