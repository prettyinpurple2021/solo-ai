import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { idea } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            featureName: z.string(),
            summary: z.string(),
            features: z.array(z.object({
                name: z.string(),
                userStory: z.string(),
                acceptanceCriteria: z.array(z.string()),
                techNotes: z.string()
            })),
            dataModel: z.array(z.string()),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Senior Product Manager. Write a PRD (Product Requirements Document) for a new feature.",
            prompt: `Write a Product Spec for this idea: "${idea}". Include user stories, acceptance criteria, and a rough data model.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Product Spec API Error', { error });
        return Response.json({ error: 'Failed to generate product spec' }, { status: 500 });
    }
}

