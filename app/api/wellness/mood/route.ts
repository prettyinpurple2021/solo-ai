import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { WellnessEngine } from '@/lib/wellness';
import { z } from 'zod';

const moodSchema = z.object({
  energyLevel: z.number().min(1).max(5),
  moodLabel: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const result = moodSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
    }

    const engine = new WellnessEngine(user.id);
    await engine.logMood(result.data.energyLevel, result.data.moodLabel || '', result.data.note);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error logging mood:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
