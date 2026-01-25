import { logError,} from '@/lib/logger'
import { NextResponse} from 'next/server';
import { neon } from '@neondatabase/serverless'
export const runtime = 'edge';

export async function GET() {
  const checks = {
    database: { status: 'pending' },
    auth: { status: 'pending' },
    env: { status: 'pending' },
  };
  
  try {
    // Check database connection (Edge-safe via Neon HTTP)
    try {
      const url = process.env.DATABASE_URL
      if (!url) throw new Error('DATABASE_URL not set')
      const sql = neon(url)
      await sql`SELECT NOW() as time`
      checks.database = { status: 'ok' }
    } catch (dbError) {
      logError('Database check error:', dbError);
      checks.database = {
        status: 'error'
      };
    }
    
    // Check auth environment variables
    const authEnvVars = ['JWT_SECRET', 'ENCRYPTION_KEY'];
    const missingAuthVars = authEnvVars.filter(varName => !process.env[varName]);
    checks.auth = missingAuthVars.length === 0
      ? { status: 'ok' }
      : { status: 'error' };
    
    // Check other critical environment variables
    const criticalEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
    const missingEnvVars = criticalEnvVars.filter(varName => !process.env[varName]);
    checks.env = missingEnvVars.length === 0
      ? { status: 'ok' }
      : { status: 'error' };
    
    // Overall status
    const overallStatus = Object.values(checks).some(check => check.status === 'error')
      ? 'error' 
      : 'ok';
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    logError('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}