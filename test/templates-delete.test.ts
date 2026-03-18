import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const verifyAuthMock = jest.fn()

const limitMock = jest.fn()
const whereMock = jest.fn(() => ({ limit: limitMock }))
const fromMock = jest.fn(() => ({ where: whereMock }))
const selectMock = jest.fn(() => ({ from: fromMock }))
const deleteWhereMock = jest.fn()
const deleteMock = jest.fn(() => ({ where: deleteWhereMock }))

jest.mock('@/lib/auth-server', () => ({
  verifyAuth: verifyAuthMock,
}))

jest.mock('@/db', () => ({
  db: {
    select: selectMock,
    delete: deleteMock,
  },
}))

jest.mock('@/shared/db/schema', () => ({
  templates: {
    id: 'id',
    user_id: 'user_id',
  },
}))

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => ({ kind: 'eq', args }),
  and: (...args: unknown[]) => ({ kind: 'and', args }),
}))

describe('DELETE /api/templates/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    verifyAuthMock.mockResolvedValue({ user: null, error: 'Unauthorized' })
    const { DELETE } = await import('@/app/api/templates/[id]/route')

    const res = await DELETE(
      new Request('http://localhost') as any,
      { params: Promise.resolve({ id: '123' }) }
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 404 when template is not owned by the user', async () => {
    verifyAuthMock.mockResolvedValue({ user: { id: 'user-1' }, error: null })
    limitMock.mockResolvedValue([])
    const { DELETE } = await import('@/app/api/templates/[id]/route')

    const res = await DELETE(
      new Request('http://localhost') as any,
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
    const { DELETE } = await import('@/app/api/templates/[id]/route')

    const res = await DELETE(
      new Request('http://localhost') as any,
      { params: Promise.resolve({ id: 'template-2' }) }
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(deleteMock).toHaveBeenCalled()
    expect(deleteWhereMock).toHaveBeenCalled()
  })
})


