/**
 * @jest-environment node
 *
 * ESM + experimental-vm-modules: register mocks before any static import of the module under test,
 * otherwise `competitor-service` may bind the real `database-client` before `jest.mock` applies.
 */
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
} from '@jest/globals'

type CompetitorServiceModule = typeof import('./competitor-service')

let getIntelligencePageData: CompetitorServiceModule['getIntelligencePageData']

beforeAll(async () => {
  await jest.unstable_mockModule('../database-client', () => {
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

  ;({ getIntelligencePageData } = await import('./competitor-service'))
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
