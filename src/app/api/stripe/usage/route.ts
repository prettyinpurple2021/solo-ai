import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db"; // Use centralized DB client
import { usageTracking } from "@/server/db/schema";
import { eq } from "@/server/db";
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    logError('Error fetching usage', { error });
    return NextResponse.json({ error: "Failed to fetch usage stats" }, { status: 500 });
  }
}
