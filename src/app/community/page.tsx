import { getCommunityFeed, getTopics } from "@/lib/actions/community-actions"
import { Feed } from "@/components/community/feed"
import { CreatePostDialog } from "@/components/community/create-post-dialog"

export const dynamic = "force-dynamic"
export const revalidate = 0

type CommunityPageSearchParams = {
    topicId?: string | string[]
}

type CommunityPageProps = {
    searchParams?: CommunityPageSearchParams | Promise<CommunityPageSearchParams>
}

export default async function CommunityPage({
    searchParams
}: CommunityPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
    const topicId = Array.isArray(resolvedSearchParams.topicId)
        ? resolvedSearchParams.topicId[0]
        : resolvedSearchParams.topicId

    const [posts, topics] = await Promise.all([
        getCommunityFeed(topicId),
        getTopics()
    ])

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
