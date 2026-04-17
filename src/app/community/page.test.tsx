import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

const getCommunityFeedMock = jest.fn<(topicId?: string) => Promise<unknown[]>>(async () => [])
const getTopicsMock = jest.fn<() => Promise<unknown[]>>(async () => [])

let CommunityPage: (props: { searchParams?: unknown }) => Promise<unknown>
let dynamicConfig: string
let revalidateConfig: number

beforeAll(async () => {
  await jest.unstable_mockModule('@/lib/actions/community-actions', () => ({
    getCommunityFeed: getCommunityFeedMock,
    getTopics: getTopicsMock,
  }))

  await jest.unstable_mockModule('@/components/community/feed', () => ({
    Feed: () => null,
  }))

  await jest.unstable_mockModule('@/components/community/create-post-dialog', () => ({
    CreatePostDialog: () => null,
  }))

  const pageModule = await import('./page')
  CommunityPage = pageModule.default as (props: { searchParams?: unknown }) => Promise<unknown>
  dynamicConfig = pageModule.dynamic
  revalidateConfig = pageModule.revalidate
})

beforeEach(() => {
  getCommunityFeedMock.mockClear()
  getTopicsMock.mockClear()
})

describe('community page rendering config', () => {
  it('forces dynamic rendering to avoid build-time prerender DB access', () => {
    expect(dynamicConfig).toBe('force-dynamic')
    expect(revalidateConfig).toBe(0)
  })

  it('handles object searchParams and forwards topic id to feed query', async () => {
    await CommunityPage({ searchParams: { topicId: 'topic-123' } })
    expect(getCommunityFeedMock).toHaveBeenCalledWith('topic-123')
    expect(getTopicsMock).toHaveBeenCalledTimes(1)
  })

  it('handles promise-based searchParams and array topicId values', async () => {
    await CommunityPage({ searchParams: Promise.resolve({ topicId: ['topic-a', 'topic-b'] }) })
    expect(getCommunityFeedMock).toHaveBeenCalledWith('topic-a')
  })
})
