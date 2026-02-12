import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningEngine = new LearningEngine(session.user.id);
    const recommendations = await learningEngine.getPersonalizedRecommendations();
    return NextResponse.json(recommendations);
  } catch (error) {
    logError('Error fetching recommendations', { error });
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
