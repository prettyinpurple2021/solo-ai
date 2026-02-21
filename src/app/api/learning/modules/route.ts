import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawModules = await LearningEngine.getAllModules();
    
    // Transform to match generic UI interface if needed
    const modules = rawModules.map(m => ({
      id: m.id,
      title: m.title,
      // Use path description or generic text if module description missing
      description: m.path?.description || `Module ${m.order} of ${m.path?.title}`,
      duration_minutes: m.duration_minutes || 10,
      difficulty: m.path?.difficulty || 'beginner',
      category: m.path?.category || 'General',
      skills_covered: [], // Placeholder
      prerequisites: [], // Placeholder
      completion_rate: 0,
      rating: 4.5
    }));

    return NextResponse.json(modules);
  } catch (error) {
    logError('Error fetching modules', { error });
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
