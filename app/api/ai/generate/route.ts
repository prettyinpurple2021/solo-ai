
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { openai } from '@/lib/ai-config';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type, context } = await req.json();

    if (type === 'vision_board') {
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: 'You are a motivational coach helper.',
        prompt: `Generate a structured vision board for a user with the following goals/interests: ${context || 'general success'}.`,
        schema: z.object({
          vision_statement: z.string().describe('a powerful 1-sentence statement'),
          core_values: z.array(z.string()).min(3).max(5),
          elements: z.array(z.object({
            category: z.enum(["Business", "Personal", "Financial"]),
            title: z.string(),
            description: z.string()
          }))
        })
      });

      return NextResponse.json(object);
    }

    return new NextResponse('Invalid Type', { status: 400 });

  } catch (error) {
    logError('AI Generation Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
