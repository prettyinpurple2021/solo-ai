import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { industry } = await req.json();

        const schema = z.object({
            currentIndustry: z.string(),
            gaps: z.array(z.object({
                name: z.string(),
                description: z.string(),
                competitionScore: z.number(),
                profitabilityScore: z.number(),
                soloFitScore: z.number(),
                whyItWorks: z.string(),
                firstStep: z.string()
            }))
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Blue Ocean Strategy consultant. Find uncontested market space.",
            prompt: `Analyze the "${industry}" industry. Identify 3 "Blue Ocean" opportunities where competition is irrelevant.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Blue Ocean API Error:', error);
        return Response.json({ error: 'Failed to find blue oceans' }, { status: 500 });
    }
}
