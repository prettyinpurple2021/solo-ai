import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { idea, type, context } = await req.json();

        const schema = z.object({
            roastSummary: z.string(),
            survivalScore: z.number(),
            feedback: z.array(z.string()),
            rewrittenContent: z.string().optional()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are The Incinerator. Your job is to brutally critique marketing copy and business ideas to make them bulletproof.",
            prompt: `Roast this ${type}: "${idea}". Context: ${context || 'None'}. Be harsh but constructive. Rewrite it if it's bad.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Incinerator API Error:', error);
        return Response.json({ error: 'Failed to incinerate content' }, { status: 500 });
    }
}

