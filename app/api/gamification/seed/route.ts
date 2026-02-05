import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { GamificationEngine } from '@/lib/gamification';

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  
  // Strict check: Only authorized users or specific admins should run this.
  // For MVP/Dev, we allow authenticated users to trigger it (idempotent).
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await GamificationEngine.seedDefaults();
    return NextResponse.json({ success: true, message: 'Badges seeded successfully' });
  } catch (err) {
    console.error('Error seeding badges:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
