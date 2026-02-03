import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { processName, goal } = await req.json();

        const schema = z.object({
            taskName: z.string(),
            goal: z.string(),
            steps: z.array(z.object({
                step: z.number(),
                action: z.string(),
                details: z.string()
            })),
            successCriteria: z.string(),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are 'The Architect', an expert in business systems and SOPs. You turn vague tasks into rigorous protocols.",
            prompt: `Create a Standard Operating Procedure (SOP) for: "${processName}". Goal: "${goal}". Break it down into clear, actionable steps.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('SOP API Error:', error);
        return Response.json({ error: 'Failed to generate SOP' }, { status: 500 });
    }
}
