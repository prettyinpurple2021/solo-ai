'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquare, Heart, Share2, MoreHorizontal, Flag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { toggleLike } from "@/lib/actions/community-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export interface PostProps {
    id: string
    title: string
    content: string
    created_at: Date
    author: {
        id: string
        name: string | null
        image: string | null
    }
    topic?: {
        name: string
    }
    _count?: {
        likes: number
        comments: number
    }
    like_count?: number
    comment_count?: number
    isLiked?: boolean
}

export function PostCard({ post }: { post: PostProps }) {
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);

    const handleLike = async () => {
        // Optimistic UI
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const res = await toggleLike('post', post.id);
            if (!res.success) throw new Error("Failed");
        } catch (e) {
            // Revert
            setLiked(!newLiked);
            setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
            toast.error("Failed to like post");
        }
    }

    return (
        <Card className="hover:border-indigo-200 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4 pb-2">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.image || undefined} />
                    <AvatarFallback>{post.author.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <span className="font-semibold text-sm">{post.author.name}</span>
                             <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                         </div>

                         <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                     <MoreHorizontal className="w-4 h-4" />
                                 </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={() => toast.success("Post reported to admins.")}>
                                     <Flag className="w-4 h-4 mr-2" /> Report
                                 </DropdownMenuItem>
                             </DropdownMenuContent>
                         </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {post.topic && (
                    <Badge variant="secondary" className="mb-2 text-xs">{post.topic.name}</Badge>
                )}
                <Link href={`/community/post/${post.id}`} className="hover:underline">
                    <h3 className="font-bold mb-2 text-lg">{post.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{post.content}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center gap-4 text-muted-foreground">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`gap-2 ${liked ? 'text-red-500 hover:text-red-600' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    {likeCount}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {post.comment_count || 0}
                </Button>
                 <Button variant="ghost" size="sm" className="gap-2 ml-auto">
                    <Share2 className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
