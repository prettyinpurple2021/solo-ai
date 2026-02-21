'use client'

import { logError } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { createPost } from "@/lib/actions/community-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Topic {
    id: string
    name: string
}

export function CreatePostDialog({ topics, triggerClassName }: { topics: Topic[], triggerClassName?: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [topicId, setTopicId] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topicId) {
            toast.error("Please select a topic")
            return
        }

        setLoading(true)
        try {
            const res = await createPost({
                title,
                content,
                topicId,
                tags: []
            })
            if (res.success) {
                toast.success("Post created!")
                setOpen(false)
                setTitle("")
                setContent("")
                setTopicId("")
                router.refresh()
            } else {
                // Keep open, show error
                toast.error("Failed to create post. Please try again.")
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
            logError('Failed to create post', { error })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={triggerClassName || "w-full"}>
                    <PlusCircle className="w-4 h-4 mr-2" /> New Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                            Share your thoughts with the tribe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input 
                                id="title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="What's on your mind?" 
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Select value={topicId} onValueChange={setTopicId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea 
                                id="content" 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="Type your message here..." 
                                className="h-32"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
