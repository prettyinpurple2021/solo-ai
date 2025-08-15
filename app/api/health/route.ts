import { NextRequest, NextResponse } from 'next/server'
import { info } from '@/lib/log'

/**
 * Simple health check endpoint
 * @route GET /api/health
 */
export async function GET(request: NextRequest) {
  info('Health check requested', {
    route: '/api/health',
    status: 200,
    meta: {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
  })
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
}