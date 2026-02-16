import { logError, logInfo,} from '@/lib/logger'
import { NextResponse} from 'next/server';


export const runtime = 'edge';

export async function GET() {
  try {
    logInfo('Health check requested at:', new Date().toISOString());
    
    // Basic health check that doesn't depend on database
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextVersion: process.env.NEXT_RUNTIME,
      port: process.env.PORT,
      hostname: process.env.HOSTNAME,
    };

    logInfo('Health check response:', healthStatus);
    return NextResponse.json(healthStatus);
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
