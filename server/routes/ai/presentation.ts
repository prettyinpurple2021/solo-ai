import express, { Request, Response } from 'express';
import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import { checkSuspended } from '../../middleware/checkSuspended';
import { logError } from '../../utils/logger';

const router = express.Router();

router.use((authMiddleware as any));
router.use(checkSuspended as any);

// Generate content for a slide
// Generate content for a slide
router.post('/generate-slide-content', async (req: Request, res: Response) => {
    try {
        const { prompt, slideContext, currentContent } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const schema = z.object({
            title: z.string().describe("Impactful title for the slide"),
            bulletPoints: z.array(z.string()).describe("3-5 key bullet points"),
            suggestedImageQuery: z.string().describe("Search query to find a relevant image")
        });

        type SlideContent = z.infer<typeof schema>;

        // Use Google Gemini via Vercel AI SDK
        const { object } = await generateObject({
            model: google('models/gemini-1.5-flash-latest'),
            schema: schema as any,
            prompt: `
                You are a professional pitch deck consultant.
                Task: Improve or generate content for a slide based on the following input: "${prompt}".
                
                Context about the slide: ${JSON.stringify(slideContext || {})}
                Current content: ${JSON.stringify(currentContent || {})}
                
                Output: A JSON object with a title, bullet points, and an image search query.
            `,
        }) as { object: SlideContent };

        // Convert bullet points to HTML for our text component
        const htmlContent = `
            <ul>
                ${object.bulletPoints.map((point: string) => `<li>${point}</li>`).join('')}
            </ul>
        `;

        return res.json({
            title: object.title,
            textPayload: htmlContent,
            imageQuery: object.suggestedImageQuery,
            isSuccess: true
        });

    } catch (error) {
        logError('AI Generation Error', error);
        return res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Rewrite text
router.post('/rewrite', async (req: Request, res: Response) => {
    try {
        const { text, tone } = req.body; // tone: 'professional', 'persuasive', 'concise'

        const { text: rewritten } = await generateText({
            model: google('models/gemini-1.5-flash-latest'),
            prompt: `Rewrite the following text to be more ${tone || 'professional'} and suitable for a pitch deck slide: "${text}"`,
        });

        res.json({ rewritten });
    } catch (error) {
        logError('AI Rewrite Error', error);
        res.status(500).json({ error: 'Failed to rewrite text' });
    }
});

export default router;
