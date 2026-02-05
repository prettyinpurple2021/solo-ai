import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { GamificationEngine } from '@/lib/gamification';

export async function GET() {
  const { user, error } = await authenticateRequest();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const engine = new GamificationEngine(user.id);
    const badges = await engine.getBadges();
    return NextResponse.json(badges);
  } catch (err) {
    console.error('Error fetching badges:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
