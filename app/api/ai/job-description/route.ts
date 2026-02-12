import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { role, culture } = await req.json();

        const schema = z.object({
            roleTitle: z.string(),
            hook: z.string(),
            responsibilities: z.array(z.string()),
            requirements: z.array(z.string()),
            perks: z.array(z.string()),
            cultureFit: z.string().optional(),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert HR strategist for lean, high-performance startups. Write compelling, non-corporate job descriptions.",
            prompt: `Write a job description for a "${role}". The company culture/vibe is: "${culture}". Make it sound appealing to top talent.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Job Description API Error', { error });
        return Response.json({ error: 'Failed to generate JD' }, { status: 500 });
    }
}

