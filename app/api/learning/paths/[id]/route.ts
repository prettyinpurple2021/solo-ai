import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const path = await LearningEngine.getPathWithProgress(
      params.id,
      session.user.id
    );

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
