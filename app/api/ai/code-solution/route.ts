import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { problem } = await req.json();

        const schema = z.object({
            language: z.string(),
            code: z.string(),
            explanation: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Senior Software Engineer. Provide clean, documented, and optimal code solutions.",
            prompt: `Solve this coding problem: "${problem}". Provide the code and a brief explanation.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Code Solution API Error:', error);
        return Response.json({ error: 'Failed to generate code solution' }, { status: 500 });
    }
}
