"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Star, Zap, Shield, Users, Sparkles } from "lucide-react"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const aiAgents = [
    {
      name: "Roxy",
      role: "Creative Strategist",
      image: "/images/agents/roxy.png",
      personality: "Bold, innovative, and trend-setting",
      skills: ["Brand Strategy", "Creative Direction", "Market Analysis"],
    },
    {
      name: "Blaze",
      role: "Performance Coach",
      image: "/images/agents/blaze.png",
      personality: "Energetic, motivating, and results-driven",
      skills: ["Goal Setting", "Productivity", "Performance Optimization"],
    },
    {
      name: "Echo",
      role: "Communication Expert",
      image: "/images/agents/echo.png",
      personality: "Articulate, empathetic, and persuasive",
      skills: ["Content Writing", "Public Speaking", "Relationship Building"],
    },
    {
      name: "Lumi",
      role: "Wellness Advisor",
      image: "/images/agents/lumi.png",
      personality: "Calm, nurturing, and insightful",
      skills: ["Stress Management", "Work-Life Balance", "Mindfulness"],
    },
    {
      name: "Vex",
      role: "Tech Innovator",
      image: "/images/agents/vex.png",
      personality: "Analytical, forward-thinking, and precise",
      skills: ["Automation", "Tech Strategy", "Digital Transformation"],
    },
    {
      name: "Lexi",
      role: "Learning Catalyst",
      image: "/images/agents/lexi.png",
      personality: "Curious, patient, and encouraging",
      skills: ["Skill Development", "Knowledge Management", "Training"],
    },
  ]

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Productivity",
      description: "Boost your efficiency with intelligent task management and automated workflows.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert AI Squad",
      description: "Access a team of specialized AI agents, each with unique skills and personalities.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Personalized Experience",
      description: "Tailored recommendations and insights based on your goals and preferences.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Entrepreneur",
      content: "SoloBoss AI transformed how I manage my business. The AI agents feel like having a whole team!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Freelancer",
      content: "The productivity boost is incredible. I'm getting more done in less time than ever before.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "Creative Director",
      content: "Roxy's creative insights have elevated my projects to a whole new level. Amazing!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Custom Banner */}
      <div className="w-full">
        <Image
          src="/images/soloboss-banner.png"
          alt="Confident. Creative. In control. That's the SoloBoss way."
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
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 dark:text-gray-300">
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Unleash Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
              Solo Boss Power
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your productivity with AI agents that understand your goals, amplify your strengths, and help you
            achieve more than you ever thought possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-950 px-8 py-3 text-lg bg-transparent"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Why Choose SoloBoss AI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the future of productivity with our cutting-edge AI platform designed for ambitious
              solopreneurs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-pink-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Meet Your AI Squad
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Each AI agent brings unique expertise and personality to help you excel in different areas of your
              business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiAgents.map((agent, index) => (
              <Card
                key={index}
                className="border-pink-200 dark:border-blue-800 hover:shadow-lg transition-all hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image
                      src={agent.image || "/placeholder.svg"}
                      alt={agent.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{agent.name}</h3>
                  <Badge className="mb-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white">{agent.role}</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 italic">{agent.personality}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {agent.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="outline"
                        className="text-xs border-pink-300 text-pink-600 dark:border-pink-600 dark:text-pink-400"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how SoloBoss AI is transforming the way ambitious professionals work and succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-pink-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Ready to Become a Solo Boss?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of ambitious professionals who are already transforming their productivity with AI.
          </p>
          <Button
            size="lg"
            onClick={onShowAuthModal}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-12 py-4 text-xl"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-pink-200 dark:border-blue-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                SoloBoss AI
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-pink-200 dark:border-blue-800 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Empowering solopreneurs worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
