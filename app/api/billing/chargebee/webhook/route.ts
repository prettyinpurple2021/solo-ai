import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getClient } from '@/lib/neon/client'

function verifySignature(payload: string, signature: string) {
  const secret = process.env.CHARGEBEE_WEBHOOK_SIGNING_KEY
  if (!secret) return true // allow if not configured
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-chargebee-signature') || ''
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(rawBody)
  const client = await getClient()
  
  try {
    const type: string = event.event_type
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
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    client.release()
  }
}


