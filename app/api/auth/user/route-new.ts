
import {
  createSuccessResponse,
  createErrorResponse,
  withAuth,
  handleApiError
} from '@/lib/api-response'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for query parameters
const UserQuerySchema = z.object({
  include_subscription: z.string().optional().transform(val => val === 'true'),
  include_metadata: z.string().optional().transform(val => val === 'true')
})

export const GET = withAuth(async (request: Request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryResult = UserQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

    if (!queryResult.success) {
      return createErrorResponse('Invalid query parameters', 400)
    }

    const { include_subscription, include_metadata } = queryResult.data

    // Build select fields based on query parameters
    const selectFields = {
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      username: users.username,
      date_of_birth: users.date_of_birth,
      created_at: users.created_at,
      updated_at: users.updated_at,
      ...(include_subscription && {
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        stripe_customer_id: users.stripe_customer_id,
        stripe_subscription_id: users.stripe_subscription_id,
        current_period_start: users.current_period_start,
        current_period_end: users.current_period_end,
        cancel_at_period_end: users.cancel_at_period_end
      }),
      ...(include_metadata && {
        avatar_url: users.avatar_url,
        is_verified: users.is_verified,
        onboarding_completed: users.onboarding_completed
      })
    }

    const db = getDb()
    const userResults = await db
      .select(selectFields)
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (userResults.length === 0) {
      return createErrorResponse('User not found', 404)
    }

    const userData = userResults[0]

    return createSuccessResponse(userData, 'User data retrieved successfully')

  } catch (error) {
    return handleApiError(error, 'Get user data')
  }
})


