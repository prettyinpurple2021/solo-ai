"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Search, MessageCircle, Video, Mail, ExternalLink, ChevronDown, ChevronRight, HelpCircle, Lightbulb, Zap, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface GuideItem {
  id: string
  title: string
  description: string
  icon: any
  href: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFAQs, setOpenFAQs] = useState<string[]>([])

  const toggleFAQ = (id: string) => {
    setOpenFAQs(prev => 
      prev.includes(id) 
        ? prev.filter(faqId => faqId !== id)
        : [...prev, id]
    )
  }

  const faqData: FAQItem[] = [
    {
      id: "getting-started-1",
      question: "How do I get started with SoloBoss AI?",
      answer: "Getting started is simple! Sign up for a free account, complete the onboarding wizard to tell us about your business, and start exploring your AI squad. Begin with simple tasks like goal setting or asking your AI agents for business advice.",
      category: "Getting Started"
    },
    {
      id: "getting-started-2", 
      question: "What's included in the free plan?",
      answer: "The Launchpad (free) plan includes access to 2 AI agents (Nova & Echo), 5 AI conversations per day, basic task automation, email support, community access, and mobile app access. Perfect for getting a feel for the platform!",
      category: "Getting Started"
    },
    {
      id: "ai-agents-1",
      question: "Who are the 8 AI agents and what do they do?",
      answer: "Meet your squad: Roxy (Executive Assistant) for scheduling, Blaze (Growth Strategist) for business growth, Echo (Marketing Maven) for content, Lumi (Legal & Docs) for documentation, Vex (Technical Architect) for tech specs, Lexi (Strategy Analyst) for insights, Nova (Product Designer) for UX/UI, and Glitch (QA & Debug) for quality assurance.",
      category: "AI Agents"
    },
    {
      id: "ai-agents-2",
      question: "Can the AI agents access my business data?",
      answer: "Your AI agents only access the data you explicitly share with them. We use bank-level security with end-to-end encryption. Your data stays yours, and agents use it only to provide personalized assistance for your business needs.",
      category: "AI Agents"
    },
    {
      id: "features-1",
      question: "What is SlayList and how does it work?",
      answer: "SlayList is your AI-powered goal and task management system. Set ambitious goals, break them into actionable tasks, and let our AI help you prioritize and stay on track. It's designed specifically for solo entrepreneurs who need to juggle multiple priorities.",
      category: "Features"
    },
    {
      id: "features-2",
      question: "How does the Briefcase feature work?",
      answer: "Your Briefcase is a secure file storage and organization system. Upload documents, images, and files that your AI agents can reference to provide better assistance. Everything is encrypted and only accessible by you and your chosen AI agents.",
      category: "Features"
    },
    {
      id: "billing-1",
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences. No contracts, no commitment - just flexible pricing that grows with your business.",
      category: "Billing"
    },
    {
      id: "billing-2",
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied with SoloBoss AI, we'll refund your payment, no questions asked. We're confident you'll love the platform!",
      category: "Billing"
    },
    {
      id: "technical-1",
      question: "Is my data secure?",
      answer: "Security is our top priority. We use enterprise-grade encryption, secure cloud infrastructure, and follow industry best practices. Your data is encrypted in transit and at rest, and we never share your information with third parties.",
      category: "Technical"
    },
    {
      id: "technical-2",
      question: "Can I integrate SoloBoss AI with other tools?",
      answer: "Yes! We support integrations with popular tools like Google Calendar, Slack, Clerk Billing, and many more. Check out our integrations page to see the full list and set up connections to streamline your workflow.",
      category: "Technical"
    }
  ]

  const guides: GuideItem[] = [
    {
      id: "setup-guide",
      title: "Complete Setup Guide",
      description: "Get your SoloBoss AI account set up perfectly in 15 minutes",
      icon: Settings,
      href: "#setup",
      difficulty: "beginner"
    },
    {
      id: "ai-agents-guide",
      title: "Working with AI Agents",
      description: "Learn how to get the most out of your AI squad",
      icon: Users,
      href: "#ai-agents",
      difficulty: "beginner"
    },
    {
      id: "productivity-guide",
      title: "Productivity Mastery",
      description: "Advanced strategies for solo entrepreneur productivity",
      icon: Zap,
      href: "#productivity",
      difficulty: "intermediate"
    },
    {
      id: "automation-guide",
      title: "Automation Workflows",
      description: "Automate your business processes like a boss",
      icon: Lightbulb,
      href: "#automation",
      difficulty: "advanced"
    }
  ]

  const categories = ["Getting Started", "AI Agents", "Features", "Billing", "Technical"]

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700"
      case "intermediate": return "bg-yellow-100 text-yellow-700"
      case "advanced": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

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
            <div className="flex items-center space-x-4">
              <Link href="/contact">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  Contact Support
                </Button>
              </Link>
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
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            📚 Help Center
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How Can We Help?
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers, learn new strategies, and get the most out of your SoloBoss AI experience. 
            Your success is our mission! 💪
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help topics, features, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg border-purple-200 focus:border-purple-500 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Get instant help from our support team</p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Send us a detailed message</p>
                <Link href="/contact">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Contact Us
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch step-by-step guides</p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Watch Videos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started Guides */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Getting Started Guides</h2>
            <p className="text-xl text-gray-600">Master SoloBoss AI with our comprehensive guides</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide) => (
              <Card key={guide.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{guide.title}</h3>
                        <Badge className={`text-xs ${getDifficultyColor(guide.difficulty)}`}>
                          {guide.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{guide.description}</p>
                      <div className="flex items-center gap-2 text-purple-600 font-medium">
                        <span>Read Guide</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <Badge 
                key={category}
                variant="outline" 
                className="px-4 py-2 cursor-pointer hover:bg-purple-50 border-purple-200"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="border border-gray-200">
                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                      </div>
                      {openFAQs.includes(faq.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">Try a different search term or browse our categories</p>
              <Link href="/contact">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Contact Support
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Still Need Help?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our boss support team is here to help you succeed. Don't hesitate to reach out - we're always happy to help!
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                Contact Support
              </Button>
            </Link>
            <Link href="/community">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 