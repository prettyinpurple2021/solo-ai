'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { addComment } from "@/lib/actions/community-actions"
import { toast } from "sonner"
import { Loader2, Reply } from "lucide-react"

interface Comment {
    id: string
    content: string
    created_at: Date
    author: {
        id: string
        name: string | null
        image: string | null
    }
}

interface CommentSectionProps {
    postId: string
    comments: Comment[]
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
    const [replyContent, setReplyContent] = useState("")
    const [loading, setLoading] = useState(false)
    const [localComments, setLocalComments] = useState(comments)

    const handleSubmit = async () => {
        if (!replyContent.trim()) return

        setLoading(true)
        try {
            const res = await addComment({
                postId,
                content: replyContent
            })
            if (res.success) {
                toast.success("Comment added")
                setReplyContent("")
                // In real app, we'd fetch the new comment or optimistically add it
                // For MVP, router.refresh() handles it in parent, or we just rely on toast
                // But local state update is better:
                // setLocalComments(...) - requires user info which we don't have in client easily without Context
                // Rely on parent revalidation for simplicity in MVP
            }
        } catch (e) {
            toast.error("Failed to post comment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 mt-8 p-4 border-t">
            <h3 className="font-semibold text-lg">Comments ({localComments.length})</h3>
            
            {/* Input */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <Textarea 
                        placeholder="Write a comment..." 
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                        <Button size="sm" onClick={handleSubmit} disabled={loading || !replyContent.trim()}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {localComments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.author.image || undefined} />
                            <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 bg-muted/30 p-3 rounded-lg flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{comment.author.name}</span>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                            </div>
                            <p className="text-sm whitespace-pre-line">{comment.content}</p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-0 text-xs text-muted-foreground">
                                    <Reply className="w-3 h-3 mr-1" /> Reply
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
