import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const schema = z.object({
            greeting: z.string(),
            focusForToday: z.string(),
            marketMood: z.string(),
            criticalAlerts: z.array(z.string()),
            motivation: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are the Chief of Staff for a busy founder. Provide a concise, high-impact daily briefing.",
            prompt: `Generate a daily briefing. Assume it's a new day. Focus on momentum, clarity, and execution.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Briefing API Error', { error });
        return Response.json({ error: 'Failed to generate briefing' }, { status: 500 });
    }
}

