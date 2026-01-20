
import { NextResponse } from 'next/server';
import { WorkflowEngine } from '@/lib/workflow-engine';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workflowId, input } = body;

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const engine = new WorkflowEngine();
    const execution = await engine.executeWorkflow(workflowId, input || {}, session.user.id);

    return NextResponse.json({ success: true, execution });

  } catch (error) {
    logError('Failed to execute workflow:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
