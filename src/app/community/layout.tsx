import { CommunityLayout } from "@/components/community/community-layout"
import { getTopics } from "@/lib/actions/community-actions"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const topics = await getTopics()
    
    // Map DB topic to UI topic interface
    const uiTopics = topics.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        icon: t.icon || 'Hash'
    }))

    return (
        <CommunityLayout topics={uiTopics}>
            {children}
        </CommunityLayout>
    )
}
