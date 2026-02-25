import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LearningEngineService } from '@/lib/services/learning-engine-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { assessmentId, answers } = body;

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Submit assessment using the learning engine service
    const result = await LearningEngineService.submitAssessment(session.user.id, assessmentId, answers);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in POST /api/learning/${params.moduleId}/assess:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
