import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningEngine = new LearningEngine(session.user.id);
    const path = await learningEngine.getPathWithProgress(params.id);

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}
