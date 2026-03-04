/**
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { getIntelligencePageData } from './competitor-service'

// Mock the database
jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    query: {
      intelligenceData: {
        findMany: jest.fn<any>().mockResolvedValue([])
      }
    }
  }
}))

describe('CompetitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIntelligencePageData', () => {
    it('should fetch and format intelligence data correctly', async () => {
      // This test will fail initially because the method doesn't exist
      const userId = 'user-123'
      const data = await getIntelligencePageData(userId)
      
      expect(data).toHaveProperty('insights')
      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('market_position')
      expect(data).toHaveProperty('strategic_analysis')
      expect(Array.isArray(data.insights)).toBe(true)
    })
  })
})
