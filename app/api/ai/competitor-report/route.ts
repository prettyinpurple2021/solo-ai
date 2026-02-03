import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { url, name } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            competitorName: z.string(),
            url: z.string(),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            vulnerabilities: z.array(z.string()),
            pricingModel: z.string(),
            marketingChannels: z.array(z.string()),
            threatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']),
            metrics: z.object({
                innovation: z.number(),
                marketPresence: z.number(),
                ux: z.number(),
                pricing: z.number(),
                velocity: z.number()
            }),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are 'The Scout', an elite competitive intelligence agent. Your job is to analyze competitors and find their weak points.",
            prompt: `Analyze the competitor: ${name} (${url}). Infer their strategy, strengths, and weaknesses based on typical patterns in their industry. Provide a threat assessment.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Competitor Report API Error:', error);
        return Response.json({ error: 'Failed to generate competitor report' }, { status: 500 });
    }
}
