import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals'

type VerifyAuthResult = {
  user: { id: string } | null
  error: string | null | undefined
}

type TemplateOwnershipRow = {
  id: string
  user_id: string
}

const verifyAuthMock = jest.fn<() => Promise<VerifyAuthResult>>()

const limitMock = jest.fn<() => Promise<TemplateOwnershipRow[]>>()
const whereMock = jest.fn(() => ({ limit: limitMock }))
const fromMock = jest.fn(() => ({ where: whereMock }))
const selectMock = jest.fn(() => ({ from: fromMock }))
const deleteWhereMock = jest.fn<() => Promise<Array<{ id: string }>>>()
const deleteMock = jest.fn(() => ({ where: deleteWhereMock }))

let DELETE: any

beforeAll(async () => {
  await jest.unstable_mockModule('next/server', () => {
    class MockNextResponse {
      status: number
      private body: unknown
      constructor(body: unknown, init?: { status?: number }) {
        this.body = body
        this.status = init?.status ?? 200
      }
      static json(body: unknown, init?: { status?: number }) {
        return new MockNextResponse(body, init)
      }
      async json() {
        return this.body
      }
    }

    return {
      NextResponse: MockNextResponse,
    }
  })

  await jest.unstable_mockModule('@/lib/auth-server', () => ({
    verifyAuth: verifyAuthMock,
  }))

  await jest.unstable_mockModule('@/db', () => ({
    db: {
      select: selectMock,
      delete: deleteMock,
    },
  }))

  await jest.unstable_mockModule('@/shared/db/schema', () => ({
    templates: {
      id: 'id',
      user_id: 'user_id',
    },
  }))

  await jest.unstable_mockModule('drizzle-orm', () => ({
    eq: (...args: unknown[]) => ({ kind: 'eq', args }),
    and: (...args: unknown[]) => ({ kind: 'and', args }),
  }))

  const routeMod = await import('@/app/api/templates/[id]/route')
  DELETE = routeMod.DELETE
})

describe('DELETE /api/templates/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    verifyAuthMock.mockResolvedValue({ user: null, error: 'Unauthorized' })
    const res = await DELETE(
      {} as any,
      { params: Promise.resolve({ id: '123' }) }
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 404 when template is not owned by the user', async () => {
    verifyAuthMock.mockResolvedValue({ user: { id: 'user-1' }, error: null })
    limitMock.mockResolvedValue([])
    const res = await DELETE(
      {} as any,
      { params: Promise.resolve({ id: 'template-1' }) }
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Template not found or unauthorized' })
    expect(selectMock).toHaveBeenCalled()
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('returns success when owned template is deleted', async () => {
    verifyAuthMock.mockResolvedValue({ user: { id: 'user-2' }, error: null })
    limitMock.mockResolvedValue([{ id: 'template-2', user_id: 'user-2' }])
    deleteWhereMock.mockResolvedValue([{ id: 'template-2' }])
    const res = await DELETE(
      {} as any,
      { params: Promise.resolve({ id: 'template-2' }) }
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(deleteMock).toHaveBeenCalled()
    expect(deleteWhereMock).toHaveBeenCalled()
  })
})


