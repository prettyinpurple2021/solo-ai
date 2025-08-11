import { NextRequest, NextResponse } from 'next/server'
import chargebee from 'chargebee'

// Initialize Chargebee client
chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { userId, email, planId, successUrl, cancelUrl } = await req.json()
    if (!userId || !email || !planId) {
      return NextResponse.json({ error: 'userId, email and planId are required' }, { status: 400 })
    }

    const hosted = await chargebee.hosted_page.checkout_new({
      subscription: { plan_id: planId },
      customer: { id: userId, email },
      redirect_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    }).request()

    return NextResponse.json({ hosted_page_url: hosted.hosted_page.url })
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Chargebee checkout init failed' }, { status: 500 })
  }
}


