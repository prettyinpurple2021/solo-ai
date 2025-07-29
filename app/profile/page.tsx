"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedProfileModal } from "@/components/profile/enhanced-profile-modal"
import { useAuth } from "@/hooks/use-auth"
import {
  User,
  Settings,
  Trophy,
  Target,
  Calendar,
  MapPin,
  Globe,
  Phone,
  Mail,
  Crown,
  Sparkles,
  TrendingUp,
  Zap,
  Edit3,
} from "lucide-react"

// Force dynamic rendering to avoid build-time auth errors
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  // Only access useAuth after component mounts
  const auth = mounted ? useAuth() : null
  const user = auth?.user || null
  // Mock profile for now since it's not in the auth context
  const profile = user ? {
    full_name: user.user_metadata?.full_name || "Boss Babe",
    email: user.email,
    company_name: "Building My Empire",
    industry: null,
    business_type: null,
    phone: null,
    website: null,
    bio: null,
    avatar_url: user.user_metadata?.avatar_url,
    timezone: null
  } : null

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted
  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your boss profile...</p>
      </div>
    </div>
  }

  const profileCompletion = () => {
    if (!profile) return 0
    const fields = [
      profile.full_name,
      profile.company_name,
      profile.industry,
      profile.business_type,
      profile.phone,
      profile.website,
      profile.bio,
      profile.avatar_url,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const recentAchievements = [
    { id: 1, title: "First Goal Crusher", description: "Completed your first goal", date: "2 days ago", icon: "🎯" },
    { id: 2, title: "Chat Master", description: "Had 10 conversations with AI team", date: "1 week ago", icon: "💬" },
    { id: 3, title: "Profile Boss", description: "Completed your profile", date: "2 weeks ago", icon: "👑" },
  ]

  const recentActivity = [
    { id: 1, action: "Updated SlayList goals", time: "2 hours ago", type: "goal" },
    { id: 2, action: "Chatted with Roxy about marketing strategy", time: "4 hours ago", type: "chat" },
    { id: 3, action: "Completed Focus Mode session", time: "1 day ago", type: "focus" },
    { id: 4, action: "Generated brand assets", time: "2 days ago", type: "brand" },
    { id: 5, action: "Organized documents in Briefcase", time: "3 days ago", type: "document" },
  ]

  const stats = [
    { label: "Goals Completed", value: "24", icon: Target, color: "text-green-600" },
    { label: "AI Conversations", value: "156", icon: Sparkles, color: "text-purple-600" },
    { label: "Focus Sessions", value: "18", icon: Zap, color: "text-blue-600" },
    { label: "Days Active", value: "32", icon: Calendar, color: "text-orange-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Boss Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your empire and track your boss journey 👑</p>
          </div>
          <Button
            onClick={() => setShowProfileModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Overview */}
        <Card className="bg-white/70 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 border-4 border-gradient-to-r from-purple-400 to-pink-400 mb-4">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "B"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{profile?.full_name || "Boss Babe"}</h2>
                  <p className="text-gray-600">{profile?.company_name || "Building My Empire"}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile?.industry && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {profile.industry}
                      </Badge>
                    )}
                    {profile?.business_type && (
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                        {profile.business_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* Profile Completion */}
                <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">Profile Completion</span>
                    <span className="text-sm font-bold text-purple-600">{profileCompletion()}%</span>
                  </div>
                  <Progress value={profileCompletion()} className="h-3" />
                  {profileCompletion() < 100 && (
                    <p className="text-sm text-gray-600 mt-2">Complete your profile to unlock all boss features! 🚀</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-purple-500" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile?.timezone && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-700">{String(profile.timezone).replace("_", " ")}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/70 backdrop-blur-sm border border-purple-200 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your latest boss wins and milestones 🏆</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.date}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest boss moves and actions 📈</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Quick Settings
                </CardTitle>
                <CardDescription>Manage your boss preferences ⚙️</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowProfileModal(true)}
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile Information
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Notification Preferences
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Subscription & Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Profile Modal */}
        <EnhancedProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} />
      </div>
    </div>
  )
}
