import { NextResponse } from 'next/server'

jest.mock('@/lib/auth-server', () => ({
  authenticateRequest: jest.fn(),
}))

jest.mock('@/lib/neon/server', () => ({
  createClient: jest.fn(),
}))

describe('DELETE /api/templates/[id]', () => {
  const { authenticateRequest } = jest.requireMock('@/lib/auth-server') as {
    authenticateRequest: jest.Mock
  }
  const { createClient } = jest.requireMock('@/lib/neon/server') as {
    createClient: jest.Mock
  }

  // Import after mocks are set up so the route uses the mocked modules
  const { DELETE } = require('@/app/api/templates/[id]/route') as typeof import('@/app/api/templates/[id]/route')

  function makeContext(id: string) {
    return { params: { id } } as any
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    authenticateRequest.mockResolvedValue({ user: null, error: 'No authentication token' })

    const res = (await DELETE(new Request('http://localhost'), makeContext('123'))) as NextResponse
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized' })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('returns 404 when template does not belong to user (rowCount 0)', async () => {
    authenticateRequest.mockResolvedValue({ user: { id: 'user-1' }, error: null })
    const queryMock = jest.fn().mockResolvedValue({ rowCount: 0 })
    createClient.mockResolvedValue({ query: queryMock })

    const res = (await DELETE(new Request('http://localhost'), makeContext('999'))) as NextResponse
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ error: 'Not found' })

    expect(queryMock).toHaveBeenCalledTimes(1)
    const [sql, params] = queryMock.mock.calls[0]
    expect(sql).toMatch(/DELETE FROM user_templates/i)
    expect(sql).toMatch(/WHERE id = \$1 AND user_id = \$2/i)
    expect(params).toEqual(['999', 'user-1'])
  })

  it('returns 204 when owned template is deleted (rowCount 1)', async () => {
    authenticateRequest.mockResolvedValue({ user: { id: 'user-2' }, error: null })
    const queryMock = jest.fn().mockResolvedValue({ rowCount: 1 })
    createClient.mockResolvedValue({ query: queryMock })

    const res = (await DELETE(new Request('http://localhost'), makeContext('42'))) as NextResponse
    expect(res.status).toBe(204)
    // no body on 204
    expect(queryMock).toHaveBeenCalledTimes(1)
    const [sql, params] = queryMock.mock.calls[0]
    expect(sql).toMatch(/DELETE FROM user_templates/i)
    expect(params).toEqual(['42', 'user-2'])
  })
})


