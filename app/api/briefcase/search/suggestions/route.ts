import { logError, logWarn,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'




// Suggestion type definition
type Suggestion = {
  type: string
  query?: string
  label?: string
  count?: number
  text?: string
}



export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, semantic = false } = await request.json()

    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] })
    }

    const sql = getSql()

    // Get user's documents for context
    const documents = await sql`
      SELECT name, category, tags, description, file_type
      FROM documents 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC 
      LIMIT 50
    ` as any[]

    // Get available tags and categories
    const tags = await sql`
      SELECT DISTINCT jsonb_array_elements_text(tags) as tag
      FROM documents 
      WHERE user_id = ${user.id} AND tags IS NOT NULL
      LIMIT 20
    ` as any[]

    const categories = await sql`
      SELECT DISTINCT category
      FROM documents 
      WHERE user_id = ${user.id} AND category IS NOT NULL
      LIMIT 10
    ` as any[]

    // Use explicit type for suggestions array
    const suggestions: Suggestion[] = []

    // Basic suggestions based on existing data
    if (!semantic) {
      // Tag suggestions
      tags
        .filter((tag: any) => tag.tag && tag.tag.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .forEach((tag: any) => {
          suggestions.push({
            query: tag.tag,
            label: `Tag: ${tag.tag}`,
            type: 'tag'
          })
        })

      // Category suggestions
      categories
        .filter((cat: any) => cat.category && cat.category.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .forEach((cat: any) => {
          suggestions.push({
            query: cat.category,
            label: `Category: ${cat.category}`,
            type: 'category'
          })
        })

      // File name suggestions
      documents
        .filter((doc: any) => doc.name && doc.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .forEach((doc: any) => {
          suggestions.push({
            query: doc.name,
            label: `File: ${doc.name}`,
            type: 'filename'
          })
        })

      return NextResponse.json({ suggestions })
    }

    // AI-powered semantic suggestions using worker
    try {
      const context = {
        userDocuments: documents.slice(0, 20).map(doc => ({
          name: doc.name,
          category: doc.category,
          tags: doc.tags,
          description: doc.description,
          fileType: doc.file_type
        })),
        availableTags: tags.map((t: any) => t.tag).filter(Boolean),
        availableCategories: categories.map((c: any) => c.category).filter(Boolean)
      }

      const requestBody = {
        query: query,
        context: context,
        task: 'search_suggestions'
      };

      // Get worker environment
      const env = process.env as any;
      const googleAIWorker = env.GOOGLE_AI_WORKER;
      
      if (googleAIWorker) {
        // Call Google AI worker
        const response = await googleAIWorker.fetch('https://worker/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && Array.isArray(result.suggestions)) {
            suggestions.push(...result.suggestions);
          }
        }
      } else {
        logWarn('Google AI worker not available for suggestions');
      }
    } catch (aiError) {
      logError('AI suggestion generation failed:', aiError)
      // Continue with basic suggestions
    }

    // Add basic suggestions as fallback
    tags
      .filter((tag: any) => tag.tag && tag.tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .forEach((tag: any) => {
        suggestions.push({
          query: tag.tag,
          label: `Tag: ${tag.tag}`,
          type: 'tag'
        })
      })

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
    })

  } catch (error) {
    logError('Search suggestions error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate suggestions' 
    }, { status: 500 })
  }
}