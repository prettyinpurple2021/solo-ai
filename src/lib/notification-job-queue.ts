import { logError, logInfo,} from '@/lib/logger'
import { getSql } from '@/lib/api-utils'


export interface NotificationJob {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  // Targeting
  userIds?: string[]
  allUsers?: boolean
  // Scheduling
  scheduledTime: Date
  // Job metadata
  createdAt: Date
  createdBy: string
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  error?: string
  processedAt?: Date
}

export interface JobQueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  cancelled: number
  total: number
}

export class NotificationJobQueue {
  private static instance: NotificationJobQueue
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false
  private idleCyclesWithoutWork = 0
  private readonly IDLE_STOP_CYCLES = 40 // ~20 minutes at 30s interval
  private lastProcessedAt: Date | null = null

  static getInstance(): NotificationJobQueue {
    if (!NotificationJobQueue.instance) {
      NotificationJobQueue.instance = new NotificationJobQueue()
    }
    return NotificationJobQueue.instance
  }

  /**
   * Initialize the job queue tables
   */
  async initialize(): Promise<void> {
    const sql = getSql()
    await sql`
      CREATE TABLE IF NOT EXISTS notification_jobs (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT,
        badge TEXT,
        image TEXT,
        data JSONB,
        actions JSONB,
        tag VARCHAR(255),
        require_interaction BOOLEAN DEFAULT false,
        silent BOOLEAN DEFAULT false,
        vibrate INTEGER[],
        user_ids TEXT[],
        all_users BOOLEAN DEFAULT false,
        scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255) NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        error TEXT,
        processed_at TIMESTAMP WITH TIME ZONE
      )
    `

    // Create indexes separately
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_jobs_scheduled_time ON notification_jobs(scheduled_time)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON notification_jobs(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_jobs_created_by ON notification_jobs(created_by)`

    logInfo('Notification job queue initialized')
  }

  /**
   * Add a new notification job to the queue
   */
  async addJob(job: Omit<NotificationJob, 'id' | 'createdAt' | 'attempts' | 'status'>): Promise<string> {
    const jobId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const sql = getSql()

    await sql`
      INSERT INTO notification_jobs (
        id, title, body, icon, badge, image, data, actions, tag,
        require_interaction, silent, vibrate, user_ids, all_users,
        scheduled_time, created_at, created_by, attempts, max_attempts, status
      ) VALUES (
        ${jobId},
        ${job.title},
        ${job.body},
        ${job.icon || null},
        ${job.badge || null},
        ${job.image || null},
        ${job.data ? JSON.stringify(job.data) : null},
        ${job.actions ? JSON.stringify(job.actions) : null},
        ${job.tag || null},
        ${job.requireInteraction || false},
        ${job.silent || false},
        ${job.vibrate || null},
        ${job.userIds || null},
        ${job.allUsers || false},
        ${job.scheduledTime},
        ${now},
        ${job.createdBy},
        0,
        ${job.maxAttempts || 3},
        'pending'
      )
    `

    logInfo(`Added notification job ${jobId} scheduled for ${job.scheduledTime}`)

    // On-demand start for server environments: ensure processor is running when a job is added
    if (typeof window === 'undefined') {
      try {
        this.startProcessor()
      } catch { }
    }
    return jobId
  }

  /**
   * Get jobs that are ready to be processed
   */
  async getReadyJobs(limit: number = 10): Promise<NotificationJob[]> {
    const result = await getSql()(`
      SELECT * FROM notification_jobs
      WHERE status = 'pending' 
        AND scheduled_time <= NOW()
        AND attempts < max_attempts
      ORDER BY scheduled_time ASC
      LIMIT $1
    `, [limit])

    return result.map(row => ({
      id: row.id,
      title: row.title,
      body: row.body,
      icon: row.icon,
      badge: row.badge,
      image: row.image,
      data: row.data ? JSON.parse(row.data) : undefined,
      actions: row.actions ? JSON.parse(row.actions) : undefined,
      tag: row.tag,
      requireInteraction: row.require_interaction,
      silent: row.silent,
      vibrate: row.vibrate,
      userIds: row.user_ids,
      allUsers: row.all_users,
      scheduledTime: new Date(row.scheduled_time),
      createdAt: new Date(row.created_at),
      createdBy: row.created_by,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      status: row.status,
      error: row.error,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined
    }))
  }

  /**
   * Mark a job as processing
   */
  async markJobProcessing(jobId: string): Promise<void> {
    const sql = getSql()
    await sql`
      UPDATE notification_jobs 
      SET status = 'processing', attempts = attempts + 1
      WHERE id = ${jobId}
    `
  }

  /**
   * Mark a job as completed
   */
  async markJobCompleted(jobId: string): Promise<void> {
    const sql = getSql()
    await sql`
      UPDATE notification_jobs 
      SET status = 'completed', processed_at = NOW()
      WHERE id = ${jobId}
    `

    this.lastProcessedAt = new Date()
  }

  /**
   * Mark a job as failed
   */
  async markJobFailed(jobId: string, error: string): Promise<void> {
    const result = await getSql()(`
      UPDATE notification_jobs 
      SET error = $2, processed_at = NOW(),
          status = CASE 
            WHEN attempts >= max_attempts THEN 'failed'
            ELSE 'pending'
          END
      WHERE id = $1
      RETURNING attempts, max_attempts
    `, [jobId, error])

    const job = result[0]
    if (job && job.attempts >= job.max_attempts) {
      logError(`Job ${jobId} failed permanently after ${job.attempts} attempts`)
    } else {
      logError(`Job ${jobId} failed, will retry. Attempt ${job?.attempts || 0}/${job?.max_attempts || 3}`)
    }

    this.lastProcessedAt = new Date()
  }

  /**
   * Cancel a scheduled job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const result = await getSql()(`
      UPDATE notification_jobs 
      SET status = 'cancelled', processed_at = NOW()
      WHERE id = $1 AND status IN ('pending', 'processing')
      RETURNING id
    `, [jobId])

    return result.length > 0
  }

  /**
   * Get job queue statistics
   */
  async getStats(): Promise<JobQueueStats> {
    const result = await getSql()(`
      SELECT 
        status,
        COUNT(*) as count
      FROM notification_jobs
      GROUP BY status
    `)

    const stats: JobQueueStats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      total: 0
    }

    result.forEach(row => {
      const status = row.status as keyof JobQueueStats
      if (status in stats && status !== 'total') {
        stats[status] = parseInt(row.count)
        stats.total += parseInt(row.count)
      }
    })

    return stats
  }

  /**
   * Get jobs by status with pagination
   */
  async getJobs(
    status?: string,
    limit: number = 50,
    offset: number = 0,
    createdBy?: string
  ): Promise<{ jobs: NotificationJob[], total: number }> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (createdBy) {
      conditions.push(`created_by = $${paramIndex}`)
      params.push(createdBy)
      paramIndex++
    }

    const sql = getSql()
    const sqlClient = sql as any
    
    // Build safe queries using template literals when possible, unsafe when needed for dynamic WHERE
    let countRows: any[]
    let jobsRows: any[]
    
    if (conditions.length === 0) {
      // No conditions - safe to use template literal
      const countResult = await sql`SELECT COUNT(*) as total FROM notification_jobs`
      const jobsResult = await sql`
        SELECT * FROM notification_jobs 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countRows = Array.isArray(countResult) ? countResult : []
      jobsRows = Array.isArray(jobsResult) ? jobsResult : []
    } else if (typeof sqlClient.unsafe === 'function') {
      // Use unsafe for dynamic WHERE clauses (values are parameterized in conditions)
      const whereClause = conditions.join(' AND ')
      const countResult = await sqlClient.unsafe(
        `SELECT COUNT(*) as total FROM notification_jobs WHERE ${whereClause}`,
        params
      )
      const jobsResult = await sqlClient.unsafe(
        `SELECT * FROM notification_jobs WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      )
      countRows = Array.isArray(countResult) ? countResult : []
      jobsRows = Array.isArray(jobsResult) ? jobsResult : []
    } else {
      // Fallback: build query safely with template literal for known conditions
      if (status && !createdBy) {
        const countResult = await sql`SELECT COUNT(*) as total FROM notification_jobs WHERE status = ${status}`
        const jobsResult = await sql`
          SELECT * FROM notification_jobs 
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countRows = Array.isArray(countResult) ? countResult : []
        jobsRows = Array.isArray(jobsResult) ? jobsResult : []
      } else if (createdBy && !status) {
        const countResult = await sql`SELECT COUNT(*) as total FROM notification_jobs WHERE created_by = ${createdBy}`
        const jobsResult = await sql`
          SELECT * FROM notification_jobs 
          WHERE created_by = ${createdBy}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countRows = Array.isArray(countResult) ? countResult : []
        jobsRows = Array.isArray(jobsResult) ? jobsResult : []
      } else {
        const countResult = await sql`
          SELECT COUNT(*) as total FROM notification_jobs 
          WHERE status = ${status} AND created_by = ${createdBy}
        `
        const jobsResult = await sql`
          SELECT * FROM notification_jobs 
          WHERE status = ${status} AND created_by = ${createdBy}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countRows = Array.isArray(countResult) ? countResult : []
        jobsRows = Array.isArray(jobsResult) ? jobsResult : []
      }
    }
    
    const jobs = (jobsRows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      icon: row.icon,
      badge: row.badge,
      image: row.image,
      data: row.data ? (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) : undefined,
      actions: row.actions ? (typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions) : undefined,
      tag: row.tag,
      requireInteraction: row.require_interaction,
      silent: row.silent,
      vibrate: row.vibrate,
      userIds: row.user_ids,
      allUsers: row.all_users,
      scheduledTime: new Date(row.scheduled_time),
      createdAt: new Date(row.created_at),
      createdBy: row.created_by,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      status: row.status,
      error: row.error,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined
    }))

    const totalCount = countRows && countRows[0] ? (countRows[0].total || 0) : 0

    return {
      jobs,
      total: typeof totalCount === 'string' ? parseInt(totalCount) : totalCount
    }
  }

  /**
   * Clean up old completed and failed jobs
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    // Validate input to prevent injection
    if (typeof olderThanDays !== 'number' || olderThanDays < 0 || olderThanDays > 365 || !Number.isInteger(olderThanDays)) {
      throw new Error('Invalid olderThanDays parameter: must be an integer between 0 and 365')
    }

    // Use parameterized query with proper INTERVAL syntax to prevent SQL injection
    // olderThanDays is validated as an integer, and we use makeInterval for safety
    const sql = getSql()
    // Use make_interval function which safely handles integer multiplication
    const result = await sql`
      DELETE FROM notification_jobs 
      WHERE status IN ('completed', 'failed', 'cancelled')
        AND processed_at < NOW() - make_interval(days => ${olderThanDays})
      RETURNING id
    `

    const deletedCount = result.length
    if (deletedCount > 0) {
      logInfo(`Cleaned up ${deletedCount} old notification jobs older than ${olderThanDays} days`)
    }

    return deletedCount
  }

  /**
   * Start the job processor
   */
  startProcessor(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      logInfo('Job processor is already running')
      return
    }

    logInfo(`Starting notification job processor with ${intervalMs}ms interval`)

    this.processingInterval = setInterval(async () => {
      if (this.isProcessing) {
        logInfo('Skipping job processing - already in progress')
        return
      }

      try {
        const processed = await this.processJobs()
        if (processed === 0) {
          this.idleCyclesWithoutWork += 1
          if (this.idleCyclesWithoutWork >= this.IDLE_STOP_CYCLES) {
            logInfo('No jobs for a while; stopping notification job processor to save resources')
            this.stopProcessor()
            this.idleCyclesWithoutWork = 0
          }
        } else {
          this.idleCyclesWithoutWork = 0
        }
      } catch (error) {
        logError('Job processing error:', error)
      }
    }, intervalMs)
  }

  /**
   * Stop the job processor
   */
  stopProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
      logInfo('Job processor stopped')
    }
  }

  /**
   * Process ready jobs
   */
  private async processJobs(): Promise<number> {
    if (this.isProcessing) return 0

    this.isProcessing = true

    try {
      const jobs = await this.getReadyJobs(5) // Process 5 jobs at a time

      if (jobs.length === 0) {
        return 0
      }

      logInfo(`Processing ${jobs.length} notification jobs`)

      for (const job of jobs) {
        try {
          await this.markJobProcessing(job.id)
          await this.processJob(job)
          await this.markJobCompleted(job.id)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await this.markJobFailed(job.id, errorMessage)
        }
      }
      return jobs.length
    } finally {
      this.isProcessing = false
    }
  }

  /** Public status summary for admin */
  getStatus(): { running: boolean; lastProcessedAt: string | null } {
    return {
      running: this.processingInterval !== null,
      lastProcessedAt: this.lastProcessedAt ? this.lastProcessedAt.toISOString() : null
    }
  }

  /**
   * Process a single job by sending the notification
   */
  private async processJob(job: NotificationJob): Promise<void> {
    // Make internal API call to send the notification
    const payload = {
      title: job.title,
      body: job.body,
      icon: job.icon,
      badge: job.badge,
      image: job.image,
      data: job.data,
      actions: job.actions,
      tag: job.tag,
      requireInteraction: job.requireInteraction,
      silent: job.silent,
      vibrate: job.vibrate,
      userIds: job.userIds,
      allUsers: job.allUsers
    }

    // Create a system request to send the notification
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use a system token or bypass auth for internal job processing
        'X-System-Job': 'true',
        'X-Job-Id': job.id
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send notification: ${error}`)
    }

    logInfo(`Successfully processed notification job ${job.id}`)
  }
}

// Export singleton instance
export const notificationJobQueue = NotificationJobQueue.getInstance()