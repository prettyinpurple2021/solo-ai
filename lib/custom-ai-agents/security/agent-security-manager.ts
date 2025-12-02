import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { getSql } from "@/lib/api-utils"


export interface AgentPermission {
  agentId: string
  userId: string
  permissions: string[]
  restrictions: string[]
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SecurityAuditLog {
  id: string
  userId: string
  agentId: string
  action: string
  resource: string
  success: boolean
  ipAddress?: string
  userAgent?: string
  metadata: Record<string, unknown>
  timestamp: Date
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface SecurityConfig {
  requireAuthentication: boolean
  requireAuthorization: boolean
  enableRateLimiting: boolean
  enableAuditLogging: boolean
  maxConcurrentSessions: number
  sessionTimeoutMs: number
  allowedOrigins: string[]
  blockedIPs: string[]
}

export class AgentSecurityManager {
  private static instance: AgentSecurityManager
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  private activeSessions: Map<string, { userId: string; lastActivity: number }> = new Map()

  private constructor() { }

  static getInstance(): AgentSecurityManager {
    if (!AgentSecurityManager.instance) {
      AgentSecurityManager.instance = new AgentSecurityManager()
    }
    return AgentSecurityManager.instance
  }

  private getSql() {
    return getSql()
  }

  // Authentication and Authorization
  async authenticateUser(userId: string, sessionToken?: string): Promise<boolean> {
    try {
      // In a real implementation, you would validate the session token
      // For now, we'll use a simple user ID validation
      if (!userId || userId === 'anonymous') {
        return false
      }

      // Check if user has an active session
      const session = this.activeSessions.get(userId)
      if (session) {
        const now = Date.now()
        if (now - session.lastActivity < 30 * 60 * 1000) { // 30 minutes
          session.lastActivity = now
          return true
        } else {
          this.activeSessions.delete(userId)
        }
      }

      // Create new session
      this.activeSessions.set(userId, {
        userId,
        lastActivity: Date.now()
      })

      return true
    } catch (error) {
      logError('Authentication error:', error)
      return false
    }
  }

  async authorizeAgentAccess(userId: string, agentId: string, action: string): Promise<boolean> {
    try {
      const sql = this.getSql()

      // Check if user has permission for this agent and action
      const result = await sql`
        SELECT permissions, restrictions, expires_at
        FROM agent_permissions 
        WHERE user_id = ${userId} AND agent_id = ${agentId}
        AND (expires_at IS NULL OR expires_at > NOW())
      ` as any[]

      if (result.length === 0) {
        return false
      }

      const permission = result[0] as { permissions: string[]; restrictions: string[]; expires_at: Date | null }

      // Check if action is explicitly restricted
      if (permission.restrictions && permission.restrictions.includes(action)) {
        return false
      }

      // Check if action is allowed
      if (permission.permissions && permission.permissions.includes(action)) {
        return true
      }

      // Check for wildcard permissions
      if (permission.permissions && permission.permissions.includes('*')) {
        return true
      }

      return false
    } catch (error) {
      logError('Authorization error:', error)
      return false
    }
  }

  // Rate Limiting
  async checkRateLimit(userId: string, agentId: string, config: RateLimitConfig): Promise<boolean> {
    const key = `${userId}:${agentId}`
    const now = Date.now()

    const current = this.rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      // Reset or create new rate limit window
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return true
    }

    if (current.count >= config.maxRequests) {
      return false
    }

    current.count++
    return true
  }

  // Audit Logging
  async logSecurityEvent(
    userId: string,
    agentId: string,
    action: string,
    resource: string,
    success: boolean,
    metadata: Record<string, unknown> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const sql = this.getSql()
      const auditId = crypto.randomUUID()
      const metadataJson = JSON.stringify(metadata)

      await sql`
        INSERT INTO security_audit_logs (
          id, user_id, agent_id, action, resource, success,
          ip_address, user_agent, metadata, timestamp
        ) VALUES (
          ${auditId}, ${userId}, ${agentId}, ${action}, ${resource}, ${success},
          ${ipAddress || null}, ${userAgent || null}, ${metadataJson}::jsonb, ${new Date()}
        )
      `
    } catch (error) {
      logError('Audit logging error:', error)
    }
  }

  // Permission Management
  async grantPermission(
    userId: string,
    agentId: string,
    permissions: string[],
    restrictions: string[] = [],
    expiresAt?: Date
  ): Promise<void> {
    try {
      const sql = this.getSql()
      const permissionId = crypto.randomUUID()
      const permissionsJson = JSON.stringify(permissions)
      const restrictionsJson = JSON.stringify(restrictions)
      const now = new Date()

      await sql`
        INSERT INTO agent_permissions (
          id, user_id, agent_id, permissions, restrictions, expires_at, created_at, updated_at
        ) VALUES (
          ${permissionId}, ${userId}, ${agentId}, ${permissionsJson}::jsonb, ${restrictionsJson}::jsonb, ${expiresAt || null}, ${now}, ${now}
        ) ON CONFLICT (user_id, agent_id) 
        DO UPDATE SET 
          permissions = ${permissionsJson}::jsonb,
          restrictions = ${restrictionsJson}::jsonb,
          expires_at = ${expiresAt || null},
          updated_at = ${now}
      `
    } catch (error) {
      logError('Permission grant error:', error)
      throw new Error('Failed to grant permission')
    }
  }

  async revokePermission(userId: string, agentId: string): Promise<void> {
    try {
      const sql = this.getSql()

      await sql`
        DELETE FROM agent_permissions 
        WHERE user_id = ${userId} AND agent_id = ${agentId}
      `
    } catch (error) {
      logError('Permission revoke error:', error)
      throw new Error('Failed to revoke permission')
    }
  }

  // Security Configuration
  async getSecurityConfig(): Promise<SecurityConfig> {
    return {
      requireAuthentication: true,
      requireAuthorization: true,
      enableRateLimiting: true,
      enableAuditLogging: true,
      maxConcurrentSessions: 5,
      sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
      allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
      blockedIPs: []
    }
  }

  // Input Validation and Sanitization
  validateInput(input: string, type: 'message' | 'command' | 'query'): { valid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = []
    let sanitized = input

    // Basic length validation
    if (input.length > 10000) {
      errors.push('Input too long (max 10000 characters)')
    }

    if (input.length < 1) {
      errors.push('Input cannot be empty')
    }

    // Remove potentially dangerous characters
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()

    // Type-specific validation
    switch (type) {
      case 'message':
        // Allow most characters for messages
        break
      case 'command':
        // Commands should be alphanumeric with limited special chars
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
          errors.push('Commands can only contain letters, numbers, spaces, hyphens, and underscores')
        }
        break
      case 'query':
        // Queries should not contain SQL injection attempts
        if (/['";\\]/.test(sanitized)) {
          errors.push('Query contains potentially dangerous characters')
        }
        break
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors
    }
  }

  // Session Management
  async createSession(userId: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const sessionId = crypto.randomUUID()

    this.activeSessions.set(sessionId, {
      userId,
      lastActivity: Date.now()
    })

    // Log session creation
    await this.logSecurityEvent(
      userId,
      'system',
      'session_create',
      'user_session',
      true,
      { sessionId, ...metadata }
    )

    return sessionId
  }

  async validateSession(sessionId: string): Promise<{ valid: boolean; userId?: string }> {
    const session = this.activeSessions.get(sessionId)

    if (!session) {
      return { valid: false }
    }

    const now = Date.now()
    if (now - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
      this.activeSessions.delete(sessionId)
      return { valid: false }
    }

    session.lastActivity = now
    return { valid: true, userId: session.userId }
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)

    if (session) {
      await this.logSecurityEvent(
        session.userId,
        'system',
        'session_destroy',
        'user_session',
        true,
        { sessionId }
      )
    }

    this.activeSessions.delete(sessionId)
  }

  // Cleanup expired sessions and rate limits
  async cleanup(): Promise<void> {
    const now = Date.now()

    // Clean up expired sessions
    for (const [sessionId, session] of Array.from(this.activeSessions.entries())) {
      if (now - session.lastActivity > 30 * 60 * 1000) {
        this.activeSessions.delete(sessionId)
      }
    }

    // Clean up expired rate limits
    for (const [key, rateLimit] of this.rateLimitStore.entries()) {
      if (now > rateLimit.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<{
    activeSessions: number
    totalAuditLogs: number
    failedAuthAttempts: number
    rateLimitHits: number
  }> {
    try {
      const sql = this.getSql()

      const [auditResult, failedAuthResult] = await Promise.all([
        sql`
          SELECT COUNT(*) as total_logs
          FROM security_audit_logs 
          WHERE timestamp >= NOW() - INTERVAL '24 hours'
        ` as Promise<any[]>,
        sql`
          SELECT COUNT(*) as failed_attempts
          FROM security_audit_logs 
          WHERE action = 'authenticate' AND success = false
          AND timestamp >= NOW() - INTERVAL '24 hours'
        ` as Promise<any[]>
      ])

      return {
        activeSessions: this.activeSessions.size,
        totalAuditLogs: parseInt(String(auditResult[0]?.total_logs || '0')),
        failedAuthAttempts: parseInt(String(failedAuthResult[0]?.failed_attempts || '0')),
        rateLimitHits: 0 // This would need to be tracked separately
      }
    } catch (error) {
      logError('Error getting security metrics:', error)
      return {
        activeSessions: this.activeSessions.size,
        totalAuditLogs: 0,
        failedAuthAttempts: 0,
        rateLimitHits: 0
      }
    }
  }
}
