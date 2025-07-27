"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Star, Sparkles, Brain, Target, Rocket, Heart, Crown, Gem } from "lucide-react"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: "default" | "premium"
}

export function SharedLandingPage({
  showAuthModal = false,
  onShowAuthModal = () => {},
  styleVariant = "default",
}: SharedLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Intelligence",
      description: "Advanced AI agents that understand your business needs and adapt to your workflow.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Precision Focus",
      description: "Stay laser-focused on what matters most with intelligent task prioritization.",
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Accelerated Growth",
      description: "Scale your business faster with AI-driven insights and automation.",
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Boss-Level Control",
      description: "Maintain complete control while leveraging AI to amplify your capabilities.",
    },
  ]

  const aiAgents = [
    {
      name: "Roxy",
      role: "Strategic Advisor",
      image: "/images/agents/roxy.png",
      skills: ["Business Strategy", "Market Analysis", "Growth Planning"],
      personality: "Bold and decisive, Roxy helps you make strategic decisions with confidence.",
    },
    {
      name: "Blaze",
      role: "Marketing Maverick",
      image: "/images/agents/blaze.png",
      skills: ["Content Creation", "Social Media", "Brand Building"],
      personality: "Creative and energetic, Blaze ignites your marketing campaigns.",
    },
    {
      name: "Echo",
      role: "Communication Expert",
      image: "/images/agents/echo.png",
      skills: ["Email Management", "Client Relations", "Team Communication"],
      personality: "Articulate and diplomatic, Echo ensures your message resonates.",
    },
    {
      name: "Lumi",
      role: "Data Analyst",
      image: "/images/agents/lumi.png",
      skills: ["Analytics", "Reporting", "Insights"],
      personality: "Brilliant and analytical, Lumi illuminates patterns in your data.",
    },
    {
      name: "Vex",
      role: "Problem Solver",
      image: "/images/agents/vex.png",
      skills: ["Troubleshooting", "Process Optimization", "Innovation"],
      personality: "Sharp and resourceful, Vex tackles complex challenges head-on.",
    },
    {
      name: "Lexi",
      role: "Learning Specialist",
      image: "/images/agents/lexi.png",
      skills: ["Training", "Knowledge Management", "Skill Development"],
      personality: "Patient and knowledgeable, Lexi accelerates your learning journey.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechStart",
      content:
        "SoloBoss AI transformed how I run my business. The AI agents feel like having a world-class team at my fingertips.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Marcus Rodriguez",
      role: "Founder, Creative Studio",
      content:
        "The strategic insights from Roxy and creative support from Blaze have doubled my revenue in just 6 months.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Emily Watson",
      role: "Solo Entrepreneur",
      content:
        "Finally, AI that actually understands my business. It's like having mentors, assistants, and advisors all in one.",
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
                Success Stories
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
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                  Success Stories
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Business Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Unleash Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
                Inner Boss
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your business with AI agents that think, strategize, and execute like your personal board of
              advisors. Be confident, creative, and in complete control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onShowAuthModal}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-3"
              >
                <Crown className="w-5 h-5 mr-2" />
                Start Your Empire
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-300 dark:border-purple-400 text-pink-600 dark:text-purple-400 hover:bg-pink-50 dark:hover:bg-purple-900/20 text-lg px-8 py-3 bg-transparent"
              >
                <Gem className="w-5 h-5 mr-2" />
                See It In Action
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                Why Choose SoloBoss AI?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the power of AI that adapts to your unique business style and amplifies your natural strengths.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-pink-200 dark:border-purple-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300">{feature.description}</CardDescription>
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
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Each AI agent brings unique expertise and personality to support different aspects of your business
              journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiAgents.map((agent, index) => (
              <Card
                key={index}
                className="border-pink-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80"
              >
                <CardHeader className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 p-1">
                    <Image
                      src={agent.image || "/placeholder.svg"}
                      alt={agent.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{agent.name}</CardTitle>
                  <CardDescription className="text-pink-600 dark:text-purple-400 font-medium">
                    {agent.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{agent.personality}</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="bg-pink-100 dark:bg-purple-900/30 text-pink-700 dark:text-purple-300"
                      >
                        {skill}
                      </Badge>
                    ))}
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
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how entrepreneurs are transforming their businesses with SoloBoss AI.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-pink-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{testimonial.name}</CardTitle>
                      <CardDescription className="text-pink-600 dark:text-purple-400">
                        {testimonial.role}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Become the Boss You Were Meant to Be?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of entrepreneurs who've transformed their businesses with AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onShowAuthModal}
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <Crown className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-3 bg-transparent"
              >
                <Heart className="w-5 h-5 mr-2" />
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
                Empowering entrepreneurs with AI-driven business intelligence. Be confident, creative, and in control.
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
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Built for bosses, by bosses.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
