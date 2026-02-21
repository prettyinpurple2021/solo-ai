import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { AgentSecurityManager} from '@/lib/custom-ai-agents/security/agent-security-manager'
import { SecurityMiddleware} from '@/lib/custom-ai-agents/security/security-middleware'


const securityManager = AgentSecurityManager.getInstance()
const _securityMiddleware = new SecurityMiddleware()


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'metrics':
        return await getSecurityMetrics(request)
      case 'permissions':
        return await getUserPermissions(request)
      case 'config':
        return await getSecurityConfig(request)
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    logError('Security API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'grant-permission':
        return await grantPermission(request)
      case 'revoke-permission':
        return await revokePermission(request)
      case 'create-session':
        return await createSession(request)
      case 'validate-session':
        return await validateSession(request)
      case 'destroy-session':
        return await destroySession(request)
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    logError('Security API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSecurityMetrics(request: NextRequest) {
  try {
    // Basic authentication check
    const _userId = request.headers.get('x-user-id') || 'default-user'
    
    const metrics = await securityManager.getSecurityMetrics()
    
    return NextResponse.json({
      success: true,
      metrics
    })
  } catch (error) {
    logError('Error getting security metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get security metrics' },
      { status: 500 }
    )
  }
}

async function getUserPermissions(request: NextRequest) {
  try {
    const _userId = request.headers.get('x-user-id') || 'default-user'
    const agentId = request.nextUrl.searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to view permissions
    const hasPermission = await securityManager.authorizeAgentAccess(
      _userId, 
      agentId, 
      'view_permissions'
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get user permissions for the agent
    const { getSql } = await import('@/lib/api-utils')
    const sql = getSql()
    const result = await sql`
      SELECT permissions, restrictions, expires_at
      FROM agent_permissions 
      WHERE user_id = ${_userId} AND agent_id = ${agentId}
      AND (expires_at IS NULL OR expires_at > NOW())
    ` as any[]

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        permissions: {
          agentId,
          permissions: [],
          restrictions: [],
          expiresAt: null
        }
      })
    }

    const permission = result[0]
    const permissions = typeof permission.permissions === 'string' 
      ? JSON.parse(permission.permissions) 
      : (permission.permissions || [])
    const restrictions = typeof permission.restrictions === 'string'
      ? JSON.parse(permission.restrictions)
      : (permission.restrictions || [])
    
    return NextResponse.json({
      success: true,
      permissions: {
        agentId,
        permissions: permissions,
        restrictions: restrictions,
        expiresAt: permission.expires_at
      }
    })
  } catch (error) {
    logError('Error getting user permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get user permissions' },
      { status: 500 }
    )
  }
}

async function getSecurityConfig(_request: NextRequest) {
  try {
    const config = await securityManager.getSecurityConfig()
    
    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    logError('Error getting security config:', error)
    return NextResponse.json(
      { error: 'Failed to get security config' },
      { status: 500 }
    )
  }
}

async function grantPermission(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentId, permissions, restrictions, expiresAt } = body

    if (!userId || !agentId || !permissions) {
      return NextResponse.json(
        { error: 'userId, agentId, and permissions are required' },
        { status: 400 }
      )
    }

    // Check if the requesting user has permission to grant permissions
    const requesterId = request.headers.get('x-user-id') || 'default-user'
    const canGrant = await securityManager.authorizeAgentAccess(
      requesterId, 
      'system', 
      'grant_permissions'
    )

    if (!canGrant) {
      return NextResponse.json(
        { error: 'Insufficient permissions to grant access' },
        { status: 403 }
      )
    }

    await securityManager.grantPermission(
      userId,
      agentId,
      permissions,
      restrictions || [],
      expiresAt ? new Date(expiresAt) : undefined
    )

    return NextResponse.json({
      success: true,
      message: 'Permission granted successfully'
    })
  } catch (error) {
    logError('Error granting permission:', error)
    return NextResponse.json(
      { error: 'Failed to grant permission' },
      { status: 500 }
    )
  }
}

async function revokePermission(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentId } = body

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'userId and agentId are required' },
        { status: 400 }
      )
    }

    // Check if the requesting user has permission to revoke permissions
    const requesterId = request.headers.get('x-user-id') || 'default-user'
    const canRevoke = await securityManager.authorizeAgentAccess(
      requesterId, 
      'system', 
      'revoke_permissions'
    )

    if (!canRevoke) {
      return NextResponse.json(
        { error: 'Insufficient permissions to revoke access' },
        { status: 403 }
      )
    }

    await securityManager.revokePermission(userId, agentId)

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully'
    })
  } catch (error) {
    logError('Error revoking permission:', error)
    return NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    )
  }
}

async function createSession(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, metadata = {} } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const sessionId = await securityManager.createSession(userId, metadata)

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Session created successfully'
    })
  } catch (error) {
    logError('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

async function validateSession(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const validation = await securityManager.validateSession(sessionId)

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      userId: validation.userId
    })
  } catch (error) {
    logError('Error validating session:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  }
}

async function destroySession(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    await securityManager.destroySession(sessionId)

    return NextResponse.json({
      success: true,
      message: 'Session destroyed successfully'
    })
  } catch (error) {
    logError('Error destroying session:', error)
    return NextResponse.json(
      { error: 'Failed to destroy session' },
      { status: 500 }
    )
  }
}
