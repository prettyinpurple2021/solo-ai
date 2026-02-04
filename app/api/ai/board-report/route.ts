import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { financials, tasks, reports, contacts } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            date: z.string().default(() => new Date().toISOString()),
            ceoScore: z.number(),
            executiveSummary: z.string(),
            grades: z.array(z.object({
                agentId: z.enum(['ROXY', 'ECHO', 'LEXI', 'GLITCH', 'LUMI']),
                department: z.string(),
                grade: z.enum(['A', 'B', 'C', 'D', 'F']),
                score: z.number(),
                summary: z.string(),
                keyIssue: z.string()
            })),
            consensus: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are the Board of Directors. Evaluate the company's performance brutally but fairly.",
            prompt: `Generate a Board Meeting Report.
            Financials: ${JSON.stringify(financials)}
            Tasks Completion: ${tasks?.length || 0}
            Competitor Intel: ${reports?.length || 0}
            Network Growth: ${contacts?.length || 0}
            
            Grade each department (Product, Marketing, Legal, Tech, Finance). Give a CEO Score (0-100).`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Board Report API Error:', error);
        return Response.json({ error: 'Failed to generate board report' }, { status: 500 });
    }
}

