// This endpoint uses DALL-E 3 for image generation

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { promptUser, styleDesc } = await req.json();
        
        const finalPrompt = `Create a brand image. User Request: "${promptUser}". Style: "${styleDesc}". High quality, professional, modern design.`;

        const { image } = await generateImage({
            model: openai.image('dall-e-3'),
            prompt: finalPrompt,
        });

        return Response.json({ image: image.base64 }); 
    } catch (error) {
        console.error('Brand Image API Error:', error);
        return Response.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
