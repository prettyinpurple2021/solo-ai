'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Hash, Trophy, Megaphone, TrendingUp, Wrench, MessageSquare, PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreatePostDialog } from "@/components/community/create-post-dialog"

interface Topic {
    id: string
    name: string
    slug: string
    icon: string
}

interface CommunityLayoutProps {
    children: React.ReactNode
    topics: Topic[]
}

const iconMap: Record<string, any> = {
    Hash, Trophy, Megaphone, TrendingUp, Wrench, MessageSquare
}

export function CommunityLayout({ children, topics }: CommunityLayoutProps) {
    // searchParams could be used for other things, keeping for now if needed, but removing unused vars
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r hidden md:flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg tracking-tight">The Tribe</h2>
                    <p className="text-xs text-muted-foreground">Founder Community</p>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    <Button variant="ghost" className={cn("w-full justify-start", pathname === '/community' && "bg-accent")} asChild>
                        <Link href="/community">
                           <Hash className="w-4 h-4 mr-2" /> All Posts
                        </Link>
                    </Button>

                    <div className="py-2">
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground mb-2">TOPICS</h3>
                        {topics.map(topic => {
                            const Icon = iconMap[topic.icon] || Hash
                            // Fix: Use topic.id or slug depending on route structure. 
                            // Since we link to /community/topic/[id], we check validity there.
                            // Assuming backend returns topic.id that matches URL param.
                            const isActive = pathname.includes(`/topic/${topic.id}`) 
                            
                            return (
                                <Button 
                                    key={topic.id} 
                                    variant="ghost" 
                                    className={cn("w-full justify-start", isActive && "bg-accent")}
                                    asChild
                                >
                                    <Link href={`/community?topicId=${topic.id}`}>
                                        <Icon className="w-4 h-4 mr-2" /> {topic.name}
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>

                <div className="p-4 border-t">
                    <CreatePostDialog topics={topics} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
