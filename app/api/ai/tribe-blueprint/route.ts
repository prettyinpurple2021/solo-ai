import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { audience, manifesto } = await req.json();

        const schema = z.object({
            targetAudience: z.string().optional(),
            platform: z.string().optional(),
            manifesto: z.object({
                title: z.string(),
                enemy: z.string(),
                belief: z.string(),
                tagline: z.string()
            }),
            rituals: z.array(z.object({
                name: z.string(),
                frequency: z.string(),
                description: z.string(),
                action: z.string()
            })),
            engagementLoops: z.array(z.string()),
            growthTactics: z.array(z.string()).optional(),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert Community Builder. Design a 'Tribe Blueprint' for a loyal audience.",
            prompt: `Build a community strategy for: "${audience}". Manifesto context: "${manifesto}". Focus on rituals and shared identity.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Tribe Blueprint API Error:', error);
        return Response.json({ error: 'Failed to generate tribe blueprint' }, { status: 500 });
    }
}
