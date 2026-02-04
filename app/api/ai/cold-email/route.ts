import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { contact } = await req.json();

        const schema = z.object({
            text: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert Copywriter. Write high-conversion cold outreach emails.",
            prompt: `Write a cold email to: ${contact.name} (${contact.role} at ${contact.company}). Notes: ${contact.notes}. Keep it short, personalized, and value-driven.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Cold Email API Error:', error);
        return Response.json({ error: 'Failed to generate email' }, { status: 500 });
    }
}

