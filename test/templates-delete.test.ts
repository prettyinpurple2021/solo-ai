import { NextResponse, NextRequest } from 'next/server'

jest.mock('@/lib/auth-server', () => ({
  authenticateRequest: jest.fn(),
}))

jest.mock('@/lib/database-client', () => ({
  getDb: jest.fn(),
}))

describe('DELETE /api/templates/[id]', () => {
  const { authenticateRequest } = jest.requireMock('@/lib/auth-server') as {
    authenticateRequest: jest.Mock
  }
  const { getDb } = jest.requireMock('@/lib/database-client') as {
    getDb: jest.Mock
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

    const res = (await DELETE(new NextRequest('http://localhost'), makeContext('123'))) as NextResponse
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized' })
    expect(getDb).not.toHaveBeenCalled()
  })

  it('returns 404 when template does not belong to user (rowCount 0)', async () => {
    authenticateRequest.mockResolvedValue({ user: { id: 'user-1' }, error: null })
    const queryMock = jest.fn().mockResolvedValue({ rowCount: 0 })
    const dbMock = { execute: queryMock }
    getDb.mockReturnValue(dbMock)

    const res = (await DELETE(new NextRequest('http://localhost'), makeContext('999'))) as NextResponse
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ error: 'Not found' })

    expect(queryMock).toHaveBeenCalledTimes(1)
    // Check that the template literal was called with the correct SQL
    // normalize the SQL arg (handles plain string, TemplateStringsArray, or SQL object)
    const [sqlArg] = queryMock.mock.calls[0]
    let sql: string

    if (sqlArg && typeof sqlArg === 'object' && sqlArg.queryChunks) {
      // Handle Drizzle SQL object - extract string chunks and join them
      // The queryChunks array contains StringChunk objects and parameter values
      // We'll reconstruct the SQL template with placeholders
      const stringChunks = sqlArg.queryChunks.filter((chunk: any) => chunk.value && Array.isArray(chunk.value))
      sql = stringChunks.map((chunk: any) => chunk.value.join('')).join('')
    } else if (Array.isArray(sqlArg)) {
      // Handle TemplateStringsArray
      sql = sqlArg.join('')
    } else {
      // Handle plain string
      sql = String(sqlArg)
    }

    expect(sql).toMatch(/DELETE FROM user_templates/i)
    expect(sql).toMatch(/WHERE id = .* AND user_id = /i)
  })

  it('returns 204 when owned template is deleted (rowCount 1)', async () => {
    authenticateRequest.mockResolvedValue({ user: { id: 'user-2' }, error: null })
    const queryMock = jest.fn().mockResolvedValue({ rowCount: 1 })
    const dbMock = { execute: queryMock }
    getDb.mockReturnValue(dbMock)

    const res = (await DELETE(new NextRequest('http://localhost'), makeContext('42'))) as NextResponse
    expect(res.status).toBe(204)
    // no body on 204
    expect(queryMock).toHaveBeenCalledTimes(1)
    // Check that the template literal was called with the correct SQL
    const [sqlArg] = queryMock.mock.calls[0]
    let sql: string

    if (sqlArg && typeof sqlArg === 'object' && sqlArg.queryChunks) {
      // Handle Drizzle SQL object - extract string chunks and join them
      const stringChunks = sqlArg.queryChunks.filter((chunk: any) => chunk.value && Array.isArray(chunk.value))
      sql = stringChunks.map((chunk: any) => chunk.value.join('')).join('')
    } else if (Array.isArray(sqlArg)) {
      // Handle TemplateStringsArray
      sql = sqlArg.join('')
    } else {
      // Handle plain string
      sql = String(sqlArg)
    }

    expect(sql).toMatch(/DELETE FROM user_templates/i)
  })
})


