import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger, logError, logWarn } from './logger'
import { rateLimitByIp } from './rate-limit'
import { createErrorResponse, createSuccessResponse } from './api-response'

/**
 * Comprehensive API middleware for production-ready error handling,
 * validation, and security
 */

// Rate limiting configuration
const RATE_LIMITS = {
  auth: { requests: 5, window: 60 }, // 5 requests per minute for auth
  api: { requests: 100, window: 60 }, // 100 requests per minute for general API
  upload: { requests: 10, window: 60 }, // 10 requests per minute for uploads
  search: { requests: 50, window: 60 }, // 50 requests per minute for search
}

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Rate limiting middleware
 */
export async function withRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'api'
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const limit = RATE_LIMITS[type]
    const result = await rateLimitByIp(request, limit)

    if (!result.allowed) {
      const response = createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429
      )

      response.headers.set('Retry-After', '60')
      response.headers.set('X-RateLimit-Limit', limit.requests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + limit.window * 1000).toISOString())

      return { allowed: false, response }
    }

    return { allowed: true }
  } catch (error) {
    logError('Rate limiting error:', error)
    // Allow request to proceed if rate limiting fails
    return { allowed: true }
  }
}

/**
 * Request validation middleware
 */
export function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    let data: any

    switch (source) {
      case 'body':
        // This would need to be handled asynchronously in practice
        data = request.body
        break
      case 'query':
        data = Object.fromEntries(new URL(request.url).searchParams.entries())
        break
      case 'params':
        // This would need to be extracted from the route parameters
        data = {}
        break
      default:
        throw new Error('Invalid validation source')
    }

    const result = schema.safeParse(data)

    if (!result.success) {
      const errors = (result.error as any).errors.map((err: any) =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')

      return {
        success: false,
        response: createErrorResponse(`Validation error: ${errors}`, 400)
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    logError('Request validation error:', error)
    return {
      success: false,
      response: createErrorResponse('Invalid request format', 400)
    }
  }
}

/**
 * Async request validation middleware for request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = (result.error as any).errors.map((err: any) =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')

      return {
        success: false,
        response: createErrorResponse(`Validation error: ${errors}`, 400)
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    logError('Request body validation error:', error)
    return {
      success: false,
      response: createErrorResponse('Invalid JSON in request body', 400)
    }
  }
}

/**
 * Comprehensive API route wrapper with all middleware
 */
export function withApiMiddleware<T>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<T>>,
  options: {
    rateLimit?: keyof typeof RATE_LIMITS
    validate?: {
      body?: z.ZodSchema<any>
      query?: z.ZodSchema<any>
    }
    requireAuth?: boolean
  } = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await withRateLimit(request, options.rateLimit)
        if (!rateLimitResult.allowed && rateLimitResult.response) {
          return rateLimitResult.response as NextResponse<T>
        }
      }

      // Validate request body
      if (options.validate?.body) {
        const bodyValidation = await validateRequestBody(request, options.validate.body)
        if (!bodyValidation.success && bodyValidation.response) {
          return bodyValidation.response as NextResponse<T>
        }
      }

      // Validate query parameters
      if (options.validate?.query) {
        const queryValidation = validateRequest(request, options.validate.query, 'query')
        if (!queryValidation.success && queryValidation.response) {
          return queryValidation.response as NextResponse<T>
        }
      }

      // Handle authentication
      if (options.requireAuth) {
        // Import here to avoid circular dependencies
        const { authenticateRequest } = await import('./auth-server')

        const { user, error } = await authenticateRequest()

        if (error || !user) {
          const response = createErrorResponse(error || 'Authentication required', 401)
          return applySecurityHeaders(response) as NextResponse<T>
        }
      }

      // Execute the handler
      const response = await handler(request, ...args)

      // Apply security headers
      return applySecurityHeaders(response) as NextResponse<T>

    } catch (error) {
      logError('API middleware error:', error)

      const response = createErrorResponse(
        'An unexpected error occurred',
        500
      )

      return applySecurityHeaders(response) as NextResponse<T>
    }
  }
}

/**
 * CORS middleware for API routes
 */
export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

/**
 * Request logging middleware
 */
export function logRequest(request: NextRequest, response: NextResponse) {
  const { method, url } = request
  const { status } = response

  const logData = {
    method,
    url,
    status,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  }

  if (status >= 400) {
    logWarn('API Request Error:', logData)
  } else {
    logger.info('API Request:', logData)
  }
}

/**
 * Health check middleware
 */
export function healthCheck(): NextResponse {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  }

  return createSuccessResponse(health, 'Service is healthy')
}


