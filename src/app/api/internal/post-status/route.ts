import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database-client';
import { communityPosts, communityTopics, users } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';
import { logInfo, logError } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const secret = process.env.INTERNAL_AGENT_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, type } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Missing content' }, { status: 400 });
    }

    logInfo(`[Internal Agent] Received status update: ${content.substring(0, 50)}...`);

    const db = getDb();
    
    try {
        // Find or create "general" topic
        let [topic] = await db.select().from(communityTopics).where(eq(communityTopics.slug, 'general')).limit(1);
        if (!topic) {
            [topic] = await db.insert(communityTopics).values({
                name: 'General',
                slug: 'general',
                description: 'General discussion'
            }).returning();
        }

        // Find an admin user to be the author
        const [admin] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
        if (!admin) {
            throw new Error('No admin user found to post status update');
        }

        await db.insert(communityPosts).values({
            user_id: admin.id,
            topic_id: topic.id,
            title: `Engineering Update: ${new Date().toLocaleDateString()}`,
            content: content,
            tags: ['engineering', 'update'],
            created_at: new Date(),
            updated_at: new Date(),
        });
        
        return NextResponse.json({ success: true, message: 'Status update posted successfully' });
    } catch (dbError: any) {
        logError("Database error saving status update:", dbError);
        return NextResponse.json({ success: false, error: 'Database error', details: dbError.message }, { status: 500 });
    }

  } catch (error: any) {
    logError("Error in status update API:", error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
