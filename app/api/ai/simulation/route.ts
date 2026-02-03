import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { scenario } = await req.json();

        const outcomeSchema = z.object({
            title: z.string(),
            probability: z.number(),
            timeline: z.string(),
            description: z.string(),
            keyEvents: z.array(z.string())
        });

        const schema = z.object({
            id: z.string().optional(),
            query: z.string(),
            likelyCase: outcomeSchema,
            bestCase: outcomeSchema,
            worstCase: outcomeSchema,
            strategicAdvice: z.string(),
            timestamp: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Futurist and Strategy Simulator. Model the outcomes of complex scenarios.",
            prompt: `Simulate potential outcomes for this scenario: "${scenario}". Analyze Likely, Best, and Worst cases.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Simulation API Error:', error);
        return Response.json({ error: 'Failed to run simulation' }, { status: 500 });
    }
}
