import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getClient } from '@/lib/neon/client'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'
import { logApiEvent } from '@/lib/log'

function verifySignature(payload: string, signature: string, timestamp?: string) {
  const secret = process.env.CHARGEBEE_WEBHOOK_SIGNING_KEY
  if (!secret) return true // allow if not configured

  // Optional timestamp tolerance (5 minutes)
  if (timestamp) {
    const tsNum = Number(timestamp)
    if (!Number.isNaN(tsNum)) {
      const now = Math.floor(Date.now() / 1000)
      if (Math.abs(now - tsNum) > 300) {
        return false
      }
    }
  }

  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-chargebee-signature') || ''
  const timestamp = req.headers.get('x-chargebee-timestamp') || undefined
  if (!verifySignature(rawBody, signature, timestamp)) {
    logApiEvent({ level: 'warn', route: '/api/billing/chargebee/webhook', status: 401, message: 'Invalid signature', meta: { signaturePresent: !!signature, timestamp } })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(rawBody)
  const client = await getClient()
  
  try {
    // Idempotency using Chargebee Event ID or provided key
    const incomingKey = getIdempotencyKeyFromRequest(req) || event.id
    if (incomingKey) {
      const reserved = await reserveIdempotencyKey(client as any, `chargebee:${incomingKey}`)
      if (!reserved) {
        logApiEvent({ level: 'info', route: '/api/billing/chargebee/webhook', status: 409, message: 'Duplicate event', meta: { eventId: incomingKey } })
        return NextResponse.json({ error: 'Duplicate event' }, { status: 409 })
      }
    }

    const _type: string = event.event_type
    const subscription = event.content?.subscription
    const customer = event.content?.customer
    
    if (subscription && customer) {
      const tier = subscription.plan_id
      const status = subscription.status
      await client.query(
        `UPDATE users SET subscription_tier = $1, subscription_status = $2 WHERE id = $3` ,
        [tier, status, customer.id]
      )
    }
    logApiEvent({ level: 'info', route: '/api/billing/chargebee/webhook', status: 200, message: 'Event processed', meta: { type: _type, customerId: customer?.id, subscriptionId: subscription?.id } })
    return NextResponse.json({ received: true })
  } catch (error) {
    logApiEvent({ level: 'error', route: '/api/billing/chargebee/webhook', status: 500, message: 'Webhook processing error', meta: { error: (error as Error)?.message } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    client.release()
  }
}


