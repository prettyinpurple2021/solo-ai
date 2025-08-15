import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { info, error } from '@/lib/log'

/**
 * Dependency health check endpoint
 * Checks database connection and other critical services
 * @route GET /api/health/deps
 */
export async function GET(request: NextRequest) {
  const logger = {
    route: '/api/health/deps',
    meta: {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    }
  }
  
  const checks = {
    database: { status: 'pending' },
    environment: { status: 'pending' },
  }
  
  // Check database connection
  try {
    const client = await createClient()
    const { rows } = await client.query('SELECT NOW()')
    
    if (rows.length > 0) {
      checks.database = { 
        status: 'ok',
        timestamp: rows[0].now
      }
    } else {
      checks.database = { 
        status: 'error',
        message: 'No response from database'
      }
    }
  } catch (err) {
    error('Database health check failed', {
      ...logger,
      status: 500,
      error: err,
      meta: {
        ...logger.meta,
        errorMessage: err instanceof Error ? err.message : String(err)
      }
    })
    
    checks.database = { 
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown database error'
    }
  }
  
  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    'STACK_SECRET_SERVER_KEY',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingEnvVars.length === 0) {
    checks.environment = { status: 'ok' }
  } else {
    checks.environment = {
      status: 'warning',
      message: 'Missing environment variables',
      missing: missingEnvVars
    }
  }
  
  // Determine overall status
  const hasError = Object.values(checks).some(check => check.status === 'error')
  const hasWarning = Object.values(checks).some(check => check.status === 'warning')
  
  const status = hasError ? 'error' : hasWarning ? 'warning' : 'ok'
  const httpStatus = hasError ? 500 : 200
  
  info('Dependencies health check', {
    ...logger,
    status: httpStatus,
    meta: {
      ...logger.meta,
      checkStatus: status
    }
  })
  
  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks
  }, { status: httpStatus })
}
