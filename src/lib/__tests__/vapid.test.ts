import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  delete process.env.VAPID_PUBLIC_KEY
  delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  delete process.env.VAPID_PRIVATE_KEY
  delete process.env.VAPID_CONTACT_EMAIL
})

afterAll(() => {
  process.env = originalEnv
})

describe('vapid helper', () => {
  it('returns null when required keys are missing', async () => {
    await jest.unstable_mockModule('server-only', () => ({}))
    const vapid = await import('@/lib/vapid')
    expect(vapid.getVapidKeys()).toBeNull()
    expect(vapid.ensureVapidConfigured()).toBe(false)
  })

  it('configures web-push when keys are present', async () => {
    await jest.unstable_mockModule('server-only', () => ({}))
    const setVapidDetails = jest.fn()
    await jest.unstable_mockModule('web-push', () => ({
      default: { setVapidDetails },
    }))

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'public'
    process.env.VAPID_PRIVATE_KEY = 'private'
    process.env.VAPID_CONTACT_EMAIL = 'alerts@example.com'

    const vapid = await import('@/lib/vapid')
    expect(vapid.ensureVapidConfigured()).toBe(true)
    expect(setVapidDetails).toHaveBeenCalledWith(
      'mailto:alerts@example.com',
      'public',
      'private'
    )
  })

  it('derives contact email from app URL when VAPID_CONTACT_EMAIL is unset', async () => {
    await jest.unstable_mockModule('server-only', () => ({}))
    const setVapidDetails = jest.fn()
    await jest.unstable_mockModule('web-push', () => ({
      default: { setVapidDetails },
    }))

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'public'
    process.env.VAPID_PRIVATE_KEY = 'private'
    Object.assign(process.env, {
      NEXT_PUBLIC_APP_URL: 'https://solosuccessai.fun',
    })

    const vapid = await import('@/lib/vapid')
    expect(vapid.ensureVapidConfigured()).toBe(true)
    expect(setVapidDetails).toHaveBeenCalledWith(
      'mailto:admin@solosuccessai.fun',
      'public',
      'private'
    )
  })

  it('reconfigures web-push when contact email changes', async () => {
    await jest.unstable_mockModule('server-only', () => ({}))
    const setVapidDetails = jest.fn()
    await jest.unstable_mockModule('web-push', () => ({
      default: { setVapidDetails },
    }))

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'public'
    process.env.VAPID_PRIVATE_KEY = 'private'
    process.env.VAPID_CONTACT_EMAIL = 'first@example.com'

    const vapid = await import('@/lib/vapid')
    expect(vapid.ensureVapidConfigured()).toBe(true)

    process.env.VAPID_CONTACT_EMAIL = 'second@example.com'
    expect(vapid.ensureVapidConfigured()).toBe(true)

    expect(setVapidDetails).toHaveBeenCalledTimes(2)
    expect(setVapidDetails).toHaveBeenNthCalledWith(
      1,
      'mailto:first@example.com',
      'public',
      'private'
    )
    expect(setVapidDetails).toHaveBeenNthCalledWith(
      2,
      'mailto:second@example.com',
      'public',
      'private'
    )
  })

  it('returns false when web-push rejects VAPID details', async () => {
    await jest.unstable_mockModule('server-only', () => ({}))
    const setVapidDetails = jest.fn(() => {
      throw new Error('invalid vapid')
    })
    await jest.unstable_mockModule('web-push', () => ({
      default: { setVapidDetails },
    }))

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'public'
    process.env.VAPID_PRIVATE_KEY = 'private'

    const vapid = await import('@/lib/vapid')
    expect(vapid.ensureVapidConfigured()).toBe(false)
  })
})
