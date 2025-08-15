import { NextResponse } from 'next/server';
import { createClient } from '@/lib/neon/server';

// Use Node runtime for database access
export const runtime = 'nodejs';

export async function GET() {
  const checks = {
    database: { status: 'pending' },
    auth: { status: 'pending' },
    env: { status: 'pending' },
  };
  
  try {
    // Check database connection
    try {
      const client = await createClient();
      const { rows: _rows } = await client.query('SELECT NOW() as time');
      checks.database = { 
        status: 'ok'
      };
    } catch (dbError) {
      console.error('Database check error:', dbError);
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
    console.error('Health check error:', error);
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