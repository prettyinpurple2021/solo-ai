import { logger, logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { generateText } from 'ai'
import { getTeamMemberConfig } from '@/lib/ai-config'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const incineratorSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    targetAudience: z.string().min(1).max(200),
    problemSolved: z.string().min(1).max(500)
})

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const { allowed } = rateLimitByIp('api', ip, 60000, 5) // Strict rate limit for AI calls
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many incineration attempts. Cool down.' },
                { status: 429 }
            )
        }

        // Authentication
        const { user, error } = await authenticateRequest()
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized access to the Incinerator' },
                { status: 401 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validatedData = incineratorSchema.parse(body)

        // Get Blaze's configuration (Growth & Sales Strategist)
        const blazeConfig = getTeamMemberConfig('blaze')

        const prompt = `
        You are acting as the "Idea Incinerator". Your goal is to brutally validate business ideas.
        
        Analyze the following business idea:
        - **Title:** ${validatedData.title}
        - **Problem Solved:** ${validatedData.problemSolved}
        - **Target Audience:** ${validatedData.targetAudience}
        - **Description:** ${validatedData.description}

        Provide a JSON response with the following structure:
        {
            "score": number (0-100, be strict! >70 is rare),
            "feedback": ["string", "string", "string"] (3-5 critical, hard-hitting points about why it might fail),
            "pivots": ["string", "string"] (2-3 constructive pivot suggestions to make it viable),
            "marketContext": "string" (A brief analysis of the market saturation and challenges)
        }

        Be direct, no fluff. If it's a bad idea, say so. If it's generic, call it out.
        `

        const { text } = await generateText({
            model: blazeConfig.model as any,
            system: blazeConfig.systemPrompt,
            prompt: prompt,
            temperature: 0.7,
            maxOutputTokens: 1000,
        })

        let result;
        try {
            // Attempt to parse the JSON response
            // Sometimes models wrap JSON in markdown code blocks, so we clean that up
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            result = JSON.parse(cleanedText);
        } catch (e) {
            logger.error('Failed to parse AI response', { text, error: e });
            // Fallback if parsing fails
            result = {
                score: 50,
                feedback: ["AI output parsing failed, but your idea needs work.", "Refine your pitch and try again."],
                pivots: ["Simplify the core value proposition."],
                marketContext: "Analysis unavailable due to technical glitch."
            };
        }

        return NextResponse.json({
            ...result,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        logError('Incinerator error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid idea data', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'The Incinerator malfunctioned. Try again.' },
            { status: 500 }
        )
    }
}
