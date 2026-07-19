import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { getPostHogClient } from '@/lib/posthog-server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const session = await auth();
        const { businessName, description } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            title: z.string(),
            slides: z.array(z.object({
                title: z.string(),
                keyPoint: z.string(),
                content: z.array(z.string()),
                visualIdea: z.string()
            })),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a VC Pitch Deck specialist. Create a 10-slide deck structure for a startup.",
            prompt: `Create a pitch deck for "${businessName}". Description: "${description}". Follow the standard Sequoia format.`,
            schema: schema as any,
        });

        if (session?.user?.id) {
            const posthog = getPostHogClient();
            const result = object as { slides?: unknown[] };
            posthog.capture({
                distinctId: session.user.id,
                event: 'ai_pitch_deck_generated',
                properties: { slide_count: result.slides?.length },
            });
            await posthog.flush();
        }

        return Response.json(object);
    } catch (error) {
        logError('Pitch Deck API Error', { error });
        return Response.json({ error: 'Failed to generate pitch deck' }, { status: 500 });
    }
}

