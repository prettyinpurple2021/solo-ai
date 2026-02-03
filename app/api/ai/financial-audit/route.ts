import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { data } = await req.json();

        const schema = z.object({
            runwayScore: z.number(),
            verdict: z.string(),
            strategicMoves: z.array(z.string()),
            riskFactors: z.array(z.string())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a ruthless CFO. Audit the financial health of this startup.",
            prompt: `Audit this financial data: ${JSON.stringify(data)}. Calculate runway anxiety, burn rate efficiency, and give a verdict.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Financial Audit API Error:', error);
        return Response.json({ error: 'Failed to audit financials' }, { status: 500 });
    }
}
