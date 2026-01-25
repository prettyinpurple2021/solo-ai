import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { logError } from './logger'

/**
 * Standardized API response utilities for consistent frontend/backend communication
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  return NextResponse.json(response, { status })
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  return NextResponse.json(response, { status: 200 })
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  // Log error for debugging
  logError('API Error Response:', {
    error,
    status,
    details,
    timestamp: response.meta?.timestamp
  })

  return NextResponse.json(response, { status })
}

/**
 * Handle API route errors consistently
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  const fullContext = context ? `${context}: ${errorMessage}` : errorMessage

  logError('API Route Error:', {
    error: errorMessage,
    context,
    stack: error instanceof Error ? error.stack : undefined
  })

  // Determine appropriate status code based on error type
  let status = 500
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
      status = 401
    } else if (error.message.includes('Forbidden')) {
      status = 403
    } else if (error.message.includes('Not found')) {
      status = 404
    } else if (error.message.includes('Validation') || error.message.includes('Invalid input')) {
      status = 400
    }
  }

  return createErrorResponse(fullContext, status)
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: any
): Promise<{ success: true; data: T } | { success: false; error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid request body'
    return {
      success: false,
      error: createErrorResponse(`Validation error: ${errorMessage}`, 400)
    }
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: any
): { success: true; data: T } | { success: false; error: NextResponse<ApiResponse> } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid query parameters'
    return {
      success: false,
      error: createErrorResponse(`Validation error: ${errorMessage}`, 400)
    }
  }
}

/**
 * Standard API route wrapper with error handling
 */
export function withApiHandler<T>(
  handler: (request: Request) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (request: Request): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error, 'API Handler')
    }
  }
}

/**
 * Authentication middleware for API routes
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (request: NextRequest | Request): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Import here to avoid circular dependencies
      const { authenticateRequest } = await import('./auth-server')

      const { user, error } = await authenticateRequest()

      if (error || !user) {
        return createErrorResponse(error || 'Authentication required', 401)
      }

      return await handler(request as NextRequest, user)
    } catch (error) {
      return handleApiError(error, 'Authentication')
    }
  }
}
