import { db } from "@/db"
import { communityPosts, communityComments } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { PostCard } from "@/components/community/post-card"
import { CommentSection } from "@/components/community/comment-section"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getPost(id: string) {
    return await db.query.communityPosts.findFirst({
        where: eq(communityPosts.id, id),
        with: {
            author: true,
            topic: true,
            comments: {
                orderBy: [desc(communityComments.created_at)],
                with: {
                    author: true
                }
            }
        }
    })
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) return notFound();

    // Transform for components
    const postProps = {
        ...post,
        created_at: post.created_at || new Date(), // Fallback
        author: {
             id: post.author.id,
             name: post.author.name,
             image: post.author.image
        },
        _count: {
            likes: post.like_count || 0,
            comments: post.comments.length
        }
    };

    const comments = post.comments.map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at || new Date(),
        author: {
            id: c.author.id,
            name: c.author.name,
            image: c.author.image
        }
    }));

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
             <div className="mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/community">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Feed
                    </Link>
                </Button>
            </div>

            <PostCard post={postProps} />
            
            <CommentSection postId={post.id} comments={comments} />
        </div>
    )
}
