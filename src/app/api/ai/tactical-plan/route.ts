import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { goal } = await req.json();

        const schema = z.object({
            goal: z.string(),
            tasks: z.array(z.object({
                id: z.string(),
                title: z.string(),
                description: z.string(),
                status: z.enum(['todo', 'in-progress', 'done', 'backlog']),
                priority: z.enum(['low', 'medium', 'high', 'critical']),
                createdAt: z.string()
            })),
            createdAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert Project Manager. Break down goals into actionable, tactical steps.",
            prompt: `Create a tactical plan for this goal: "${goal}". Break it down into 5-10 specific tasks.`,
            schema: schema as any,
        });

        return Response.json((object as any).tasks); // Service expects array of tasks
    } catch (error) {
        logError('Tactical Plan API Error', { error });
        return Response.json([], { status: 500 });
    }
}

