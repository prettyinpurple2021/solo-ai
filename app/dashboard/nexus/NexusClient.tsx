
"use client"

import { useState, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import { Textarea} from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Users, Heart, MessageCircle, Share2, Trophy, Flame, Star, Sparkles, Plus, Send, Award, Target, Zap, Coffee, Rocket, Activity, Radio, Layers, MoreVertical, Trash2, Edit, UserPlus, ThumbsDown, XCircle
} from "lucide-react"
import { CommunityPost, CommunityChallenge, LeaderboardEntry } from "@/lib/services/community-service"
import { createPost, reactToPost, joinChallenge, deletePost } from "@/lib/actions/community-actions"
import { toast } from "sonner"

interface NexusClientProps {
  initialPosts: CommunityPost[];
  initialChallenges: CommunityChallenge[];
  initialLeaderboard: LeaderboardEntry[];
  user: any;
}

export function NexusClient({ initialPosts, initialChallenges, initialLeaderboard, user }: NexusClientProps) {
  const [activeTab, setActiveTab] = useState("feed")
  const [newPostContent, setNewPostContent] = useState("")
  const [showNewPost, setShowNewPost] = useState(false)
  
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts)
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(initialChallenges)
  const [topOperatives, setTopOperatives] = useState<LeaderboardEntry[]>(initialLeaderboard)
  
  const [isPending, setIsPending] = useState(false)

  const reactionIcons: Record<string, any> = {
    like: Heart,
    dislike: ThumbsDown,
    love: Heart, 
    fire: Flame,
    party: Sparkles
  }

  const handleNewPost = async () => {
    if (!newPostContent.trim()) return
    setIsPending(true)
    try {
      await createPost({ content: newPostContent })
      setNewPostContent("")
      setShowNewPost(false)
      toast.success("Transmission uploaded to the collective.")
    } catch (error) {
      toast.error("Failed to broadcast signal.")
    } finally {
      setIsPending(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId)
      toast.success("Protocol initiated. Good luck, operative.")
    } catch (error) {
      toast.error("Failed to join protocol.")
    }
  }

  const handleReaction = async (postId: string, type: string = 'like') => {
    try {
      await reactToPost(postId, type)
    } catch (error) {
      toast.error("Reaction failed.")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Permanently delete this transmission?")) return
    try {
      await deletePost(postId)
      setPosts(posts.filter(p => p.id !== postId))
      toast.success("Signal terminated.")
    } catch (error) {
      toast.error("Failed to delete signal.")
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900/20 text-green-400 border-green-800"
      case "medium":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-800"
      case "hard":
        return "bg-orange-900/20 text-orange-400 border-orange-800"
      case "legendary":
        return "bg-purple-900/20 text-purple-400 border-purple-800"
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-800"
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      {/* Header */}
      <Card className="nexus-card bg-black/40 border-purple-500/30 text-white backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              <Activity className="h-8 w-8 text-cyan-400" />
              THE NEXUS
              <Layers className="h-8 w-8 text-purple-600" />
            </h1>
            <p className="text-lg text-cyan-100/80 font-mono">
              Link up with fellow operatives. Hack the growth matrix. Elevate your status.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10">
          <TabsTrigger value="feed" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-mono">NEURAL FEED</TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-mono">PROTOCOLS</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-mono">RANKINGS</TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-mono">FACTIONS</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* New Post */}
          <Card className="nexus-card bg-black/20 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-purple-500/50">
                  <AvatarImage src={user?.image || "/default-user.svg"} />
                  <AvatarFallback className="bg-black text-purple-400 font-bold border border-purple-500">
                    OP
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-muted-foreground bg-black/20 border-white/10 hover:bg-white/5 hover:text-cyan-400 transition-colors"
                  onClick={() => setShowNewPost(true)}
                >
                  Broadcast to the network... 📡
                </Button>
                <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
                  <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-purple-500/50 text-white">
                    <DialogHeader>
                      <DialogTitle className="nexus-heading text-cyan-400 text-xl font-bold flex items-center gap-2">
                        <Radio className="h-5 w-5" />
                        INITIATE BROADCAST
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Share intel, victories, or status updates with the collective.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Textarea
                        placeholder="Input signal data here..."
                        value={newPostContent}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPostContent(e.target.value)}
                        className="min-h-[120px] bg-black/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-600 font-mono"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-cyan-400/80">
                          <Activity className="h-4 w-4" />
                          <span>Signal Strength: 100%</span>
                        </div>
                        <Button 
                          onClick={handleNewPost} 
                          disabled={isPending}
                          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {isPending ? "UPLOADING..." : "UPLOAD"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground font-mono">
                    <p>No signals detected. Be the first to broadcast.</p>
                </div>
            ) : (
                posts.map((post) => (
                <Card key={post.id} className="nexus-card bg-zinc-950/40 border-white/5 hover:border-purple-500/30 transition-all duration-300">
                    <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-12 w-12 ring-2 ring-cyan-900/50">
                        <AvatarImage src={post.author.avatar || "/default-user.svg"} />
                        <AvatarFallback className="bg-zinc-900 text-cyan-400 font-bold">
                            {post.author.name.charAt(0)}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer">{post.author.name}</h4>
                            {post.author.verified && (
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-[10px] px-1.5 py-0 rounded-none transform skew-x-[-10deg]">
                                VERIFIED
                            </Badge>
                            )}
                            <Badge className="bg-purple-500/10 text-xs border-purple-500/50 text-purple-400">
                            Lvl {post.author.level}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                            <span className="text-purple-400/80">{post.author.title}</span>
                            <span className="text-gray-700">•</span>
                            <span>{post.timestamp}</span>
                        </p>
                        </div>
                        {user?.id === post.author.id && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-950 border-purple-500/30 text-gray-300">
                                    <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-400 hover:bg-red-900/20 cursor-pointer hover:text-red-300">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Signal
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                        <p className="text-sm leading-relaxed text-gray-300">{post.content}</p>

                        {post.image && (
                        <div className="rounded-lg overflow-hidden border border-white/10 relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img
                                src={post.image || "/default-post.svg"}
                                alt="Post content"
                                className="w-full object-cover max-h-80"
                            />
                        </div>
                        )}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs font-mono text-cyan-600/80 hover:text-cyan-400 transition-colors cursor-pointer">
                                #{tag}
                            </span>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-1 hover:bg-pink-500/10 ${post.isLiked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"}`}
                                >
                                    {post.userReaction && reactionIcons[post.userReaction] ? (
                                        (() => {
                                            const Icon = reactionIcons[post.userReaction];
                                            return <Icon className="h-4 w-4 fill-current" />;
                                        })()
                                    ) : (
                                        <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                                    )}
                                    <span className="font-mono text-xs">{post.likes}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1 bg-zinc-950 border-purple-500/30 flex gap-1">
                                {Object.entries(reactionIcons).map(([type, Icon]) => (
                                    <Button
                                        key={type}
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 hover:bg-white/10 ${post.userReaction === type ? 'text-pink-500 bg-white/5' : 'text-gray-400'}`}
                                        onClick={() => handleReaction(post.id, type)}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-mono text-xs">{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400">
                            <Share2 className="h-4 w-4" />
                            <span className="font-mono text-xs">{post.shares}</span>
                        </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-mono">
                        <Plus className="h-3 w-3 mr-1" />
                        LINK
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {challenges.length === 0 ? (
                 <div className="col-span-2 text-center py-10 text-muted-foreground font-mono">No active protocols available.</div>
            ) : (
                challenges.map((challenge) => (
                    <Card key={challenge.id} className="nexus-card bg-zinc-950 border-purple-900/40 hover:border-purple-500/60 transition-colors">
                        <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                            <CardTitle className="nexus-heading flex items-center gap-2 text-white">
                                <span className="text-2xl">{challenge.emoji}</span>
                                {challenge.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty.toUpperCase()}
                                </Badge>
                                <Badge className="text-[10px] border-cyan-800 text-cyan-400 bg-cyan-900/20">
                                {challenge.category}
                                </Badge>
                            </div>
                            </div>
                            <div className="text-right">
                            <div className="text-sm font-bold text-purple-400 font-mono">{challenge.participants}</div>
                            <div className="text-[10px] text-gray-500 uppercase">agents</div>
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <CardDescription className="text-gray-400">{challenge.description}</CardDescription>

                        <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                            <div className="flex items-center gap-1 text-gray-400">
                            <Target className="h-4 w-4 text-pink-500" />
                            <span className="font-medium font-mono text-xs">deadline: {challenge.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                            <Award className="h-4 w-4" />
                            <span className="font-bold font-mono">{challenge.reward.points} PTS</span>
                            </div>
                        </div>

                        {challenge.userStatus === 'joined' ? (
                            <Button className="w-full bg-green-900/50 text-green-100 border border-green-700/50 cursor-default hover:bg-green-900/50">
                                <Trophy className="mr-2 h-4 w-4" />
                                PROTOCOL ACTIVE
                            </Button>
                        ) : challenge.userStatus === 'completed' ? (
                            <Button className="w-full bg-yellow-900/50 text-yellow-100 border border-yellow-700/50 cursor-default hover:bg-yellow-900/50">
                                <Award className="mr-2 h-4 w-4" />
                                PROTOCOL COMPLETED
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => handleJoinChallenge(challenge.id)}
                                className="w-full bg-purple-900/50 hover:bg-purple-800 text-purple-100 border border-purple-700/50"
                            >
                                <Rocket className="mr-2 h-4 w-4" />
                                INITIATE PROTOCOL
                            </Button>
                        )}
                        </CardContent>
                    </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="nexus-card bg-black/40 border-yellow-900/30">
            <CardHeader>
              <CardTitle className="nexus-heading flex items-center gap-2 text-yellow-500 font-orbitron">
                <Trophy className="h-6 w-6" />
                ELITE OPERATIVES
              </CardTitle>
              <CardDescription className="font-mono text-yellow-500/60">
                Top performing agents in the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOperatives.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 font-mono">No data available.</div>
                ) : (
                    topOperatives.map((op, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-950/20 to-black rounded border border-yellow-900/20 hover:border-yellow-500/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 rounded flex items-center justify-center font-bold text-black font-mono ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-700"
                            }`}
                        >
                            {index + 1}
                        </div>
                        <Avatar className="h-12 w-12 ring-1 ring-yellow-500/30">
                            <AvatarImage src={op.avatar || "/default-user.svg"} />
                            <AvatarFallback className="bg-zinc-900 text-yellow-500 font-bold">
                            {op.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        </div>

                        <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-200">{op.name}</h4>
                            <Badge className="bg-yellow-900/20 text-yellow-600 border-yellow-900 text-[10px]">Level {op.level}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">{op.title}</p>
                        </div>

                        <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold text-sm text-yellow-100 font-mono">{op.points.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-[10px] text-orange-400/80 font-mono capitalize">{op.streak} day streak</span>
                        </div>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="nexus-card bg-orange-950/20 border-orange-900/30">
              <CardHeader>
                <CardTitle className="nexus-heading flex items-center gap-2 text-orange-400 font-orbitron">
                  <Coffee className="h-5 w-5" />
                  Morning Protocol
                </CardTitle>
                <CardDescription className="text-orange-200/60">Early risers executing initialization sequences before 0900.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-orange-300">1,234 units</span>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">ACTIVE</Badge>
                </div>
                <p className="text-sm text-gray-400">
                  Share initialization routines, caffeine metrics, and sunrise data.
                </p>
                <Button className="w-full bg-orange-900/40 hover:bg-orange-800 text-orange-100 border border-orange-700/40 uppercase font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  JOIN FACTION
                </Button>
              </CardContent>
            </Card>

            <Card className="nexus-card bg-purple-950/20 border-purple-900/30">
              <CardHeader>
                <CardTitle className="nexus-heading flex items-center gap-2 text-purple-400 font-orbitron">
                  <Zap className="h-5 w-5" />
                  Automation Architects
                </CardTitle>
                <CardDescription className="text-purple-200/60">Masters of AI-powered business scaling and agent deployment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-purple-300">892 units</span>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">HOT</Badge>
                </div>
                <p className="text-sm text-gray-400">
                  Exchange scaling strategies, agent configurations, and automation scripts.
                </p>
                <Button className="w-full bg-purple-900/40 hover:bg-purple-800 text-purple-100 border border-purple-700/40 uppercase font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  JOIN FACTION
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
