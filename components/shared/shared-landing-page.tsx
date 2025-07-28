"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Star, Sparkles, Brain, Zap, Shield, Users } from "lucide-react"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: "default" | "minimal"
}

export function SharedLandingPage({
  showAuthModal = false,
  onShowAuthModal = () => {},
  styleVariant = "default",
}: SharedLandingPageProps) {
  // Mobile menu state for responsive navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations and insights powered by advanced AI technology.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our optimized AI processing engine.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy measures.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team using our collaborative AI workspace.",
    },
  ]

  const aiAgents = [
    {
      name: "Roxy",
      role: "Creative Director",
      image: "/images/agents/roxy.png",
      skills: ["Brand Strategy", "Creative Campaigns", "Visual Design"],
      personality: "Bold, innovative, and trend-setting",
    },
    {
      name: "Blaze",
      role: "Marketing Strategist",
      image: "/images/agents/blaze.png",
      skills: ["Growth Hacking", "Social Media", "Content Strategy"],
      personality: "Energetic, results-driven, and data-focused",
    },
    {
      name: "Echo",
      role: "Content Creator",
      image: "/images/agents/echo.png",
      skills: ["Copywriting", "Storytelling", "SEO Optimization"],
      personality: "Articulate, creative, and audience-focused",
    },
    {
      name: "Lumi",
      role: "Analytics Expert",
      image: "/images/agents/lumi.png",
      skills: ["Data Analysis", "Performance Tracking", "Insights"],
      personality: "Analytical, precise, and insight-driven",
    },
    {
      name: "Vex",
      role: "Tech Innovator",
      image: "/images/agents/vex.png",
      skills: ["Automation", "Integration", "Tech Solutions"],
      personality: "Technical, innovative, and solution-oriented",
    },
    {
      name: "Lexi",
      role: "Business Strategist",
      image: "/images/agents/lexi.png",
      skills: ["Business Planning", "Market Research", "Strategy"],
      personality: "Strategic, analytical, and goal-oriented",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content:
        "SoloBoss AI transformed how I run my business. The AI agents are like having a full team of experts at my fingertips.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Marcus Chen",
      role: "Freelance Designer",
      content:
        "The creative insights from Roxy have elevated my design work to a whole new level. It's like having a creative director 24/7.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Consultant",
      content:
        "Blaze's marketing strategies have helped me double my client's engagement rates. The ROI speaks for itself.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Custom Banner */}
      <div className="w-full">
        <Image
          src="/images/soloboss-banner.png"
          alt="Confident. Creative. In control. That's the SoloBoss way. - SoloBoss AI"
          width={1920}
          height={200}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-pink-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                SoloBoss AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#agents"
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                AI Squad
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Testimonials
              </a>
              <ThemeToggle />
              <Button
                onClick={onShowAuthModal}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-pink-200 dark:border-blue-800">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#agents"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  AI Squad
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  Testimonials
                </a>
                <Button
                  onClick={onShowAuthModal}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Business Assistant
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Unleash Your Inner Boss
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your business with our AI-powered platform. Get personalized insights, automate workflows, and
            scale your success with intelligent assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3"
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onShowAuthModal}
              className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-900/20 px-8 py-3 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to supercharge your business with AI-powered intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-pink-100 dark:border-blue-800 hover:border-pink-300 dark:hover:border-blue-600"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                Meet Your AI Squad
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Each AI agent brings unique expertise to help you dominate your industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiAgents.map((agent, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-pink-100 dark:border-blue-800 hover:border-pink-300 dark:hover:border-blue-600 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="relative bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 h-96">
                    <Image
                      src={agent.image || "/placeholder.svg"}
                      alt={agent.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-pink-600 dark:text-pink-400 font-medium mb-3">{agent.role}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{agent.personality}</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="secondary"
                          className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how SoloBoss AI is transforming businesses worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-pink-100 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Become the Boss?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of entrepreneurs who are already dominating their industries with SoloBoss AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onShowAuthModal}
                className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onShowAuthModal}
                className="border-white text-white hover:bg-white/10 px-8 py-3 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/images/soloboss-logo.png"
                  alt="SoloBoss AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">SoloBoss AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering entrepreneurs with AI-powered business intelligence and automation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#agents" className="hover:text-white transition-colors">
                    AI Squad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SoloBoss AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
