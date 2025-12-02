import { ScrapingScheduler } from '@/lib/scraping-scheduler'

// Mock the web scraping service
jest.mock('@/lib/web-scraping-service', () => ({
  webScrapingService: {
    scrapeCompetitorWebsite: jest.fn(),
    monitorPricingPages: jest.fn(),
    trackProductPages: jest.fn(),
    scrapeJobPostings: jest.fn(),
  },
}))

describe('ScrapingScheduler', () => {
  let scheduler: ScrapingScheduler

  beforeEach(() => {
    jest.useFakeTimers()
    scheduler = new ScrapingScheduler(false) // Don't auto-start during tests
    jest.clearAllMocks()
  })

  afterEach(() => {
    scheduler.destroy()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('scheduleJob', () => {
    it('should schedule a new scraping job', async () => {
      const jobId = await scheduler.scheduleJob(
        1, // competitorId
        'user123',
        'website',
        'https://example.com',
        { type: 'interval', value: 720 }
      )

      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')

      const job = scheduler.getJob(jobId)
      expect(job).toBeDefined()
      expect(job?.competitorId).toBe(1)
      expect(job?.userId).toBe('user123')
      expect(job?.jobType).toBe('website')
      expect(job?.url).toBe('https://example.com')
      expect(job?.status).toBe('pending')
    })

    it('should generate unique job IDs for different jobs', async () => {
      const jobId1 = await scheduler.scheduleJob(
        1, 'user123', 'website', 'https://example.com',
        { type: 'interval', value: 720 }
      )

      const jobId2 = await scheduler.scheduleJob(
        1, 'user123', 'pricing', 'https://example.com/pricing',
        { type: 'interval', value: 720 }
      )

      expect(jobId1).not.toBe(jobId2)
    })

    it('should set appropriate priority based on job type', async () => {
      const pricingJobId = await scheduler.scheduleJob(
        1, 'user123', 'pricing', 'https://example.com/pricing',
        { type: 'interval', value: 720 }
      )

      const jobsJobId = await scheduler.scheduleJob(
        1, 'user123', 'jobs', 'https://example.com/careers',
        { type: 'interval', value: 720 }
      )

      const pricingJob = scheduler.getJob(pricingJobId)
      const jobsJob = scheduler.getJob(jobsJobId)

      expect(pricingJob?.priority).toBe('high')
      expect(jobsJob?.priority).toBe('low')
    })

    it('should handle errors in scheduleJob', async () => {
      // Mock the generateJobId method to throw an error
      const originalGenerateJobId = (scheduler as any).generateJobId
        ; (scheduler as any).generateJobId = jest.fn().mockImplementation(() => {
          throw new Error('Test error')
        })

      await expect(scheduler.scheduleJob(
        1, 'user123', 'website', 'https://example.com',
        { type: 'interval', value: 720 }
      )).rejects.toThrow('Test error')

        // Restore original method
        ; (scheduler as any).generateJobId = originalGenerateJobId
    })
  })

  describe('scheduleCompetitorJobs', () => {
    it('should schedule multiple jobs for a competitor', async () => {
      const competitor = {
        id: 1,
        name: 'Test Competitor',
        domain: 'example.com',
        threatLevel: 'high' as const,
        userId: 'user123',
        monitoringStatus: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: undefined,
        industry: undefined,
        headquarters: undefined,
        foundedYear: undefined,
        employeeCount: undefined,
        socialMediaHandles: {},
        keyPersonnel: [],
        products: [],
        marketPosition: {
          targetMarkets: [],
          competitiveAdvantages: [],
          marketSegments: []
        },
        competitiveAdvantages: [],
        vulnerabilities: [],
        monitoringConfig: {
          websiteMonitoring: true,
          socialMediaMonitoring: true,
          newsMonitoring: true,
          jobPostingMonitoring: true,
          appStoreMonitoring: true,
          monitoringFrequency: 'daily' as const,
          alertThresholds: {
            pricing: true,
            productLaunches: true,
            hiring: true,
            funding: true,
            partnerships: true
          }
        },
        lastAnalyzed: undefined
      }

      const jobIds = await scheduler.scheduleCompetitorJobs(competitor, 'user123')

      expect(jobIds.length).toBeGreaterThan(0)

      // Should schedule at least website monitoring
      const jobs = jobIds.map(id => scheduler.getJob(id)).filter(Boolean)
      expect(jobs.some(job => job?.jobType === 'website')).toBe(true)
    })

    it('should set frequency based on threat level', async () => {
      const criticalCompetitor = {
        id: 1,
        name: 'Critical Competitor',
        domain: 'critical.com',
        threatLevel: 'critical' as const,
        userId: 'user123',
        monitoringStatus: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialMediaHandles: {},
        keyPersonnel: [],
        products: [],
        marketPosition: {
          targetMarkets: [],
          competitiveAdvantages: [],
          marketSegments: []
        },
        competitiveAdvantages: [],
        vulnerabilities: [],
        monitoringConfig: {
          websiteMonitoring: true,
          socialMediaMonitoring: true,
          newsMonitoring: true,
          jobPostingMonitoring: true,
          appStoreMonitoring: true,
          monitoringFrequency: 'daily' as const,
          alertThresholds: {
            pricing: true,
            productLaunches: true,
            hiring: true,
            funding: true,
            partnerships: true
          }
        }
      }

      const lowCompetitor = {
        id: 2,
        name: 'Low Competitor',
        domain: 'low.com',
        threatLevel: 'low' as const,
        userId: 'user123',
        monitoringStatus: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialMediaHandles: {},
        keyPersonnel: [],
        products: [],
        marketPosition: {
          targetMarkets: [],
          competitiveAdvantages: [],
          marketSegments: []
        },
        competitiveAdvantages: [],
        vulnerabilities: [],
        monitoringConfig: {
          websiteMonitoring: true,
          socialMediaMonitoring: true,
          newsMonitoring: true,
          jobPostingMonitoring: true,
          appStoreMonitoring: true,
          monitoringFrequency: 'daily' as const,
          alertThresholds: {
            pricing: true,
            productLaunches: true,
            hiring: true,
            funding: true,
            partnerships: true
          }
        }
      }

      const criticalJobIds = await scheduler.scheduleCompetitorJobs(criticalCompetitor, 'user123')
      const lowJobIds = await scheduler.scheduleCompetitorJobs(lowCompetitor, 'user123')

      const criticalJob = scheduler.getJob(criticalJobIds[0])
      const lowJob = scheduler.getJob(lowJobIds[0])

      // Critical competitors should be monitored more frequently
      expect(criticalJob?.frequency.value).toBeLessThan(lowJob?.frequency.value as number)
    })
  })

  describe('job control', () => {
    let jobId: string

    beforeEach(async () => {
      jobId = await scheduler.scheduleJob(
        1, 'user123', 'website', 'https://example.com',
        { type: 'interval', value: 720 }
      )
    })

    it('should pause a job', () => {
      const success = scheduler.pauseJob(jobId)
      expect(success).toBe(true)

      const job = scheduler.getJob(jobId)
      expect(job?.status).toBe('paused')
    })

    it('should resume a paused job', () => {
      scheduler.pauseJob(jobId)
      const success = scheduler.resumeJob(jobId)
      expect(success).toBe(true)

      const job = scheduler.getJob(jobId)
      expect(job?.status).toBe('pending')
    })

    it('should cancel a job', () => {
      const success = scheduler.cancelJob(jobId)
      expect(success).toBe(true)

      // Job should be removed or marked for removal
      const job = scheduler.getJob(jobId)
      expect(job).toBeNull()
    })

    it('should not resume a non-paused job', () => {
      const success = scheduler.resumeJob(jobId) // Job is pending, not paused
      expect(success).toBe(false)
    })
  })

  describe('getCompetitorJobs', () => {
    it('should return jobs for a specific competitor', async () => {
      const competitor1JobId = await scheduler.scheduleJob(
        1, 'user123', 'website', 'https://competitor1.com',
        { type: 'interval', value: 720 }
      )

      const competitor2JobId = await scheduler.scheduleJob(
        2, 'user123', 'website', 'https://competitor2.com',
        { type: 'interval', value: 720 }
      )

      const competitor1Jobs = scheduler.getCompetitorJobs(1)
      const competitor2Jobs = scheduler.getCompetitorJobs(2)

      expect(competitor1Jobs).toHaveLength(1)
      expect(competitor2Jobs).toHaveLength(1)
      expect(competitor1Jobs[0].id).toBe(competitor1JobId)
      expect(competitor2Jobs[0].id).toBe(competitor2JobId)
    })

    it('should return empty array for competitor with no jobs', () => {
      const jobs = scheduler.getCompetitorJobs(999)
      expect(jobs).toHaveLength(0)
    })
  })

  describe('job cancellation', () => {
    it('should allow cancelling a running job', async () => {
      const jobId = await scheduler.scheduleJob(
        1, 'user123', 'website', 'https://example.com',
        { type: 'interval', value: 720 }
      )

      // Manually set the job as running for the test
      scheduler._setJobAsRunningForTesting(jobId)

      const success = scheduler.cancelJob(jobId)
      expect(success).toBe(true)

      const job = scheduler.getJob(jobId)
      expect(job?.status).toBe('cancelled')

      // Simulate job completion by calling processJob, which should handle the cleanup
      await (scheduler as any).processJob(job)

      expect(scheduler.getJob(jobId)).toBeNull()
    })
  })

  describe('metrics', () => {
    it('should provide accurate metrics', async () => {
      // Schedule some jobs
      await scheduler.scheduleJob(1, 'user123', 'website', 'https://example.com', { type: 'interval', value: 720 })
      await scheduler.scheduleJob(2, 'user123', 'pricing', 'https://example2.com', { type: 'interval', value: 720 })

      const metrics = scheduler.getMetrics()

      expect(metrics.totalJobs).toBe(2)
      expect(metrics.pendingJobs).toBe(2)
      expect(metrics.runningJobs).toBe(0)
      expect(metrics.completedJobs).toBe(0)
      expect(metrics.failedJobs).toBe(0)
    })

    it('should update metrics when job status changes', async () => {
      const jobId = await scheduler.scheduleJob(1, 'user123', 'website', 'https://example.com', { type: 'interval', value: 720 })

      scheduler.pauseJob(jobId)
      const metrics = scheduler.getMetrics()

      expect(metrics.pendingJobs).toBe(0) // Job is now paused
    })
  })

  describe('job history', () => {
    it('should maintain job execution history', async () => {
      const jobId = await scheduler.scheduleJob(1, 'user123', 'website', 'https://example.com', { type: 'interval', value: 720 })

      // Initially no history
      const initialHistory = scheduler.getJobHistory(jobId)
      expect(initialHistory).toHaveLength(0)

      // History would be populated after job execution
      // This would require mocking the actual execution process
    })
  })

  describe('validation', () => {
    it('should validate scraping results', () => {
      const mockJob = {
        id: 'test-job',
        jobType: 'website' as const,
        competitorId: 1,
        userId: 'user123',
        url: 'https://example.com',
        priority: 'medium' as const,
        frequency: { type: 'interval' as const, value: 720 },
        nextRunAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'pending' as const,
        config: {
          enableChangeDetection: true,
          changeThreshold: 0.1,
          notifyOnChange: true,
          storeHistory: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Valid result
      const validResult = {
        success: true,
        data: {
          url: 'https://example.com',
          title: 'Test Site',
          content: 'Some content',
          metadata: {},
          scrapedAt: new Date(),
          responseTime: 1000,
          statusCode: 200,
        },
        retryCount: 0,
        responseTime: 1000,
        cached: false,
      }

      const validation = scheduler.validateScrapingResult(validResult, mockJob)
      expect(validation.isValid).toBe(true)
      expect(validation.confidence).toBeGreaterThan(0.5)

      // Invalid result
      const invalidResult = {
        success: false,
        error: 'Network error',
        retryCount: 1,
        responseTime: 5000,
        cached: false,
      }

      const invalidValidation = scheduler.validateScrapingResult(invalidResult, mockJob)
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.confidence).toBe(0)
    })
  })
})