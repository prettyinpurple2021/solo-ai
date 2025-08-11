import { NextRequest, NextResponse } from 'next/server'
import { getFeatureFlags } from '@/lib/env-validation'
import { query } from '@/lib/neon/client'

export async function GET(_req: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    features: getFeatureFlags(),
    services: {
      database: false,
      auth: false,
      billing: false,
      ai: false,
      email: false,
    },
    details: {} as Record<string, unknown>
  }

  try {
    // Check database connection
    if (checks.features.hasDatabase) {
      try {
        const result = await query('SELECT NOW() as time')
        checks.services.database = !!result.rows[0]
        checks.details.database = {
          connected: true,
          serverTime: result.rows[0]?.time
        }
      } catch (error) {
        checks.services.database = false
        checks.details.database = {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Check Stack Auth
    checks.services.auth = checks.features.hasAuth
    checks.details.auth = {
      configured: checks.features.hasAuth,
      provider: 'Stack Auth'
    }

    // Check Chargebee
    checks.services.billing = checks.features.hasBilling
    checks.details.billing = {
      configured: checks.features.hasBilling,
      provider: 'Chargebee'
    }

    // Check AI Services
    checks.services.ai = checks.features.hasAI
    checks.details.ai = {
      configured: checks.features.hasAI,
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    }

    // Check Email
    checks.services.email = checks.features.hasEmail
    checks.details.email = {
      configured: checks.features.hasEmail,
      provider: 'Resend'
    }

    // Overall health check
    const criticalServices = ['database', 'auth']
    const criticalServicesHealthy = criticalServices.every(service => 
      checks.services[service as keyof typeof checks.services]
    )

    if (!criticalServicesHealthy) {
      checks.status = 'degraded'
    }

    return NextResponse.json(checks, { 
      status: checks.status === 'ok' ? 200 : 503 
    })

  } catch (error) {
    return NextResponse.json({
      ...checks,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
