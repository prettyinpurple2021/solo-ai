import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { scenario, history, userInput } = await req.json();

        const schema = z.object({
            text: z.string()
        });

        const prompt = `
Scenario: ${scenario.title} (${scenario.difficulty} difficulty).
Opponent: ${scenario.opponentRole} (${scenario.opponentPersona}).
Objective: ${scenario.objective}.

History:
${JSON.stringify(history)}

User just said: "${userInput}"

Reply as the opponent. Stay in character. Be challenging if difficulty is high.
        `;

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: "You are an expert roleplay actor for sales/negotiation training.",
            prompt: prompt,
            schema: schema as any,
        });

        return Response.json(object);
    } catch (error) {
        logError('Roleplay Reply API Error', { error });
        return Response.json({ error: 'Failed to generate reply' }, { status: 500 });
    }
}

