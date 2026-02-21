import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { contact } = await req.json();

        const schema = z.object({
            strategy: z.string(),
            leveragePoints: z.array(z.string()),
            psychologicalProfile: z.string(),
            openingLine: z.string()
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Master Negotiator (like Chris Voss). Prepare the user for a high-stakes deal.",
            prompt: `Prepare for a negotiation with: ${contact.name} (${contact.role}). Context: ${contact.notes}. Give me leverage points and a psychological profile.`,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Negotiation Prep API Error', { error });
        return Response.json({ error: 'Failed to generate negotiation prep' }, { status: 500 });
    }
}

