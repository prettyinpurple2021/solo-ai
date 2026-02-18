import { db } from '@/db';
import { searchIndex } from '@/shared/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { logError } from '@/lib/logger';

export interface RagSearchResult {
  id: number;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  similarity: number;
  metadata: any;
}

export class RagService {
  /**
   * Perform semantic search on the user's briefcase/knowledge base
   */
  static async search(userId: string, query: string, limit: number = 5): Promise<RagSearchResult[]> {
    try {
      const embedding = await generateEmbedding(query);
      const vectorStr = `[${embedding.join(',')}]`;

      // Use pgvector cosine distance: 1 - (embedding <=> vector)
      const results = await db.execute(sql`
        SELECT 
          id, 
          entity_type as "entityType", 
          entity_id as "entityId", 
          title, 
          content, 
          metadata,
          1 - (embedding <=> ${vectorStr}::vector) as similarity
        FROM search_index
        WHERE user_id = ${userId}
        AND 1 - (embedding <=> ${vectorStr}::vector) > 0.5
        ORDER BY similarity DESC
        LIMIT ${limit}
      `);

      return results.rows as unknown as RagSearchResult[];
    } catch (error) {
      logError('RAG Search failed', error);
      return [];
    }
  }

  /**
   * Format search results into a context string with citations for the AI agent
   */
  static formatResultsForPrompt(results: RagSearchResult[]): string {
    if (results.length === 0) return '';

    let context = `\n\n## Briefcase Knowledge Base (Contextual Research)\n`;
    context += `The following information was retrieved from your briefcase and internal documents. Use these as primary sources and CITE them using [Source ID] notation.\n\n`;

    results.forEach((result, index) => {
      const sourceId = index + 1;
      context += `[Source ${sourceId}] Title: ${result.title} (${result.entityType})\n`;
      context += `Content: ${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}\n\n`;
    });

    context += `Instructions: When using the information above, refer to it explicitly. If the information is insufficient, state that your internal research returned limited results for that specific detail.`;
    
    return context;
  }
}
