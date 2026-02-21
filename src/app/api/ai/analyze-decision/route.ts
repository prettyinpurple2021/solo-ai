import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { logError, logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { decisionTitle, context, options } = await req.json();

    if (!decisionTitle || !options || options.length === 0) {
      return NextResponse.json({ error: 'Missing decision data' }, { status: 400 });
    }

    logInfo(`Analyzing decision for user ${session.user.id}: ${decisionTitle}`);

    const optionsText = options.map((o: any, i: number) => `
        Option ${i + 1}: ${o.title}
        Description: ${o.description}
        Pros: ${o.pros.join(', ')}
        Cons: ${o.cons.join(', ')}
        Impact Score: ${o.impactScore}/100
        Confidence: ${o.confidenceScore}/100
        Risk Level: ${o.riskLevel}/100
      `).join('\n');

    const prompt = `
      You are an elite business strategist and AI advisor for a solo entrepreneur.
      Analyze the following decision and provide 3-5 concise, high-impact insights.

      DECISION: ${decisionTitle}
      CONTEXT: ${context || 'No additional context provided.'}

      OPTIONS:
      ${optionsText}

      INSTRUCTIONS:
      1. Evaluate the trade-offs between options.
      2. Identify hidden risks or opportunities.
      3. Suggest a clear path forward based on the scores and business context.
      4. Be direct, professional, and empowering.
      5. Return ONLY a JSON array of strings, where each string is an insight.
    `;

    const { text } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt,
      temperature: 0.7,
    });

    // Extract JSON array from response
    const insightsMatch = text.match(/\[.*\]/s);
    const insights = insightsMatch ? JSON.parse(insightsMatch[0]) : [
      "Based on your options, prioritize the one with the highest impact-to-risk ratio.",
      "Consider resource allocation carefully before proceeding.",
      "Ensure stakeholder alignment is secured for your top choice."
    ];

    return NextResponse.json({ insights });

  } catch (error) {
    logError('Decision analysis API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
