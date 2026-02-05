import { NextResponse } from 'next/server';
import { db } from "@/db";
import { learningPaths, learningModules } from "@/db/schema";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // Check if paths exist
    const existing = await db.query.learningPaths.findFirst();
    if (existing) {
        return NextResponse.json({ message: 'Data already exists' });
    }

    const pathId = uuidv4();
    
    // Create "SoloSuccess Launchpad" path
    await db.insert(learningPaths).values({
        id: pathId,
        title: 'SoloSuccess Launchpad',
        description: 'The essential guide to launching your one-person business. Covers mindset, legal basics, and initial marketing setup.',
        category: 'Business',
        difficulty: 'beginner',
        tags: ['startup', 'basics'],
        is_public: true
    });

    // Create Modules
    await db.insert(learningModules).values([
        {
            path_id: pathId,
            title: 'The Solopreneur Mindset',
            content: 'Being a solopreneur requires a shift in thinking. You are no longer an employee; you are the CEO, the marketer, and the product.',
            module_type: 'article',
            order: 1,
            duration_minutes: 10
        },
        {
            path_id: pathId,
            title: 'Defining Your Niche',
            content: 'Specialization is key. Learn how to identify a profitable niche that aligns with your skills.',
            module_type: 'article',
            order: 2,
            duration_minutes: 15
        },
        {
            path_id: pathId,
            title: 'Setting Up Your LLC',
            content: 'A step-by-step guide to legal formation and protecting your personal assets.',
            module_type: 'video',
            order: 3,
            duration_minutes: 20
        }
    ]);

    return NextResponse.json({ success: true, message: 'Seeded Academy Data' });
  } catch (err) {
    console.error('Seeding error:', err);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
