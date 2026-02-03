import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { product, context } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            productName: z.string(),
            phases: z.array(z.object({
                name: z.string(),
                duration: z.string(),
                actions: z.array(z.string()),
                events: z.array(z.object({
                    day: z.string(),
                    title: z.string(),
                    description: z.string(),
                    owner: z.string(),
                    channel: z.string()
                }))
            })),
            channels: z.array(z.string()),
            launchDate: z.string().default(() => new Date().toISOString()),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Product Launch Specialist. Orchestrate a hype-building launch campaign.",
            prompt: `Create a launch strategy for: "${product}". Context: "${context}". Break it down into phases (Pre-launch, Launch Day, Post-launch).`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Launch Strategy API Error:', error);
        return Response.json({ error: 'Failed to generate launch strategy' }, { status: 500 });
    }
}
