import { openai } from '@ai-sdk/openai';
import { embed as aiEmbed } from 'ai';

/**
 * Generate a text embedding using OpenAI's text-embedding-3-small
 * Dimensions: 1536
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await aiEmbed({
      model: openai.embedding('text-embedding-3-small'),
      value: text.replace(/\n/g, ' '),
    });
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}
