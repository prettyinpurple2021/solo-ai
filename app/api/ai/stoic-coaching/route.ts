import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { mood, stressLevel, primaryBlocker } = await req.json();

        const schema = z.object({
            stoicQuote: z.string(),
            reframing: z.string(),
            actionableStep: z.string(),
            breathingExercise: z.boolean().default(false)
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are Marcus Aurelius reborn as a startup coach. Offer Stoic wisdom for modern stress.",
            prompt: `User Mood: "${mood}". Stress Level: ${stressLevel}/10. Blocker: "${primaryBlocker}". Reframe this obstacle as the way.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Stoic Coaching API Error', { error });
        return Response.json({ error: 'Failed to generate coaching' }, { status: 500 });
    }
}

