import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { AgentSecurityManager } from './agent-security-manager'


export interface SecurityContext {
  userId: string
  agentId: string
  action: string
  resource: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export class SecurityMiddleware {
  private securityManager: AgentSecurityManager
  private rateLimitConfig = {
    maxRequests: 100, // requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  }

  constructor() {
    this.securityManager = AgentSecurityManager.getInstance()
  }

  async authenticateRequest(request: NextRequest): Promise<{ 
    success: boolean; 
    userId?: string; 
    error?: string 
  }> {
    try {
      // Extract user ID from headers, cookies, or JWT token
      const userId = request.headers.get('x-user-id') || 
                    request.cookies.get('user-id')?.value ||
                    'default-user' // Fallback for development

      if (!userId || userId === 'anonymous') {
        return { success: false, error: 'Authentication required' }
      }

      // Validate session if session ID is provided
      const sessionId = request.headers.get('x-session-id') || 
                       request.cookies.get('session-id')?.value

      if (sessionId) {
        const sessionValidation = await this.securityManager.validateSession(sessionId)
        if (!sessionValidation.valid) {
          return { success: false, error: 'Invalid or expired session' }
        }
        if (sessionValidation.userId !== userId) {
          return { success: false, error: 'Session user mismatch' }
        }
      }

      // Authenticate user
      const isAuthenticated = await this.securityManager.authenticateUser(userId, sessionId)
      if (!isAuthenticated) {
        return { success: false, error: 'Authentication failed' }
      }

      return { success: true, userId }
    } catch (error) {
      logError('Authentication error:', error)
      return { success: false, error: 'Authentication error' }
    }
  }

  async authorizeRequest(
    userId: string, 
    agentId: string, 
    action: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isAuthorized = await this.securityManager.authorizeAgentAccess(userId, agentId, action)
      
      if (!isAuthorized) {
        return { success: false, error: 'Insufficient permissions' }
      }

      return { success: true }
    } catch (error) {
      logError('Authorization error:', error)
      return { success: false, error: 'Authorization error' }
    }
  }

  async checkRateLimit(
    userId: string, 
    agentId: string
  ): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    try {
      const isAllowed = await this.securityManager.checkRateLimit(
        userId, 
        agentId, 
        this.rateLimitConfig
      )

      if (!isAllowed) {
        return { 
          success: false, 
          error: 'Rate limit exceeded',
          retryAfter: this.rateLimitConfig.windowMs / 1000
        }
      }

      return { success: true }
    } catch (error) {
      logError('Rate limit check error:', error)
      return { success: false, error: 'Rate limit check failed' }
    }
  }

  async validateInput(
    input: string, 
    type: 'message' | 'command' | 'query'
  ): Promise<{ success: boolean; sanitized?: string; error?: string }> {
    try {
      const validation = this.securityManager.validateInput(input, type)
      
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Input validation failed: ${validation.errors.join(', ')}` 
        }
      }

      return { success: true, sanitized: validation.sanitized }
    } catch (error) {
      logError('Input validation error:', error)
      return { success: false, error: 'Input validation error' }
    }
  }

  async logSecurityEvent(
    context: SecurityContext,
    success: boolean,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.securityManager.logSecurityEvent(
        context.userId,
        context.agentId,
        context.action,
        context.resource,
        success,
        metadata,
        context.ipAddress,
        context.userAgent
      )
    } catch (error) {
      logError('Security logging error:', error)
    }
  }

  async processRequest(
    request: NextRequest,
    agentId: string,
    action: string,
    resource: string
  ): Promise<{
    success: boolean
    context?: SecurityContext
    response?: NextResponse
    error?: string
  }> {
    try {
      const ipAddress = 
                       request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      
      const userAgent = request.headers.get('user-agent') || 'unknown'

      // Step 1: Authenticate
      const authResult = await this.authenticateRequest(request)
      if (!authResult.success) {
        await this.logSecurityEvent(
          { userId: 'unknown', agentId, action, resource, ipAddress, userAgent },
          false,
          { error: authResult.error }
        )
        
        return {
          success: false,
          response: NextResponse.json(
            { error: authResult.error },
            { status: 401 }
          ),
          error: authResult.error
        }
      }

      const userId = authResult.userId!

      // Step 2: Authorize
      const authzResult = await this.authorizeRequest(userId, agentId, action)
      if (!authzResult.success) {
        await this.logSecurityEvent(
          { userId, agentId, action, resource, ipAddress, userAgent },
          false,
          { error: authzResult.error }
        )
        
        return {
          success: false,
          response: NextResponse.json(
            { error: authzResult.error },
            { status: 403 }
          ),
          error: authzResult.error
        }
      }

      // Step 3: Check rate limit
      const rateLimitResult = await this.checkRateLimit(userId, agentId)
      if (!rateLimitResult.success) {
        await this.logSecurityEvent(
          { userId, agentId, action, resource, ipAddress, userAgent },
          false,
          { error: rateLimitResult.error }
        )
        
        const response = NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        )
        
        if (rateLimitResult.retryAfter) {
          response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
        }
        
        return {
          success: false,
          response,
          error: rateLimitResult.error
        }
      }

      // Step 4: Validate input if it's a POST request with body
      if (request.method === 'POST') {
        try {
          const body = await request.json()
          if (body.message) {
            const inputValidation = await this.validateInput(body.message, 'message')
            if (!inputValidation.success) {
              await this.logSecurityEvent(
                { userId, agentId, action, resource, ipAddress, userAgent },
                false,
                { error: inputValidation.error }
              )
              
              return {
                success: false,
                response: NextResponse.json(
                  { error: inputValidation.error },
                  { status: 400 }
                ),
                error: inputValidation.error
              }
            }
          }
        } catch (error) {
          // If JSON parsing fails, that's okay - let the handler deal with it
        }
      }

      // All security checks passed
      const context: SecurityContext = {
        userId,
        agentId,
        action,
        resource,
        ipAddress,
        userAgent,
        sessionId: request.headers.get('x-session-id') || 
                  request.cookies.get('session-id')?.value
      }

      await this.logSecurityEvent(context, true)

      return {
        success: true,
        context
      }
    } catch (error) {
      logError('Security middleware error:', error)
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Security processing failed' },
          { status: 500 }
        ),
        error: 'Security processing failed'
      }
    }
  }

  // Helper method to create security headers
  createSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }

  // Helper method to create error response
  createErrorResponse(
    message: string, 
    status: number, 
    retryAfter?: number
  ): NextResponse {
    const response = NextResponse.json(
      { error: message },
      { status }
    )

    // Add security headers
    const securityHeaders = this.createSecurityHeaders()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }

    return response
  }
}
