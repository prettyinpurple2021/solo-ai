'use client'

import { PostProps, PostCard } from "./post-card"

interface FeedProps {
    posts: PostProps[]
}

export function Feed({ posts }: FeedProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-semibold">No posts yet</h3>
                <p className="text-muted-foreground">Be the first to share something!</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
