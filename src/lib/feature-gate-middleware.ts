import { NextRequest, NextResponse } from 'next/server'
import { logError,} from '@/lib/logger'
import { getUserIdFromSession } from '@/lib/auth-utils'
import { 
  checkConversationLimit, 
  checkAgentAccess, 
  checkFileStorageLimit,
  hasAdvancedFeatureAccess 
} from '@/lib/usage-tracking'

export interface FeatureGateResult {
  allowed: boolean
  error?: string
  upgradeRequired?: boolean
  limit?: {
    current: number
    max: number
    remaining: number
  }
}

/**
 * Check if user can start a conversation
 */
export async function gateConversation(userId: string): Promise<FeatureGateResult> {
  try {
    const limit = await checkConversationLimit(userId)
    
    if (!limit.allowed) {
      return {
        allowed: false,
        error: `Daily conversation limit reached (${limit.current}/${limit.limit})`,
        upgradeRequired: true,
        limit: {
          current: limit.current,
          max: limit.limit,
          remaining: limit.remaining
        }
      }
    }
    
    return { allowed: true }
  } catch (error) {
    logError('Error in gateConversation:', error)
    // Fail open - allow request but log error
    return { allowed: true }
  }
}

/**
 * Check if user can access an agent
 */
export async function gateAgentAccess(userId: string, agentId: string): Promise<FeatureGateResult> {
  try {
    const limit = await checkAgentAccess(userId, agentId)
    
    if (!limit.allowed) {
      return {
        allowed: false,
        error: `AI agent limit reached (${limit.current}/${limit.limit})`,
        upgradeRequired: true,
        limit: {
          current: limit.current,
          max: limit.limit,
          remaining: limit.remaining
        }
      }
    }
    
    return { allowed: true }
  } catch (error) {
    logError('Error in gateAgentAccess:', error)
    return { allowed: true }
  }
}

/**
 * Check if user can upload a file
 */
export async function gateFileUpload(userId: string, fileSizeBytes: number): Promise<FeatureGateResult> {
  try {
    const limit = await checkFileStorageLimit(userId, fileSizeBytes)
    
    if (!limit.allowed) {
      const currentGB = (limit.current / (1024 * 1024 * 1024)).toFixed(2)
      const limitGB = (limit.limit / (1024 * 1024 * 1024)).toFixed(2)
      
      return {
        allowed: false,
        error: `Storage limit exceeded (${currentGB}GB/${limitGB}GB)`,
        upgradeRequired: true,
        limit: {
          current: limit.current,
          max: limit.limit,
          remaining: limit.remaining
        }
      }
    }
    
    return { allowed: true }
  } catch (error) {
    logError('Error in gateFileUpload:', error)
    return { allowed: true }
  }
}

/**
 * Check if user has access to advanced feature
 */
export async function gateAdvancedFeature(
  userId: string, 
  feature: 'analytics' | 'priority_support' | 'api_access' | 'custom_branding'
): Promise<FeatureGateResult> {
  try {
    const hasAccess = await hasAdvancedFeatureAccess(userId, feature)
    
    if (!hasAccess) {
      return {
        allowed: false,
        error: `This feature requires an upgrade`,
        upgradeRequired: true
      }
    }
    
    return { allowed: true }
  } catch (error) {
    logError(`Error in gateAdvancedFeature (${feature}):`, error)
    return { allowed: false, error: 'Unable to verify feature access' }
  }
}

/**
 * Middleware helper to check feature gate and return error response if needed
 */
export async function enforceFeatureGate(
  request: NextRequest,
  gateCheck: () => Promise<FeatureGateResult>
): Promise<NextResponse> {
  const result = await gateCheck()
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: result.error || 'Access denied',
        upgradeRequired: result.upgradeRequired || false,
        limit: result.limit
      },
      { status: 403 }
    )
  }
  
  return null // No error, continue with request
}

/**
 * Extract user ID from request and check gate
 */
export async function checkRequestGate(
  request: NextRequest,
  gateType: 'conversation' | 'agent' | 'file' | 'analytics' | 'priority_support' | 'api_access' | 'custom_branding',
  gateParams?: { agentId?: string; fileSize?: number }
): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromSession(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    let gateResult: FeatureGateResult
    
    switch (gateType) {
      case 'conversation':
        gateResult = await gateConversation(userId)
        break
      case 'agent':
        if (!gateParams?.agentId) {
          return NextResponse.json({ error: 'Agent ID required' }, { status: 400 })
        }
        gateResult = await gateAgentAccess(userId, gateParams.agentId)
        break
      case 'file':
        if (!gateParams?.fileSize) {
          return NextResponse.json({ error: 'File size required' }, { status: 400 })
        }
        gateResult = await gateFileUpload(userId, gateParams.fileSize)
        break
      default:
        gateResult = await gateAdvancedFeature(userId, gateType)
    }
    
    if (!gateResult.allowed) {
      return NextResponse.json(
        {
          error: gateResult.error || 'Access denied',
          upgradeRequired: gateResult.upgradeRequired || false,
          limit: gateResult.limit
        },
        { status: 403 }
      )
    }
    
    return null
  } catch (error) {
    logError('Error in checkRequestGate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

