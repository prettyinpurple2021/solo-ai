"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Zap,
  Target,
  Rocket,
  Crown,
  Star,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const AI_AGENTS = [
  {
    name: "Nova",
    role: "Strategic Mastermind",
    mood: "🧠",
    color: "from-purple-500 to-indigo-500",
    personality: "Analytical, Strategic, Visionary",
    capabilities: [
      "Business strategy development",
      "Market analysis & insights",
      "Competitive intelligence",
      "Growth planning & forecasting",
    ],
    description:
      "Nova is your strategic powerhouse who sees the big picture and maps out your path to empire domination.",
  },
  {
    name: "Blaze",
    role: "Content Creator",
    mood: "🔥",
    color: "from-orange-500 to-red-500",
    personality: "Creative, Bold, Trendsetting",
    capabilities: [
      "Social media content creation",
      "Blog writing & copywriting",
      "Video script development",
      "Brand storytelling",
    ],
    description:
      "Blaze ignites your brand with viral content that captures attention and converts followers into customers.",
  },
  {
    name: "Echo",
    role: "Customer Success",
    mood: "💬",
    color: "from-blue-500 to-cyan-500",
    personality: "Empathetic, Responsive, Solution-focused",
    capabilities: ["Customer support automation", "Feedback analysis", "Retention strategies", "Community management"],
    description: "Echo ensures every customer feels heard, valued, and becomes a raving fan of your empire.",
  },
  {
    name: "Vex",
    role: "Sales Accelerator",
    mood: "💰",
    color: "from-green-500 to-emerald-500",
    personality: "Persuasive, Results-driven, Charismatic",
    capabilities: [
      "Lead qualification & scoring",
      "Sales funnel optimization",
      "Conversion rate improvement",
      "Revenue forecasting",
    ],
    description: "Vex turns prospects into profits with irresistible offers and conversion-optimized sales processes.",
  },
  {
    name: "Roxy",
    role: "Operations Manager",
    mood: "⚡",
    color: "from-yellow-500 to-orange-500",
    personality: "Efficient, Organized, Systematic",
    capabilities: ["Workflow automation", "Process optimization", "Task management", "Quality assurance"],
    description: "Roxy streamlines your operations so you can focus on scaling while everything runs like clockwork.",
  },
  {
    name: "Lumi",
    role: "Brand Designer",
    mood: "🎨",
    color: "from-pink-500 to-purple-500",
    personality: "Artistic, Intuitive, Trendsetting",
    capabilities: [
      "Visual brand development",
      "Design asset creation",
      "Brand consistency monitoring",
      "Creative campaign ideation",
    ],
    description: "Lumi crafts stunning visuals that make your brand unforgettable and instantly recognizable.",
  },
  {
    name: "Glitch",
    role: "Tech Wizard",
    mood: "🤖",
    color: "from-indigo-500 to-purple-500",
    personality: "Logical, Innovative, Problem-solving",
    capabilities: ["Website optimization", "Tech stack management", "Integration setup", "Performance monitoring"],
    description:
      "Glitch handles all the technical magic behind the scenes, keeping your digital empire running smoothly.",
  },
  {
    name: "Lexi",
    role: "Data Analyst",
    mood: "📊",
    color: "from-teal-500 to-blue-500",
    personality: "Analytical, Precise, Insightful",
    capabilities: ["Performance analytics", "Data visualization", "Trend identification", "ROI optimization"],
    description: "Lexi transforms raw data into actionable insights that drive smarter business decisions.",
  },
]

const FEATURE_CATEGORIES = [
  {
    id: "productivity",
    title: "Productivity Empire",
    icon: Rocket,
    features: [
      {
        title: "AI Task Automation",
        description: "Let your squad handle repetitive tasks while you focus on empire building",
        icon: Zap,
      },
      {
        title: "Smart Scheduling",
        description: "Optimize your calendar for maximum productivity and work-life balance",
        icon: Calendar,
      },
      {
        title: "Priority Intelligence",
        description: "AI-powered task prioritization that aligns with your business goals",
        icon: Target,
      },
    ],
  },
  {
    id: "business",
    title: "Business Building",
    icon: Crown,
    features: [
      {
        title: "Strategic Planning",
        description: "Comprehensive business strategies tailored to your industry and goals",
        icon: Brain,
      },
      {
        title: "Market Analysis",
        description: "Deep insights into your market, competitors, and opportunities",
        icon: BarChart3,
      },
      {
        title: "Brand Development",
        description: "Build a powerful brand that resonates with your target audience",
        icon: Star,
      },
    ],
  },
  {
    id: "growth",
    title: "Growth Acceleration",
    icon: TrendingUp,
    features: [
      {
        title: "Revenue Optimization",
        description: "Maximize your income streams with AI-driven revenue strategies",
        icon: TrendingUp,
      },
      {
        title: "Customer Acquisition",
        description: "Attract and convert high-value customers with precision targeting",
        icon: Users,
      },
      {
        title: "Innovation Engine",
        description: "Stay ahead of the curve with AI-powered innovation and ideation",
        icon: Lightbulb,
      },
    ],
  },
]

export default function FeaturesPage() {
  const [selectedAgent, setSelectedAgent] = useState(AI_AGENTS[0])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <div className="text-2xl">👑</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-purple-600 font-medium">
                Features
              </Link>
              <Link href="/#testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Success Stories
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-full">
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            ✨ Complete Feature Overview
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Features That Build Empires
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the complete arsenal of AI-powered tools and agents designed to transform ambitious entrepreneurs
            into legendary business leaders.
          </p>
        </div>
      </section>

      {/* AI Squad Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Your AI Squad in Detail
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet each member of your personal AI squad. Every agent brings unique skills, personality, and expertise
              to help you dominate your industry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agent Selection */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {AI_AGENTS.map((agent, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAgent.name === agent.name ? "ring-2 ring-purple-300 bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center text-xl`}
                        >
                          {agent.mood}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{agent.name}</h3>
                          <p className="text-sm text-purple-600">{agent.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Agent Details */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {selectedAgent.mood}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-800">{selectedAgent.name}</CardTitle>
                      <CardDescription className="text-lg text-purple-600">{selectedAgent.role}</CardDescription>
                      <Badge variant="outline" className="mt-2">
                        {selectedAgent.personality}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 text-lg">{selectedAgent.description}</p>

                  <h4 className="font-bold text-gray-800 mb-4">Core Capabilities:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Comprehensive Feature Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our complete range of features organized by your business needs. Every tool is designed to
              accelerate your journey to empire status.
            </p>
          </div>

          <Tabs defaultValue="productivity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {FEATURE_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  <category.icon className="w-4 h-4" />
                  <span>{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {FEATURE_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.features.map((feature, index) => (
                    <Card
                      key={index}
                      className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:scale-105"
                    >
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience These Features?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of boss babes who are already building their empires with these powerful AI tools.
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  )
}
