import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { platform, goal } = await req.json();

        const schema = z.object({
            platform: z.string().optional(),
            frequency: z.string(),
            contentTypes: z.array(z.string()),
            growthTactics: z.array(z.string()),
            pillars: z.array(z.object({
                title: z.string(),
                description: z.string()
            })),
            cadence: z.string(),
            personaTactics: z.array(z.object({
                persona: z.string(),
                tactic: z.string()
            })),
            sampleHooks: z.array(z.string())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Social Media Growth Hacker. Create a viral strategy.",
            prompt: `Create a social media strategy for "${platform || 'All Platforms'}". Goal: "${goal}". Focus on high engagement and organic growth.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Social Strategy API Error', { error });
        return Response.json({ error: 'Failed to generate social strategy' }, { status: 500 });
    }
}

