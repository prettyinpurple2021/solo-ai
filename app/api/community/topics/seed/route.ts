import { NextResponse } from 'next/server';
import { db } from "@/db";
import { communityTopics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const topics = [
            { name: "General", slug: "general", icon: "Hash", description: "General discussion for everyone." },
            { name: "Announcements", slug: "announcements", icon: "Megaphone", description: "Official updates and news." },
            { name: "Wins", slug: "wins", icon: "Trophy", description: "Share your successes, big or small!" },
            { name: "Marketing", slug: "marketing", icon: "TrendingUp", description: "Growth tips, strategies, and questions." },
            { name: "Tech Support", slug: "support", icon: "Wrench", description: "Help with tools, bugs, and code." },
            { name: "Feedback", slug: "feedback", icon: "MessageSquare", description: "Suggestions for SoloSuccess AI." }
        ];

        let count = 0;
        for (const topic of topics) {
            const existing = await db.query.communityTopics.findFirst({
                where: eq(communityTopics.slug, topic.slug)
            });

            if (!existing) {
                await db.insert(communityTopics).values({
                    ...topic,
                    order: count
                });
                count++;
            }
        }

        return NextResponse.json({ success: true, message: `Seeded ${count} topics` });
    } catch (e) {
        console.error("Seeding Error", e);
        return NextResponse.json({ error: "Failed to seed topics" }, { status: 500 });
    }
}
