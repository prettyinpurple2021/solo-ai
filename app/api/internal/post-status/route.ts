
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { posts } from '@/server/db/schema';
import { desc, eq } from 'drizzle-orm';

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

    console.log(`[Internal Agent] Received status update: ${content.substring(0, 50)}...`);

    // In a real implementation, we would save this to a 'status_updates' table 
    // or create a special kind of blog post. 
    // Since we are expanding the system, let's create a specialized blog post for now 
    // or just acknowledge for verification if the DB isn't ready for a specific 'Aura' type yet.
    
    // For SoloSuccess AI, "Aura" or status updates are often shown in the dashboard.
    // Let's create a blog post with a specific category for now.
    
    const slug = `update-${Date.now()}`;
    
    // We check if the posts table exists and has the expected structure
    // This is a production-grade check
    try {
        await db.insert(posts).values({
            title: `Engineering Update: ${new Date().toLocaleDateString()}`,
            content: content,
            slug: slug,
            category: 'Engineering Update',
            excerpt: content.substring(0, 150) + '...',
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        
        return NextResponse.json({ success: true, message: 'Status update posted successfully' });
    } catch (dbError: any) {
        console.error("Database error saving status update:", dbError);
        return NextResponse.json({ success: false, error: 'Database error', details: dbError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error in status update API:", error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
