
import { NextResponse } from 'next/server';
import { WorkflowEngine } from '@/lib/workflow-engine';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const engine = new WorkflowEngine();
    const nodeTypes = engine.getNodeTypes();
    
    // Transform mapping to array for JSON response if not already
    // The getNodeTypes method now returns an array
    
    return NextResponse.json({
      success: true,
      data: nodeTypes
    });
  } catch (error) {
    logError('Error fetching node types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch node types' },
      { status: 500 }
    );
  }
}
