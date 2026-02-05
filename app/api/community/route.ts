import { NextResponse } from 'next/server';
import { getCommunityFeed, createPost } from "@/lib/actions/community-actions";
import { authenticateRequest } from "@/lib/auth-server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId') || undefined;

    try {
        const posts = await getCommunityFeed(topicId);
        return NextResponse.json(posts);
    } catch (e) {
        console.error("API Error", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { user, error } = await authenticateRequest();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const result = await createPost(body); // This uses Zod internally
        return NextResponse.json(result);
    } catch (e: any) {
        console.error("API Error", e);
        if (e.name === "ZodError") {
             // Sanitize Zod error
             const errors = e.issues?.map((i: any) => ({ path: i.path, message: i.message }));
             return NextResponse.json({ error: "Validation Error", details: errors }, { status: 400 });
        }
        if (e.message === "Invalid Topic") {
            return NextResponse.json({ error: "Invalid Topic" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
