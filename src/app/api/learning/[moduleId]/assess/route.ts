import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LearningEngineService } from '@/lib/services/learning-engine-service';
import { logError } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  let resolvedModuleId = '[moduleId]';
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = await params;
    resolvedModuleId = moduleId;

    const body = await req.json();
    const { assessmentId, answers } = body;

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Submit assessment using the learning engine service
    const result = await LearningEngineService.submitAssessment(session.user.id, assessmentId, answers);

    return NextResponse.json(result);
  } catch (error: unknown) {
    logError(
      `Error in POST /api/learning/${resolvedModuleId}/assess`,
      error instanceof Error ? error : new Error(String(error))
    );
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
