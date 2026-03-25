import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logError } from './logger';

dotenv.config({ path: '../.env.local' });
dotenv.config();

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

/**
 * Generate a text embedding using OpenAI's text-embedding-3-small
 * Dimensions: 1536
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const openai = getOpenAIClient();

        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.replace(/\n/g, ' '),
        });

        return response.data[0].embedding;
    } catch (error) {
        logError('Error generating embedding', error);
        throw error;
    }
}
