import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequestBody,
  handleApiError 
} from '@/lib/api-response'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createToken } from '@/lib/auth-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for signin request
const SigninSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  isEmail: z.boolean().optional()
})

interface SigninResponse {
  token: string
  user: {
    id: string
    email: string
    full_name: string | null
    username: string | null
    subscription_tier: string
    subscription_status: string
    onboarding_completed: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, SigninSchema)
    if (!validation.success) {
      return (validation as { success: false; error: any }).error
    }

    const { identifier, password, isEmail } = validation.data as z.infer<typeof SigninSchema>

    const db = getDb()

    // Determine if identifier is email or username
    const identifierIsEmail = isEmail ?? identifier.includes('@')
    const normalizedIdentifier = identifier.toLowerCase()

    // Get user from database - check both email and username
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        full_name: users.full_name,
        username: users.username,
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        onboarding_completed: users.onboarding_completed,
        created_at: users.created_at
      })
      .from(users)
      .where(
        identifierIsEmail 
          ? eq(users.email, normalizedIdentifier)
          : eq(users.username, normalizedIdentifier)
      )
      .limit(1)

    if (userResults.length === 0) {
      return createErrorResponse('Invalid email/username or password', 401)
    }

    const user = userResults[0]

    // Check if user has a password
    if (!user.password) {
      return createErrorResponse('Please set up a password for your account', 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return createErrorResponse('Invalid email/username or password', 401)
    }

    // Generate JWT token using centralized utility
    const token = await createToken(user.id)

    // Prepare user data for response (exclude sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      subscription_tier: user.subscription_tier || 'free',
      subscription_status: user.subscription_status || 'active',
      onboarding_completed: user.onboarding_completed || false
    }

    const response: SigninResponse = {
      token,
      user: userData
    }

    return createSuccessResponse(response, 'Sign in successful')

  } catch (error) {
    return handleApiError(error, 'Sign in')
  }
}


