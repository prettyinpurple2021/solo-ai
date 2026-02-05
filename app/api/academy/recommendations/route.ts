import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';

export async function GET() {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const engine = new LearningEngine(user.id);
    const recommendations = await engine.getPersonalizedRecommendations();
    
    return NextResponse.json(recommendations);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
