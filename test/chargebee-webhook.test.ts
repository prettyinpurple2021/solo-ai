jest.mock('@/lib/neon/client', () => ({
  getClient: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: jest.fn(),
  }),
}))

jest.mock('@/lib/idempotency', () => ({
  getIdempotencyKeyFromRequest: jest.fn().mockReturnValue('test-key'),
  reserveIdempotencyKey: jest.fn().mockResolvedValue(true),
}))

describe('Chargebee webhook', () => {
  it('rejects invalid signature', async () => {
    process.env.CHARGEBEE_WEBHOOK_SIGNING_KEY = 'secret'
    const { POST } = require('@/app/api/billing/chargebee/webhook/route') as typeof import('@/app/api/billing/chargebee/webhook/route')
    const body = JSON.stringify({ id: 'evt_1', event_type: 'subscription_created', content: {} })
    const req = new Request('http://localhost', { method: 'POST', body, headers: { 'x-chargebee-signature': 'bad', 'x-chargebee-timestamp': `${Math.floor(Date.now()/1000)}` } })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it('accepts duplicate events when idempotency key is already used → returns 409', async () => {
    process.env.CHARGEBEE_WEBHOOK_SIGNING_KEY = '' // bypass signature for this test
    jest.resetModules()
    jest.doMock('@/lib/idempotency', () => ({
      getIdempotencyKeyFromRequest: jest.fn().mockReturnValue('dup-key'),
      reserveIdempotencyKey: jest.fn().mockResolvedValue(false),
    }))
    const { POST } = require('@/app/api/billing/chargebee/webhook/route') as typeof import('@/app/api/billing/chargebee/webhook/route')
    const body = JSON.stringify({ id: 'evt_dup', event_type: 'subscription_created', content: {} })
    const req = new Request('http://localhost', { method: 'POST', body })
    const res = await POST(req as any)
    expect(res.status).toBe(409)
  })
})


