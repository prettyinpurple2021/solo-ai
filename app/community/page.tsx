import { getCommunityFeed, getTopics } from "@/lib/actions/community-actions"
import { Feed } from "@/components/community/feed"
import { CreatePostDialog } from "@/components/community/create-post-dialog"

export default async function CommunityPage({
    searchParams
}: {
    searchParams: Promise<{ topicId?: string }>
}) {
    const { topicId } = await searchParams;
    const posts = await getCommunityFeed(topicId);
    
    // We need topics for the mobile "New Post" dialog if we want to reuse it
    // Or simpler: Just a Link to /community/new if we had a dedicated page.
    // Given the architecture, let's fetch topics so we can render the Dialog.
    const topics = await getTopics();
    const uiTopics = topics.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        icon: t.icon || 'Hash'
    }));

    return (
        <div>
             <div className="md:hidden p-4 flex justify-end">
                <CreatePostDialog topics={uiTopics} triggerClassName="w-auto" />
            </div>
            <Feed posts={posts} />
        </div>
    )
}
