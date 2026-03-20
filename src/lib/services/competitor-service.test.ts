/**
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { getIntelligencePageData } from './competitor-service'

jest.mock('../database-client', () => {
  const buildListChain = () => {
    const chain: Record<string, jest.Mock> = {}
    chain.select = jest.fn(() => chain)
    chain.from = jest.fn(() => chain)
    chain.leftJoin = jest.fn(() => chain)
    chain.where = jest.fn(() => chain)
    chain.orderBy = jest.fn(() => Promise.resolve([]))
    return chain
  }

  const buildCountChain = () => {
    const chain: Record<string, jest.Mock> = {}
    chain.select = jest.fn(() => chain)
    chain.from = jest.fn(() => chain)
    chain.where = jest.fn(() => Promise.resolve([{ count: 0 }]))
    return chain
  }

  const mockDb = {
    select: jest.fn(() => {
      const n = mockDb.select.mock.calls.length
      // getIntelligencePageData: two list queries (opportunities, alerts), then two count queries
      if (n <= 2) return buildListChain()
      return buildCountChain()
    }),
    query: {
      intelligenceData: {
        findMany: jest.fn<any>().mockResolvedValue([]),
      },
    },
  }

  return {
    getDb: jest.fn(() => mockDb),
    db: mockDb,
    withTransaction: jest.fn(),
    checkDatabaseHealth: jest.fn(),
  }
})

describe('CompetitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIntelligencePageData', () => {
    it('should fetch and format intelligence data correctly', async () => {
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
