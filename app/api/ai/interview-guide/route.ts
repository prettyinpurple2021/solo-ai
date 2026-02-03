import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { role, focus } = await req.json();

        const schema = z.object({
            roleTitle: z.string(),
            questions: z.array(z.object({
                question: z.string(),
                whatToLookFor: z.string(),
                redFlag: z.string()
            })),
            updatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert interviewer. Create a structured interview guide to vet candidates deeply.",
            prompt: `Create an interview guide for a "${role}". Primary focus area: "${focus}". Include questions, green flags, and red flags.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Interview Guide API Error:', error);
        return Response.json({ error: 'Failed to generate interview guide' }, { status: 500 });
    }
}
