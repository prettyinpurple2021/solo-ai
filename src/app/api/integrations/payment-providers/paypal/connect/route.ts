import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const AUTH_URL = PAYPAL_MODE === 'live'
  ? 'https://www.paypal.com/signin/authorize'
  : 'https://www.sandbox.paypal.com/signin/authorize'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!PAYPAL_CLIENT_ID) {
    return NextResponse.json({ error: 'PayPal Client ID not configured' }, { status: 500 })
  }

  const redirectUri = `${APP_URL}/api/integrations/payment-providers/paypal/callback`
  
  // Scopes for Log In with PayPal and transaction info
  // Full list: https://developer.paypal.com/docs/api-basics/notifications/webhooks/rest/
  const scopes = [
    'openid',
    'profile',
    'email',
    'https://uri.paypal.com/services/payments/realtimepayment',
    'https://uri.paypal.com/services/payments/payment/authcapture'
  ].join(' ')

  const params = new URLSearchParams({
    client_id: PAYPAL_CLIENT_ID,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    state: session.user.id // Pass user ID as state for security and identification
  })

  return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`)
}
