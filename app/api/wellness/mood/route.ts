import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { WellnessEngine } from '@/lib/wellness';
import { z } from 'zod';
import { logError } from '@/lib/logger';

const moodSchema = z.object({
  energyLevel: z.number().min(1).max(5),
  moodLabel: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Malformed JSON', details: e instanceof Error ? e.message : 'Unknown error' }, { status: 400 });
    }

    const result = moodSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
    }

    const engine = new WellnessEngine(user.id);
    await engine.logMood(result.data.energyLevel, result.data.moodLabel || '', result.data.note || '');

    return NextResponse.json({ success: true });
  } catch (err) {
    logError('Error logging mood', { error: err });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
