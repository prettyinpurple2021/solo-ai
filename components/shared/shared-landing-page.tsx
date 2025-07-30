"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  X,
  Menu,
  Play,
  Brain
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ScheduleDemoModal } from "@/components/schedule/schedule-demo-modal"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: string
}

const features = [
  {
    icon: Brain,
    title: "8-Member AI Squad",
    description: "Meet your virtual team: from Roxy (Executive Assistant) to Glitch (QA & Debug). Each agent specializes in different aspects of your business.",
  },
  {
    icon: Target,
    title: "SlayList Goal System",
    description: "Set ambitious goals, break them into actionable tasks, and let AI help you prioritize. Built specifically for solo entrepreneurs who juggle everything.",
  },
  {
    icon: Sparkles,
    title: "BrandStyler Studio",
    description: "Create consistent brand assets, marketing materials, and content with AI-powered design tools that understand your unique style.",
  },
  {
    icon: Zap,
    title: "Anti-Burnout Focus Mode",
    description: "Work smarter, not harder. Our AI prevents overwhelm by optimizing your schedule and protecting your mental energy.",
  },
  {
    icon: TrendingUp,
    title: "Empire Analytics",
    description: "Track your business growth, productivity patterns, and goal progress with insights designed for solo entrepreneurs.",
  },
  {
    icon: Shield,
    title: "Briefcase Security",
    description: "Your business data is protected with bank-level encryption. Store files, documents, and sensitive information safely in your AI Briefcase.",
  },
]

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Solo E-commerce Founder",
    content: "Finally, a platform that gets the solo entrepreneur struggle! My AI squad handles customer service while I focus on product development. Revenue up 180% this quarter.",
    rating: 5,
    avatar: "",
  },
  {
    name: "Jordan Kim",
    role: "Digital Marketing Consultant", 
    content: "The anti-burnout approach is genius. I'm working 30% fewer hours but serving twice as many clients. The AI agents literally feel like having a virtual team.",
    rating: 5,
    avatar: "",
  },
  {
    name: "Sam Thompson",
    role: "SaaS Startup Founder",
    content: "From idea to launch in 6 weeks with SoloBoss AI. The Brand Studio and AI agents helped me build what used to take a full team. This is the future of solo entrepreneurship.",
    rating: 5,
    avatar: "",
  },
]

const pricingPlans = [
  {
    name: "Launchpad",
    price: "Free",
    period: "",
    description: "Perfect for testing the boss life",
    features: ["2 AI Agents (Nova & Echo)", "5 AI Conversations/day", "Basic Task Automation", "Email Support", "Mobile App Access", "Community Access"],
    popular: false,
    cta: "Start Free",
  },
  {
    name: "Accelerator",
    price: "$19",
    period: "/month",
    description: "For ambitious solo entrepreneurs",
    features: [
      "All 8 AI Squad Members",
      "Unlimited AI Conversations", 
      "Full BrandStyler Studio",
      "10GB Briefcase Storage",
      "Priority Support",
      "Advanced Automation",
      "Goal Tracking & Analytics",
    ],
    popular: true,
    cta: "Upgrade to Pro",
  },
  {
    name: "Dominator",
    price: "$39",
    period: "/month",
    description: "For empire-building bosses",
    features: [
      "Everything in Accelerator",
      "Unlimited Briefcase Storage",
      "White-label Capabilities",
      "Custom AI Agent Training",
      "24/7 Priority Support",
      "Advanced Integrations",
      "Personal Success Manager",
      "Early Access to New Features",
    ],
    popular: false,
    cta: "Build Empire",
  },
]

export function SharedLandingPage({
  showAuthModal = false,
  onShowAuthModal = () => {},
  styleVariant = "default",
}: SharedLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Custom Banner */}
      <div className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-evenly">
            <Image
              src="/images/soloboss-banner.png"
              alt="SoloBoss AI Banner"
              width={800}
              height={120}
              className="max-w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-pink-200 dark:border-purple-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={40} height={40} className="rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                SoloBoss AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("features")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#agents"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("agents")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                AI Squad
              </a>
              <a
                href="#testimonials"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("testimonials")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("pricing")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Pricing
              </a>
              <ThemeToggle />
              <Button 
                onClick={onShowAuthModal}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-pink-200 dark:border-purple-800"
              >
                <div className="flex flex-col space-y-4">
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("features")
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#agents"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("agents")
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    AI Squad
                  </a>
                  <a
                    href="#testimonials"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("testimonials")
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    Testimonials
                  </a>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("pricing")
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    Pricing
                  </a>
                  <Button
                    onClick={onShowAuthModal}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              🚀 AI-Powered Productivity Revolution
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Become the Ultimate
              <br />
              <span className="text-6xl md:text-8xl">SoloBoss</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your productivity with AI agents that work 24/7. Automate everything, achieve more, and dominate
              your industry like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={onShowAuthModal}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4"
              >
                Start Your Empire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-pink-300 dark:border-purple-600 bg-transparent"
                onClick={() => setShowScheduleModal(true)}
              >
                Watch Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">300%</div>
                <div className="text-gray-600 dark:text-gray-300">Productivity Increase</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Users</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">$2M+</div>
                <div className="text-gray-600 dark:text-gray-300">Revenue Generated</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Supercharge Your Success
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform gives you everything you need to dominate your market and achieve unprecedented
              growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-pink-200 dark:border-purple-800 hover:border-pink-300 dark:hover:border-purple-600">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Meet Your AI Squad 🤖
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              8 specialized AI agents, each with unique personalities and expertise to handle different aspects of your business. 
              Your virtual dream team, available 24/7.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { name: "Roxy", role: "Creative Strategist", specialty: "Brand & Content Creation", color: "from-pink-500 to-purple-500", image: "/images/agents/roxy.png" },
              { name: "Blaze", role: "Performance Coach", specialty: "Productivity & Goal Achievement", color: "from-orange-500 to-red-500", image: "/images/agents/blaze.png" },
              { name: "Echo", role: "Communication Expert", specialty: "Networking & Relationships", color: "from-blue-500 to-teal-500", image: "/images/agents/echo.png" },
              { name: "Glitch", role: "QA & Debug Agent", specialty: "Quality Assurance & Testing", color: "from-red-500 to-orange-500", image: "/images/agents/glitch.png" },
              { name: "Lumi", role: "Legal & Docs Agent", specialty: "Legal Compliance & Documentation", color: "from-indigo-500 to-purple-500", image: "/images/agents/lumi.png" },
              { name: "Vex", role: "Tech & Automation", specialty: "Technical Solutions & Workflows", color: "from-cyan-500 to-blue-500", image: "/images/agents/vex.png" },
              { name: "Lexi", role: "Data & Analytics", specialty: "Business Intelligence & Insights", color: "from-emerald-500 to-teal-500", image: "/images/agents/lexi.png" },
              { name: "Nova", role: "Innovation & Growth", specialty: "Strategy & Market Expansion", color: "from-violet-500 to-purple-500", image: "/images/agents/nova.png" }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-pink-200 dark:border-purple-800 hover:border-pink-300 dark:hover:border-purple-600 text-center">
                  <CardHeader>
                    <div className={`w-20 h-20 bg-gradient-to-r ${agent.color} rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden`}>
                      <Image
                        src={agent.image}
                        alt={agent.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white" style={{ display: 'none' }}>
                        {agent.name.charAt(0)}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{agent.name}</CardTitle>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-purple-900 dark:text-purple-200">
                      {agent.role}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                      {agent.specialty}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Link href="/team">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4"
                >
                  Meet Your Full AI Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of entrepreneurs who've transformed their businesses with SoloBoss AI.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center p-8 border-pink-200 dark:border-purple-800">
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <Image
                        src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                        alt={testimonials[currentTestimonial].name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Power Level
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start your journey to becoming a SoloBoss with our flexible pricing plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${plan.popular ? "scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <Card
                  className={`h-full ${
                    plan.popular
                      ? "border-pink-300 dark:border-purple-600 shadow-xl"
                      : "border-pink-200 dark:border-purple-800"
                  }`}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                      {plan.price}
                      <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-300">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                          : "border-pink-300 dark:border-purple-600 text-pink-600 dark:text-purple-400 hover:bg-pink-50 dark:hover:bg-purple-900/20"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Become a SoloBoss?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the revolution of AI-powered entrepreneurs. Start for free today and experience the future of
              productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

              <Button
                size="lg"
                onClick={onShowAuthModal}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4"
              >
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-pink-300 dark:border-purple-600 bg-transparent"
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/images/soloboss-logo.png"
                  alt="SoloBoss AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">SoloBoss AI</span>
              </div>
              <p className="text-gray-400">Empowering entrepreneurs with AI-powered productivity tools.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("features")
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("pricing")
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/api-docs" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 SoloBoss AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Schedule Demo Modal */}
      <ScheduleDemoModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  )
}
