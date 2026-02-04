import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { stack } = await req.json();

        const schema = z.object({
            score: z.number(),
            verdict: z.string(),
            pros: z.array(z.string()),
            cons: z.array(z.string()),
            recommendations: z.array(z.string())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a seasoned CTO. Evaluate this technology stack for scalability, maintenance, and modern standards.",
            prompt: `Audit this tech stack: "${stack}". Give a score (0-100), verdict, and recommendations.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Tech Audit API Error:', error);
        return Response.json({ error: 'Failed to audit tech stack' }, { status: 500 });
    }
}

