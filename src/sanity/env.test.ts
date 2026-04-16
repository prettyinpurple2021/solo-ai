import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  delete process.env.NEXT_PUBLIC_SANITY_DATASET
  delete process.env.NEXT_PUBLIC_SANITY_API_VERSION
})

afterAll(() => {
  process.env = originalEnv
})

describe('sanity env helpers', () => {
  it('returns null when required sanity vars are missing', async () => {
    const sanityEnv = await import('@/sanity/env')

    expect(sanityEnv.isSanityConfigured()).toBe(false)
    expect(sanityEnv.getSanityConfig()).toBeNull()
  })

  it('returns config when required sanity vars are set', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'project-id'
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = '2026-03-02'

    const sanityEnv = await import('@/sanity/env')

    expect(sanityEnv.isSanityConfigured()).toBe(true)
    expect(sanityEnv.getSanityConfig()).toEqual({
      projectId: 'project-id',
      dataset: 'production',
      apiVersion: '2026-03-02',
    })
  })
})
