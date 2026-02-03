import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { content, platforms } = await req.json();

        const schema = z.object({
            id: z.string().optional(),
            originalContent: z.string().optional(),
            twitterThread: z.array(z.string()),
            linkedinPost: z.string(),
            tiktokScript: z.string(),
            newsletterSection: z.string(),
            viralHooks: z.array(z.string()),
            generatedAt: z.string().default(() => new Date().toISOString())
        });

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are a Content Repurposing Expert. Turn one piece of content into a multi-channel campaign.",
            prompt: `Amplify this content: "${content}". Adapt it for: ${platforms?.join(', ') || 'Twitter, LinkedIn, TikTok, Newsletter'}.`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Content Amplifier API Error:', error);
        return Response.json({ error: 'Failed to amplify content' }, { status: 500 });
    }
}
