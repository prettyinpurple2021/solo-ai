import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { scenario, history } = await req.json();

        const schema = z.object({
            score: z.number(),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            proTip: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Communication Coach. Evaluate this roleplay session.",
            prompt: `Review this interaction: ${JSON.stringify(history)}. Scenario: ${scenario.title}. Give a score (0-100) and actionable feedback.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Roleplay Feedback API Error:', error);
        return Response.json({ error: 'Failed to evaluate roleplay' }, { status: 500 });
    }
}

