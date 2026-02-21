import { NextRequest, NextResponse } from 'next/server'
import { listStripeCustomers, getStripeCustomersPaginated, isStripeConfigured } from '@/lib/stripe'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const startingAfter = searchParams.get('starting_after') || undefined
    const paginated = searchParams.get('paginated') === 'true'

    if (paginated) {
      // Return paginated results
      const result = await getStripeCustomersPaginated(limit, startingAfter)
      return NextResponse.json({
        customers: result.customers,
        hasMore: result.hasMore,
        nextStartingAfter: result.nextStartingAfter,
        count: result.customers.length
      })
    } else {
      // Return simple list
      const customers = await listStripeCustomers(limit, startingAfter)
      return NextResponse.json({
        customers,
        count: customers.length
      })
    }

  } catch (error) {
    logError('Failed to list Stripe customers', { error: error instanceof Error ? error.message : String(error) })
    
    return NextResponse.json(
      { error: 'Failed to list customers' },
      { status: 500 }
    )
  }
}
