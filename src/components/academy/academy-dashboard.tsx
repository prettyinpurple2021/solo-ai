"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, BookOpen, Clock, Award, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LearningPath {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  modules: any[]
}

export function AcademyDashboard() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [recommendations, setRecommendations] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const [pathsRes, recsRes] = await Promise.all([
          fetch('/api/academy/paths'),
          fetch('/api/academy/recommendations')
        ])

        if (pathsRes.ok) setPaths(await pathsRes.json())
        if (recsRes.ok) setRecommendations(await recsRes.json())
      } catch (error) {
        console.error("Failed to fetch academy data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl" />
            ))}
        </div>
     )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Premium Content
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight">SoloSuccess Academy</h1>
                <p className="text-lg text-indigo-100">
                    Master the art of solopreneurship. Level up your skills, earn XP, and unlock exclusive tools as you grow your empire.
                </p>
                <div className="flex gap-4 pt-2">
                    <Button variant="secondary" size="lg" className="font-semibold shadow-lg">
                        <Play className="w-4 h-4 mr-2" /> Resume Learning
                    </Button>
                    <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                        View My Certificates
                    </Button>
                </div>
            </div>
            
            <div className="hidden md:block">
                 {/* Decorative element could go here, e.g. a 3D illustration or large icon */}
                 <Award className="w-32 h-32 text-indigo-200/20" />
            </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-50" />
      </section>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
            <TabsList className="bg-background border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
             {/* Recommendations */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
                    <Button variant="ghost" className="text-muted-foreground">View All</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.length > 0 ? recommendations.map(path => (
                        <PathCard key={path.id} path={path} />
                    )) : (
                        <div className="col-span-full p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                            No recommendations yet. Complete your profile to get personalized suggestions.
                        </div>
                    )}
                </div>
             </div>

             {/* Recent Activity / Progress could go here */}
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map(path => (
                    <PathCard key={path.id} path={path} />
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PathCard({ path }: { path: LearningPath }) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden flex flex-col h-full">
            <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={path.difficulty === 'beginner' ? 'default' : 'secondary'} className="capitalize">
                        {path.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{path.modules?.length || 0} Modules</Badge>
                </div>
                <CardTitle className="line-clamp-1 group-hover:text-indigo-600 transition-colors">{path.title}</CardTitle>
                <CardDescription className="line-clamp-2">{path.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>~ {(path.modules?.length || 0) * 15} mins</span>
                    </div>
                 </div>
            </CardContent>
            <CardFooter>
                <Link href={`/academy/path/${path.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-indigo-600 transition-colors">Start Learning</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
