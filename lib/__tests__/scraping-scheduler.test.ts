import { ScrapingScheduler } from '../database-scraping-scheduler'
import { queueProcessor } from '../scraping-queue-processor'

// Mock the database
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined)
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue([]),
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue([])
          })
        })
      })
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined)
      })
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined)
    })
  }
}))

describe('ScrapingScheduler', () => {
  let scheduler: ScrapingScheduler

  beforeEach(() => {
    scheduler = ScrapingScheduler.getInstance()
    jest.clearAllMocks()
  })

  afterEach(() => {
    scheduler.stop()
  })

  describe('createJob', () => {
    it('should create a new scraping job with valid parameters', async () => {
      const params = {
        competitorId: 1,
        userId: 'user123',
        jobType: 'website' as const,
        url: 'https://example.com',
        priority: 'medium' as const,
        frequencyType: 'interval' as const,
        frequencyValue: '360',
        config: {
          changeDetection: {
            enabled: true,
            threshold: 5
          }
        }
      }

      const jobId = await scheduler.createJob(params)
      
      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
    })

    it('should use default values for optional parameters', async () => {
      const params = {
        competitorId: 1,
        userId: 'user123',
        jobType: 'pricing' as const,
        url: 'https://example.com/pricing',
        frequencyValue: '180'
      }

      const jobId = await scheduler.createJob(params)
      
      expect(jobId).toBeDefined()
    })
  })

  describe('calculateNextRun', () => {
    it('should calculate correct next run time for interval frequency', () => {
      // Access private method through any cast for testing
      const nextRun = (scheduler as any).calculateNextRun('interval', '60')
      const now = new Date()
      const expected = new Date(now.getTime() + 60 * 60 * 1000)
      
      // Allow 1 second tolerance for test execution time
      expect(Math.abs(nextRun.getTime() - expected.getTime())).toBeLessThan(1000)
    })

    it('should handle manual frequency type', () => {
      const nextRun = (scheduler as any).calculateNextRun('manual', '60')
      const now = new Date()
      const oneYear = 365 * 24 * 60 * 60 * 1000
      
      expect(nextRun.getTime()).toBeGreaterThan(now.getTime() + oneYear - 1000)
    })
  })

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const delay1 = (scheduler as any).calculateRetryDelay(1)
      const delay2 = (scheduler as any).calculateRetryDelay(2)
      const delay3 = (scheduler as any).calculateRetryDelay(3)
      
      expect(delay2).toBeGreaterThan(delay1)
      expect(delay3).toBeGreaterThan(delay2)
      
      // Should not exceed 60 minutes (3600000 ms) plus jitter
      expect(delay3).toBeLessThan(3600000 * 1.1)
    })
  })

  describe('mapPriorityToImportance', () => {
    it('should map priorities correctly', () => {
      expect((scheduler as any).mapPriorityToImportance('critical')).toBe('critical')
      expect((scheduler as any).mapPriorityToImportance('high')).toBe('high')
      expect((scheduler as any).mapPriorityToImportance('medium')).toBe('medium')
      expect((scheduler as any).mapPriorityToImportance('low')).toBe('low')
      expect((scheduler as any).mapPriorityToImportance('unknown')).toBe('medium')
    })
  })
})

describe('ScrapingQueueProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    queueProcessor.stop()
  })

  describe('addJob', () => {
    it('should add a job to the queue', async () => {
      const params = {
        competitorId: 1,
        userId: 'user123',
        jobType: 'website' as const,
        url: 'https://example.com',
        frequencyValue: '360'
      }

      const jobId = await queueProcessor.addJob(params)
      
      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
    })
  })

  describe('createDefaultJobs', () => {
    it('should create default jobs for a competitor with domain', async () => {
      const competitorData = {
        domain: 'example.com',
        socialMediaHandles: {
          linkedin: 'https://linkedin.com/company/example',
          twitter: 'https://twitter.com/example'
        }
      }

      const jobIds = await queueProcessor.createDefaultJobs(1, 'user123', competitorData)
      
      expect(Array.isArray(jobIds)).toBe(true)
      expect(jobIds.length).toBeGreaterThan(0)
    })

    it('should handle competitor without domain', async () => {
      const competitorData = {
        socialMediaHandles: {
          linkedin: 'https://linkedin.com/company/example'
        }
      }

      const jobIds = await queueProcessor.createDefaultJobs(1, 'user123', competitorData)
      
      expect(Array.isArray(jobIds)).toBe(true)
    })
  })

  describe('getThreatLevelMultiplier', () => {
    it('should return correct multipliers for threat levels', () => {
      expect((queueProcessor as any).getThreatLevelMultiplier('critical')).toBe(4)
      expect((queueProcessor as any).getThreatLevelMultiplier('high')).toBe(2)
      expect((queueProcessor as any).getThreatLevelMultiplier('medium')).toBe(1)
      expect((queueProcessor as any).getThreatLevelMultiplier('low')).toBe(0.5)
      expect((queueProcessor as any).getThreatLevelMultiplier('unknown')).toBe(1)
    })
  })

  describe('chunkArray', () => {
    it('should chunk array correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const chunks = (queueProcessor as any).chunkArray(array, 3)
      
      expect(chunks).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10]
      ])
    })

    it('should handle empty array', () => {
      const chunks = (queueProcessor as any).chunkArray([], 3)
      expect(chunks).toEqual([])
    })
  })

  describe('getHealthStatus', () => {
    it('should return health status', () => {
      const health = queueProcessor.getHealthStatus()
      
      expect(health).toHaveProperty('isRunning')
      expect(health).toHaveProperty('processingInterval')
      expect(health).toHaveProperty('maxConcurrentJobs')
      expect(health).toHaveProperty('uptime')
      
      expect(typeof health.isRunning).toBe('boolean')
      expect(typeof health.processingInterval).toBe('number')
      expect(typeof health.maxConcurrentJobs).toBe('number')
      expect(typeof health.uptime).toBe('number')
    })
  })
})