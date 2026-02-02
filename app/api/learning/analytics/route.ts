import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningEngine = new LearningEngine(session.user.id);
    const analytics = await learningEngine.getLearningAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}