import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

type TestSearchParams = {
  topicId?: string | string[]
}

type TestTopic = {
  id: string
  name: string
  slug: string
  icon: string | null
}

const getCommunityFeedMock = jest.fn<(topicId?: string) => Promise<Array<{ id: string }>>>(async () => [{ id: 'post-1' }])
const getTopicsMock = jest.fn<() => Promise<TestTopic[]>>(async () => [
  { id: 'topic-1', name: 'General', slug: 'general', icon: null },
])

let CommunityPage: (props: { searchParams?: TestSearchParams | Promise<TestSearchParams> }) => Promise<unknown>
let pageDynamicConfig: string
let pageRevalidateConfig: number

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
  CommunityPage = pageModule.default as (props: { searchParams?: TestSearchParams | Promise<TestSearchParams> }) => Promise<unknown>
  pageDynamicConfig = pageModule.dynamic
  pageRevalidateConfig = pageModule.revalidate
})

beforeEach(() => {
  getCommunityFeedMock.mockClear()
  getTopicsMock.mockClear()
})

describe('community page rendering config', () => {
  it('forces dynamic rendering to avoid build-time prerender DB access', () => {
    expect(pageDynamicConfig).toBe('force-dynamic')
    expect(pageRevalidateConfig).toBe(0)
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
