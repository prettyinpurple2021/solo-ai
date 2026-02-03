import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        const schema = z.object({
            safetyScore: z.number(),
            verdict: z.string(),
            criticalRisks: z.array(z.string()),
            suggestions: z.array(z.string())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an AI Legal Assistant. Review contracts for dangerous clauses.",
            prompt: `Analyze this contract text: "${text.substring(0, 5000)}". Flag any critical risks or unfair terms. Give a safety score (0-100).`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Contract Analysis API Error:', error);
        return Response.json({ error: 'Failed to analyze contract' }, { status: 500 });
    }
}
