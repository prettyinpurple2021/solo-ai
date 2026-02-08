
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Use centralized DB client
import { usageTracking } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userIdSearch = req.nextUrl.searchParams.get("userId");
    const headerUserId = req.headers.get("x-user-id");
    const userId = userIdSearch || headerUserId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing User ID" }, { status: 401 });
    }

    const usage = await db.select().from(usageTracking)
      .where(eq(usageTracking.userId, userId))
      .limit(1);

    if (!usage.length) {
        // Return default/empty usage if none exists yet
        return NextResponse.json({
            aiGenerations: 0,
            competitorsTracked: 0,
            businessProfiles: 1
        });
    }

    return NextResponse.json(usage[0]);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage stats" }, { status: 500 });
  }
}
