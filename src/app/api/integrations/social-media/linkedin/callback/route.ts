import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * LinkedIn OAuth callback handler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Contains user ID
    const error = searchParams.get('error')

    if (error) {
      logError('LinkedIn OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?linkedin_error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?linkedin_error=no_code`
      )
    }

    if (!state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?linkedin_error=no_state`
      )
    }

    // Redirect to settings page with code for frontend to handle
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?linkedin_code=${encodeURIComponent(code)}&linkedin_state=${encodeURIComponent(state)}`
    )
  } catch (error) {
    logError('LinkedIn callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?linkedin_error=unknown`
    )
  }
}

