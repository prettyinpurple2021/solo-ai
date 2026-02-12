import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { type, details } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            title: z.string(),
            type: z.enum(['NDA', 'Contractor Agreement', 'SaaS Terms of Service', 'Privacy Policy', 'Offer Letter']),
            content: z.string(),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an elite Corporate Lawyer. Draft ironclad legal documents.",
            prompt: `Draft a "${type}". Details: "${details}". Ensure it is comprehensive and professional.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Legal Doc API Error', { error });
        return Response.json({ error: 'Failed to draft legal document' }, { status: 500 });
    }
}

