"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  Crown,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Flame,
  Star,
  Sparkles,
  Plus,
  Send,
  Award,
  Target,
  Zap,
  Coffee,
  Rocket,
} from "lucide-react"

interface BossPost {
  id: string
  author: {
    name: string
    avatar: string
    level: number
    title: string
    verified: boolean
  }
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  achievement?: {
    title: string
    emoji: string
    rarity: string
  }
  isLiked: boolean
  tags: string[]
}

interface BossChallenge {
  id: string
  title: string
  description: string
  emoji: string
  participants: number
  deadline: string
  reward: {
    points: number
    badge: string
  }
  difficulty: "easy" | "medium" | "hard" | "legendary"
  category: string
}

export function BossCommunity() {
  const [activeTab, setActiveTab] = useState("feed")
  const [newPostContent, setNewPostContent] = useState("")
  const [showNewPost, setShowNewPost] = useState(false)

  // Community data - this will be connected to real backend
  const [posts, setPosts] = useState<BossPost[]>([
    {
      id: "1",
      author: {
        name: "Sarah Boss",
        avatar: "/default-user.svg",
        level: 15,
        title: "Empire Builder",
        verified: true,
      },
      content:
        "Just hit my biggest revenue month ever! 🚀 The key was focusing on systems over hustle. My AI squad helped me automate 80% of my workflow. Who else is building sustainable success? 💪",
      timestamp: "2 hours ago",
      likes: 47,
      comments: 12,
      shares: 8,
      achievement: {
        title: "Revenue Queen",
        emoji: "💰",
        rarity: "legendary",
      },
      isLiked: false,
      tags: ["revenue", "automation", "systems"],
    },
    {
      id: "2",
      author: {
        name: "Maya Fierce",
        avatar: "/default-user.svg",
        level: 12,
        title: "Digital Nomad Boss",
        verified: true,
      },
      content:
        "Reminder: Your worth isn't measured by your hustle hours. I used to work 80-hour weeks and burn out every 3 months. Now I work 30 focused hours and make 3x more. Work smarter, not harder! ✨",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 23,
      shares: 15,
      isLiked: true,
      tags: ["wellness", "productivity", "mindset"],
    },
    {
      id: "3",
      author: {
        name: "Alex Power",
        avatar: "/default-user.svg",
        level: 18,
        title: "Tech Empress",
        verified: true,
      },
      content:
        "Built my first AI agent today using SoloBoss! 🤖 It's handling customer support while I focus on product development. The future is here and it's FEMALE! Who's ready to scale with AI?",
      image: "/default-post.svg",
      timestamp: "6 hours ago",
      likes: 156,
      comments: 34,
      shares: 28,
      achievement: {
        title: "AI Pioneer",
        emoji: "🤖",
        rarity: "epic",
      },
      isLiked: false,
      tags: ["AI", "automation", "tech", "scaling"],
    },
  ])

  const challenges: BossChallenge[] = [
    {
      id: "1",
      title: "30-Day Revenue Sprint",
      description: "Increase your monthly revenue by 25% using AI automation and smart systems",
      emoji: "🚀",
      participants: 234,
      deadline: "30 days",
      reward: {
        points: 500,
        badge: "Revenue Rocket",
      },
      difficulty: "hard",
      category: "Business Growth",
    },
    {
      id: "2",
      title: "Wellness Warrior Week",
      description: "Maintain perfect work-life balance for 7 consecutive days",
      emoji: "🧘‍♀️",
      participants: 189,
      deadline: "7 days",
      reward: {
        points: 200,
        badge: "Balance Boss",
      },
      difficulty: "medium",
      category: "Wellness",
    },
    {
      id: "3",
      title: "AI Squad Assembly",
      description: "Create and train 3 AI agents to handle different aspects of your business",
      emoji: "🤖",
      participants: 156,
      deadline: "14 days",
      reward: {
        points: 750,
        badge: "AI Commander",
      },
      difficulty: "legendary",
      category: "Technology",
    },
  ]

  const topBosses = [
    {
      name: "Victoria Crown",
      avatar: "/default-user.svg",
      level: 25,
      points: 15420,
      title: "Legendary Boss",
      streak: 89,
    },
    {
      name: "Diana Empire",
      avatar: "/default-user.svg",
      level: 23,
      points: 14230,
      title: "Empire Architect",
      streak: 67,
    },
    {
      name: "Luna Success",
      avatar: "/default-user.svg",
      level: 21,
      points: 13890,
      title: "Success Strategist",
      streak: 45,
    },
  ]

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      ),
    )
  }

  const handleNewPost = () => {
    if (!newPostContent.trim()) return

    const newPost: BossPost = {
      id: Date.now().toString(),
      author: {
        name: "You",
        avatar: "/default-user.svg",
        level: 12,
        title: "Rising Boss",
        verified: false,
      },
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      tags: [],
    }

    setPosts([newPost, ...posts])
    setNewPostContent("")
    setShowNewPost(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "legendary":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="boss-card soloboss-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
              <Users className="h-8 w-8" />
              Boss Community
              <Crown className="h-8 w-8" />
            </h1>
            <p className="text-lg opacity-90">
              Connect with fellow empire builders, share victories, and level up together! 👑✨
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>2,847 Boss Babes</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>156 Active Challenges</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span>89% Success Rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Boss Feed</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="groups">Boss Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* New Post */}
          <Card className="boss-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/default-user.svg" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    B
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-muted-foreground bg-transparent"
                  onClick={() => setShowNewPost(true)}
                >
                  Share your boss moment... ✨
                </Button>
                <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
                  <DialogContent className="sm:max-w-[500px] boss-card">
                    <DialogHeader>
                      <DialogTitle className="boss-heading">Share Your Boss Energy! 💪</DialogTitle>
                      <DialogDescription>Inspire the community with your latest victory or insight</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="What's your boss move today? Share your wins, insights, or ask for support! 🚀"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          <span>Add some boss energy!</span>
                        </div>
                        <Button onClick={handleNewPost} className="punk-button text-white">
                          <Send className="mr-2 h-4 w-4" />
                          Share Victory
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
            {posts.map((post) => (
              <Card key={post.id} className="boss-card">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar || "/default-user.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                        {post.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold empowering-text">{post.author.name}</h4>
                        {post.author.verified && (
                          <Badge className="girlboss-badge text-xs px-2 py-0">
                            <Crown className="h-3 w-3 mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Level {post.author.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {post.author.title} • {post.timestamp}
                      </p>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  {post.achievement && (
                    <div className="mb-4">
                      <Badge className={`girlboss-badge text-sm px-3 py-1 ${post.achievement.rarity}`}>
                        <Trophy className="h-3 w-3 mr-1" />
                        {post.achievement.emoji} {post.achievement.title}
                      </Badge>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed font-medium">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image || "/default-post.svg"}
                        alt="Post content"
                        className="w-full rounded-lg object-cover max-h-64"
                      />
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 ${post.isLiked ? "text-pink-600" : ""}`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                        <span className="font-medium">{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">{post.comments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span className="font-medium">{post.shares}</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="boss-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="boss-heading flex items-center gap-2">
                        <span className="text-2xl">{challenge.emoji}</span>
                        {challenge.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs px-2 py-1 ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold empowering-text">{challenge.participants}</div>
                      <div className="text-xs text-muted-foreground">participants</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="font-medium">{challenge.description}</CardDescription>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Deadline: {challenge.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">{challenge.reward.points} points</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-sm">Reward</span>
                    </div>
                    <p className="text-sm font-medium">
                      {challenge.reward.points} Boss Points + "{challenge.reward.badge}" Badge
                    </p>
                  </div>

                  <Button className="w-full punk-button text-white">
                    <Rocket className="mr-2 h-4 w-4" />
                    Join Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="boss-heading flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Top Boss Babes This Month
              </CardTitle>
              <CardDescription className="font-medium">
                The most inspiring empire builders in our community 👑
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBosses.map((boss, index) => (
                  <div
                    key={boss.name}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={boss.avatar || "/default-user.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                          {boss.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold empowering-text">{boss.name}</h4>
                        <Badge className="girlboss-badge text-xs px-2 py-0">Level {boss.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{boss.title}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-sm">{boss.points.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-muted-foreground">{boss.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="boss-heading flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-orange-600" />
                  Morning Boss Babes
                </CardTitle>
                <CardDescription>Early risers crushing goals before 9 AM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">1,234 members</span>
                  <Badge className="girlboss-badge">ACTIVE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your morning routines, accountability check-ins, and sunrise victories! ☀️
                </p>
                <Button className="w-full punk-button text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Join Group
                </Button>
              </CardContent>
            </Card>

            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="boss-heading flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  AI Automation Queens
                </CardTitle>
                <CardDescription>Masters of AI-powered business scaling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">892 members</span>
                  <Badge className="girlboss-badge">HOT</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share AI strategies, automation wins, and tech tips for scaling your empire! 🤖
                </p>
                <Button className="w-full punk-button text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Join Group
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
