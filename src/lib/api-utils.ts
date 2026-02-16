import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'
import { logError, logAuth } from '@/lib/logger'

/**
 * Centralized database connection utility
 * Eliminates duplication across API routes
 */
export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

/**
 * Standardized error response utility
 * Eliminates duplication in error handling
 */
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  details?: unknown
) {
  logError(`API Error (${status}): ${message}`, details)
  const response: any = { error: message }
  if (details) response.details = details
  return NextResponse.json(response, { status })
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const details = error instanceof ApiError ? error.details : undefined;
  
  return createErrorResponse(message, statusCode, details);
}

export const successResponse = createSuccessResponse;

/**
 * Standardized success response utility
 */
export function createSuccessResponse(
  data: unknown, 
  message?: string, 
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      ...(typeof data === 'object' && data !== null ? data : { data })
    },
    { status }
  )
}

/**
 * JWT authentication utility (Edge-compatible with jose)
 * Eliminates duplication across protected routes
 */
export async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'Authorization header required' }
    }

    const token = authHeader.substring(7)
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }
    
    // Use jose for Edge-compatible JWT verification
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // Type guard to ensure payload has required properties
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      return { user: null, error: 'Invalid token' }
    }
    
    logAuth('User authenticated successfully', payload.userId as string)
    
    // Return standardized user object
    return { 
      user: {
        id: payload.userId as string,
        email: (payload.email as string) || '',
        full_name: (payload.full_name as string) || null,
        avatar_url: (payload.avatar_url as string) || null,
        subscription_tier: (payload.subscription_tier as string) || 'free',
        level: (payload.level as number) || 1,
        total_points: (payload.total_points as number) || 0,
        current_streak: (payload.current_streak as number) || 0,
        wellness_score: (payload.wellness_score as number) || 50,
      },
      error: null
    }
  } catch (error) {
    logError('JWT authentication failed:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}

/**
 * Validate required fields utility
 * Eliminates duplication in input validation
 */
export function validateRequiredFields(
  data: Record<string, unknown>, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return !value || (typeof value === 'string' && value.trim() === '')
  })
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Standardized request body parser with validation
 */
export async function parseRequestBody(
  request: NextRequest,
  requiredFields: string[] = []
) {
  try {
    const body = await request.json()
    
    if (requiredFields.length > 0) {
      const validation = validateRequiredFields(body, requiredFields)
      if (!validation.isValid) {
        return {
          data: null,
          error: `Missing required fields: ${validation.missingFields.join(', ')}`
        }
      }
    }
    
    return { data: body, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'Invalid JSON in request body'
    }
  }
}

/**
 * Database query wrapper with error handling
 * Eliminates duplication in database operations
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage: string = 'Database query failed'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await queryFn()
    return { data, error: null }
  } catch (error) {
    logError(errorMessage, error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : errorMessage 
    }
  }
}

/**
 * Generate UUID utility
 * Centralized UUID generation
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}

/**
 * Standardized pagination utility
 */
export function parsePaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  const parsedPage = parseInt(url.searchParams.get('page') || '1')
  const parsedLimit = parseInt(url.searchParams.get('limit') || '20')
  
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1
  const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : 20
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

/**
 * Common API route wrapper
 * Eliminates duplication in route structure and error handling
 */
/**
 * Common API route wrapper
 * Eliminates duplication in route structure and error handling
 */
export function withApiHandler(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: unknown) => {
    try {
      return await handler(request, context)
    } catch (error) {
      logError('Unhandled API error:', error);
      const isApiError = error instanceof ApiError;
      return createErrorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : (isApiError ? (error as ApiError).details : undefined)
      )
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Protected route wrapper
 * Eliminates duplication in authentication checks
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser, context?: unknown) => Promise<NextResponse>
) {
  return withApiHandler(async (request: NextRequest, context?: unknown) => {
    const { user, error } = await authenticateRequest(request)
    
    if (!user || error) {
      return createErrorResponse(error || 'Authentication required', 401)
    }
    
    return handler(request, user as AuthenticatedUser, context)
  })
}

/**
 * Verify document ownership utility
 * Eliminates duplication in document access control
 * 
 * Whitelist of allowed fields to prevent SQL injection
 */
const ALLOWED_DOCUMENT_FIELDS = [
  'id', 'name', 'description', 'category', 'tags', 'is_favorite', 
  'file_data', 'file_size', 'file_type', 'mime_type', 'user_id',
  'created_at', 'updated_at'
]

export async function verifyDocumentOwnership<T = any>(
  documentId: string,
  userId: string,
  selectFields: string = 'id'
): Promise<{ document: T | null; error: string | null }> {
  try {
    // Validate selectFields against whitelist to prevent SQL injection
    const requestedFields = selectFields.split(',').map(f => f.trim())
    const invalidFields = requestedFields.filter(
      field => !ALLOWED_DOCUMENT_FIELDS.includes(field)
    )
    
    if (invalidFields.length > 0) {
      logError('Invalid document fields requested:', invalidFields)
      return { 
        document: null, 
        error: 'Invalid field selection' 
      }
    }
    
    const sql = getSql()
    if (!sql) {
      throw new Error('Database connection not available')
    }
    
    // Safe to use fields now that they're validated against whitelist  
    // Construct SQL query safely - selectFields is validated so SQL injection is prevented
    // For dynamic field selection with Neon, we use a workaround since template literals
    // don't support dynamic SELECT clauses directly
    const sqlClient = sql as any
    // Check if unsafe method exists (for raw SQL execution)
    if (typeof sqlClient.unsafe === 'function') {
      const result = await sqlClient.unsafe(
        `SELECT ${selectFields} FROM documents WHERE id = $1 AND user_id = $2`,
        [documentId, userId]
      ) as T[]
      if (!result || result.length === 0) {
        return { document: null, error: 'Document not found' }
      }
      return { document: result[0], error: null }
    }
    
    // Fallback: Use template literal with all common fields if unsafe not available
    // This is a limitation of Neon's sql template tag with dynamic field selection
    const result = await sql`
      SELECT id, name, description, file_type, file_size, user_id, created_at, updated_at
      FROM documents WHERE id = ${documentId} AND user_id = ${userId}
    ` as T[]
    
    if (!result || result.length === 0) {
      return { document: null, error: 'Document not found' }
    }
    
    return { document: result[0], error: null }
  } catch (error) {
    logError('Document verification error:', error)
    return { 
      document: null, 
      error: error instanceof Error ? error.message : 'Failed to verify document' 
    }
  }
}

/**
 * Parse document tags safely
 * Centralized tag parsing logic
 */
export function parseDocumentTags(tagsField: unknown): string[] {
  if (!tagsField) return []
  try {
    return typeof tagsField === 'string' ? JSON.parse(tagsField) : tagsField as string[]
  } catch (error) {
    logError('Failed to parse document tags:', error)
    return []
  }
}

/**
 * Protected document route wrapper
 * Combines authentication and document ownership verification
 */
export function withDocumentAuth(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    documentId: string,
    context?: unknown
  ) => Promise<NextResponse>,
  selectFields: string = 'id'
) {
  return withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: unknown) => {
    const params = await (context as { params: Promise<{ id: string }> }).params
    const { id: documentId } = params
    
    if (!documentId) {
      return createErrorResponse('Document ID is required', 400)
    }
    
    const { document, error } = await verifyDocumentOwnership(
      documentId,
      user.id,
      selectFields
    )
    
    if (error || !document) {
      return createErrorResponse(error || 'Document not found', 404)
    }
    
    return handler(request, user, documentId, context)
  })
}
