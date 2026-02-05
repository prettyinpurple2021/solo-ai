'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { addComment } from "@/lib/actions/community-actions"
import { toast } from "sonner"
import { Loader2, Reply, Send, X } from "lucide-react"
import { CommentProps } from "@/types/community"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
    postId: string
    comments: CommentProps[]
}

function CommentItem({ comment, postId }: { comment: CommentProps, postId: string }) {
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return

        setLoading(true)
        try {
            const res = await addComment({
                postId,
                content: replyContent,
                parentId: comment.id
            })
            
            if (res.success) {
                toast.success("Reply added")
                setIsReplying(false)
                setReplyContent("")
                router.refresh()
            } else {
                toast.error(res.error || "Failed to add reply")
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-4">
            <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{comment.author.name} {comment.author.level ? `(Lvl ${comment.author.level})` : ''}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{comment.content}</p>
                    <div className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <Reply className="w-3 h-3 mr-1" /> Reply
                        </Button>
                    </div>
                </div>

                {isReplying && (
                    <div className="flex gap-3 ml-2 border-l-2 pl-4 py-2">
                        <Textarea 
                            placeholder={`Reply to ${comment.author.name}...`} 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                        />
                        <div className="flex flex-col gap-2">
                            <Button size="icon" className="h-8 w-8" onClick={handleReplySubmit} disabled={loading || !replyContent.trim()}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsReplying(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
    const [replyContent, setReplyContent] = useState("")
    const [loading, setLoading] = useState(false)
    const [localComments, setLocalComments] = useState(comments)
    const router = useRouter()

    // Sync state with props
    useEffect(() => {
        setLocalComments(comments)
    }, [comments])

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
                router.refresh()
            } else {
                toast.error(res.error || "Failed to post comment")
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
                    <CommentItem key={comment.id} comment={comment} postId={postId} />
                ))}
            </div>
        </div>
    )
}
