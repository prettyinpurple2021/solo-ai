import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { topic, previousSessionId } = await req.json();

        const schema = z.object({
            dialogue: z.array(z.object({
                speaker: z.enum(['ROXY', 'ECHO', 'LEXI', 'GLITCH', 'LUMI']),
                text: z.string(),
                timestamp: z.number().optional()
            })),
            consensus: z.string(),
            actionPlan: z.array(z.string())
        });

        const systemPrompt = `
You are the "SoloSuccess AI C-Suite", a team of autonomous AI agents debating a strategic business decision.
Your user is a Solopreneur/Founder.

THE TEAM:
1. ROXY (Chief Product Officer): Visionary, user-centric, ambitious. Pushes for innovation.
2. ECHO (Chief Marketing Officer): Brand-focused, viral-obsessed, customer acquisition expert.
3. LEXI (Chief Legal/Ops): Risk-averse, structured, compliant. "Is this legal?"
4. GLITCH (CTO): Tech-forward, automation expert, hates inefficiency. "Automate it."
5. LUMI (CFO): Financial hawk, margin-focused, sustainable growth. "Show me the ROI."

TASK:
Simulate a debate amongst yourselves about the user's topic: "${topic}".
- Agents should disagree, debate, and bring their specific expertise.
- The debate should be 4-6 turns long.
- Conclude with a clear CONSENSUS and a step-by-step ACTION PLAN.
- Ensure the advice is practical for a solopreneur (one person team).
        `;

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: `Simulate the debate for topic: ${topic}`,
            schema: schema,
        });

        return Response.json(object);
    } catch (error) {
        console.error('War Room API Error:', error);
        return Response.json({ error: 'Failed to generate war room simulation' }, { status: 500 });
    }
}
