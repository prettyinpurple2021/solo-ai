import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db";
import { communityTopics } from "@/db/schema/community";
import { v4 as uuidv4 } from "uuid";
import { getJWTAuthenticatedUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    // 1. Auth Check (Basic for demonstration, ideally require Admin role)
    // For now, ensuring user is just authenticated is a step up, but seeding really invites abuse if not strict.
    // User requested "verify current user/session and require an admin or trusted role".
    // Since we don't have roles implemented fully, we'll check for a specific header or just auth.
    // Let's assume generic "authenticateAction" or header check for simplicity in this MVP.
    
    // Authenticate user
    const user = await getJWTAuthenticatedUser();

    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const topics = [
            { name: "General", slug: "general", icon: "Hash", description: "General discussion for everyone." },
            { name: "Announcements", slug: "announcements", icon: "Megaphone", description: "Official updates and news." },
            { name: "Wins", slug: "wins", icon: "Trophy", description: "Share your successes, big or small!" },
            { name: "Marketing", slug: "marketing", icon: "TrendingUp", description: "Growth tips, strategies, and questions." },
            { name: "Tech Support", slug: "support", icon: "Wrench", description: "Help with tools, bugs, and code." },
            { name: "Feedback", slug: "feedback", icon: "MessageSquare", description: "Suggestions for SoloSuccess AI." }
        ];

        let seededCount = 0;
        
        // Use index for order
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const existing = await db.query.communityTopics.findFirst({
                where: eq(communityTopics.slug, topic.slug)
            });

            if (!existing) {
                await db.insert(communityTopics).values({
                    ...topic,
                    order: i // Use index as order
                });
                seededCount++;
            }
        }

        return NextResponse.json({ success: true, message: `Seeded ${seededCount} topics` });
    } catch (e) {
        console.error("Seeding Error", e);
        return NextResponse.json({ error: "Failed to seed topics" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
