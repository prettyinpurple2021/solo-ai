import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Stripe Connect OAuth callback handler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Contains user ID
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      logError('Stripe Connect OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_error=${encodeURIComponent(error)}&stripe_error_description=${encodeURIComponent(errorDescription || '')}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_error=no_code`
      )
    }

    if (!state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_error=no_state`
      )
    }

    // Redirect to settings page with code for frontend to handle
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_code=${encodeURIComponent(code)}&stripe_state=${encodeURIComponent(state)}`
    )
  } catch (error) {
    logError('Stripe Connect callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_error=unknown`
    )
  }
}

