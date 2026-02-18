
'use server'

import { db } from '@/db';
import { warRoomSessions } from '@/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { logError } from '@/lib/logger';

const simulateSchema = z.object({
  topic: z.string().min(5),
});

export async function simulateWarRoom(data: z.infer<typeof simulateSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = simulateSchema.parse(data);

  try {
    const schema = z.object({
      dialogue: z.array(z.object({
        speaker: z.enum(['ROXY', 'ECHO', 'LEXI', 'GLITCH', 'LUMI']),
        text: z.string(),
        timestamp: z.number().optional()
      })),
      consensus: z.string(),
      actionPlan: z.array(z.string())
    });

    const systemPrompt = `
You are the "SoloSuccess AI C-Suite", a team of autonomous AI agents debating a strategic business decision.
Your user is a Solopreneur/Founder.

THE TEAM:
1. ROXY (Chief Product Officer): Visionary, user-centric, ambitious. Pushes for innovation.
2. ECHO (Chief Marketing Officer): Brand-focused, viral-obsessed, customer acquisition expert.
3. LEXI (Chief Legal/Ops): Risk-averse, structured, compliant. "Is this legal?"
4. GLITCH (CTO): Tech-forward, automation expert, hates inefficiency. "Automate it."
5. LUMI (CFO): Financial hawk, margin-focused, sustainable growth. "Show me the ROI."

TASK:
Simulate a debate amongst yourselves about the user's topic: "${validated.topic}".
- Agents should disagree, debate, and bring their specific expertise.
- The debate should be 4-6 turns long.
- Conclude with a clear CONSENSUS and a step-by-step ACTION PLAN.
- Ensure the advice is practical for a solopreneur (one person team).
    `;

    const result = await generateObject({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: `Simulate the debate for topic: ${validated.topic}`,
      schema: schema as any,
    });

    const object = result.object as z.infer<typeof schema>;

    // Save result to DB
    const [newSession] = await db.insert(warRoomSessions).values({
      userId: user.id,
      topic: validated.topic,
      status: 'completed',
      consensus: object.consensus,
      actionPlan: object.actionPlan,
      dialogue: object.dialogue,
      state: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    revalidatePath('/dashboard/war-room');
    return { success: true, session: newSession };
  } catch (err: unknown) {
    if (err instanceof Error) {
        logError('War Room Simulation Failed', err);
    } else {
        logError('War Room Simulation Failed', { error: String(err) });
    }
    throw new Error("Simulation failed");
  }
}

export async function deleteWarRoomSession(id: string) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.delete(warRoomSessions)
    .where(and(eq(warRoomSessions.id, id), eq(warRoomSessions.userId, user.id)));

  revalidatePath('/dashboard/war-room');
  return { success: true };
}
