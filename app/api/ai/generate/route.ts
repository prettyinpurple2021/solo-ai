
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OpenAI } from 'openai';
import { logError } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type, context } = await req.json();

    if (type === 'vision_board') {
      const prompt = `Generate a structured vision board for a user with the following goals/interests: ${context || 'general success'}. 
      Return a JSON object with:
      - vision_statement: a powerful 1-sentence statement.
      - core_values: array of 3-5 strings.
      - elements: array of objects { category: "Business"|"Personal"|"Financial", title: string, description: string }.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: 'You are a motivational coach helper.' }, { role: 'user', content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = JSON.parse(completion.choices[0].message.content || '{}');
      return NextResponse.json(content);
    }

    return new NextResponse('Invalid Type', { status: 400 });

  } catch (error) {
    logError('AI Generation Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
