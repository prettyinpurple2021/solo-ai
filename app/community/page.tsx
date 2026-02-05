import { getCommunityFeed } from "@/lib/actions/community-actions"
import { Feed } from "@/components/community/feed"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function CommunityPage({
    searchParams
}: {
    searchParams: Promise<{ topicId?: string }>
}) {
    const { topicId } = await searchParams;
    
    // Cast strict type to PostProps compatible type for now
    // In real app, we'd ensure types match perfectly via shared interface
    const rawPosts = await getCommunityFeed(topicId);
    
    const posts = rawPosts.map(p => ({
        ...p,
        author: {
            id: p.author.id,
            name: p.author.name,
            image: p.author.image,
        },
        // created_at is strictly Date in DB, but might need serialization if passed to client
        // server components serialize QueryResult dates automatically
    }));

    return (
        <div>
             <div className="md:hidden p-4 flex justify-end">
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> New Post
                </Button>
            </div>
            <Feed posts={posts as any} />
        </div>
    )
}
