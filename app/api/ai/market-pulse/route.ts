import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { industry } = await req.json();

        const schema = z.object({
            content: z.string(),
            sources: z.array(z.object({
                title: z.string(),
                uri: z.string()
            }))
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Market Trend Analyst. Summarize the pulse of the industry.",
            prompt: `What's happening right now in the "${industry}" market? Summarize key trends and news.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Market Pulse API Error:', error);
        return Response.json({ error: 'Failed to generate market pulse' }, { status: 500 });
    }
}
