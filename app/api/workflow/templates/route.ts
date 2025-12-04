
import { NextResponse } from 'next/server'
import { db } from '@/lib/database-client'
import { workflowTemplates } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export async function GET() {
    try {
        const templates = await db.select().from(workflowTemplates).orderBy(desc(workflowTemplates.created_at))

        // Transform DB records to match frontend interface if necessary
        // Assuming the JSONB fields match the interface
        const formattedTemplates = templates.map(template => ({
            id: template.id.toString(),
            name: template.name,
            description: template.description || '',
            category: template.category || 'general',
            tags: (template.tags as string[]) || [],
            complexity: 'Medium', // Default as not in DB
            estimatedTime: '5 min', // Default as not in DB
            popularity: template.usage_count || 0,
            rating: 0, // Default as not in DB
            reviews: 0, // Default as not in DB
            author: { name: 'System', avatar: '' }, // Default, could fetch user
            preview: '', // Default as not in DB
            workflow: template.workflow_data as any,
            metadata: {}, // Default as not in DB
            createdAt: template.created_at || new Date(),
            updatedAt: template.updated_at || new Date()
        }))

        return NextResponse.json(formattedTemplates)
    } catch (error) {
        logError('Failed to fetch workflow templates:', error)
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}
