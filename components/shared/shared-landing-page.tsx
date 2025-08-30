"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
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
  Play
} from "lucide-react"

import Link from "next/link"
import { ScheduleDemoModal } from "@/components/schedule/schedule-demo-modal"
import { ResponsiveImage } from "@/components/ui/responsive-image"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: string
}

const features = [
  {
    icon: Sparkles,
    title: "8 AI Agents at Your Service",
    description: "Meet Nova, Echo, Atlas, Luna, Phoenix, Orion, Vega, and Nova - your personal AI team that never sleeps.",
  },
  {
    icon: Target,
    title: "Goal Achievement System",
    description: "Set, track, and crush your goals with our intelligent goal-setting framework and progress analytics.",
  },
  {
    icon: Zap,
    title: "Instant Automation",
    description: "Automate repetitive tasks and workflows with our no-code automation engine.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Get detailed insights into your productivity patterns and optimize your workflow.",
  },
  {
    icon: Users,
    title: "Smart File Management",
    description: "Upload, organize, and analyze documents with AI-powered briefcase and content parsing.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption and compliance certifications.",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechStart",
    content: "SoloBoss AI transformed how I manage my business. The 8 AI agents work 24/7, and I've increased productivity by 300% in just 3 months.",
    rating: 5,
    avatar: "/default-user.svg",
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelance Designer",
    content:
      "The AI agents are like having a full team. Nova handles my scheduling, Echo manages my finances, and I can focus on creative work.",
    rating: 5,
    avatar: "/default-user.svg",
  },
  {
    name: "Emily Watson",
    role: "Marketing Director",
    content: "Game-changer for our agency. The file management and AI insights have increased client satisfaction by 40% while reducing our workload by 60%.",
    rating: 5,
    avatar: "/default-user.svg",
  },
]

const pricingPlans = [
  {
    name: "Launch",
    price: "$0",
    period: "/month",
    description: "Perfect for ambitious beginners ready to start their empire",
    features: ["Access to 2 AI agents (Nova & Echo)", "5 AI conversations per day", "Basic task automation", "Email support", "Community access", "Mobile app access"],
    popular: false,
    cta: "Start Free",
    badge: "Free Forever",
  },
  {
    name: "Accelerator",
    price: "$19",
    period: "/month",
    description: "For growing boss babes scaling their operations",
    features: [
      "Access to 5 AI agents (Nova, Echo, Atlas, Luna, Phoenix)",
      "100 AI conversations per day",
      "Advanced automation workflows",
      "Priority email support",
      "Analytics dashboard",
      "Integration with 50+ tools",
      "Custom branding options",
      "Team collaboration (up to 3 members)",
    ],
    popular: true,
    cta: "Get Started",
    badge: "Most Popular",
  },
  {
    name: "Dominator",
    price: "$29",
    period: "/month",
    description: "For empire builders who demand unlimited power",
    features: [
      "Access to all 8 AI agents (Nova, Echo, Atlas, Luna, Phoenix, Orion, Vega, Nova)",
      "Unlimited AI conversations",
      "Advanced automation + custom workflows",
      "24/7 priority support + phone support",
      "Advanced analytics + custom reports",
      "Unlimited integrations",
      "White-label options",
      "Unlimited team members",
      "API access",
      "Custom AI agent training",
    ],
    popular: false,
    cta: "Contact Sales",
    badge: "Unlimited Power",
  },
]

export function SharedLandingPage(_props: SharedLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const router = useRouter()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-pink-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-purple-200 dark:border-teal-800">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ResponsiveImage 
                src="/images/soloboss-logo.png" 
                alt="SoloBoss AI" 
                width={40} 
                height={40} 
                className="rounded-lg"
                fallbackSrc="/images/logo.png"
              />
              <span className="text-responsive-xl lg:text-responsive-2xl font-bold bg-gradient-to-r from-purple-600 via-teal-500 to-pink-600 bg-clip-text text-transparent">
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
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#agents"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("agents")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
              >
                AI Squad
              </a>
              <a
                href="#testimonials"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("testimonials")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("pricing")
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
              >
                Pricing
              </a>
              <ThemeToggle />
              <Link href="/signin">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
                className="md:hidden py-4 border-t border-purple-200 dark:border-teal-800"
              >
                <div className="flex flex-col space-y-4">
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("features")
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
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
                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
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
                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
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
                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Pricing
                  </a>
                  <Link href="/signin">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-teal-400 w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="p-responsive-xl">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <Badge className="mb-6 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 text-white">
                ✨ AI-Powered Productivity Revolution
              </Badge>
              <h1 className="text-responsive-4xl lg:text-responsive-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
                Become the Ultimate
                <br />
                <span className="text-responsive-5xl lg:text-responsive-7xl">SoloBoss</span>
              </h1>
              <p className="text-responsive-lg lg:text-responsive-xl text-gray-600 dark:text-gray-300 mb-8">
                Transform your productivity with AI agents that work 24/7. Automate everything, achieve more, and dominate
                your industry like never before.
              </p>
              <div className="flex-responsive mb-10">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white px-8 py-3"
                  >
                    Start Your Empire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 border-purple-300 dark:border-teal-600 bg-transparent"
                  onClick={() => setShowScheduleModal(true)}
                >
                  Watch Demo
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right side - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ResponsiveImage
                  src="/images/soloboss-hero-silhouette.jpg"
                  alt="SoloBoss - Confident entrepreneur working in her office"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                  fallbackSrc="/images/soloboss-hero-silhouette.png"
                />
                {/* Gradient overlay to enhance the integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-teal-900/20" />
              </div>
            </div>
          </div>

          {/* Stats - moved below the hero content */}
          <div className="mt-16">
            <div className="mobile-first-grid max-w-4xl mx-auto text-center">
              <div className="text-center">
                <div className="text-responsive-3xl lg:text-responsive-4xl font-bold text-purple-600 dark:text-teal-400">300%</div>
                <div className="text-responsive-sm lg:text-responsive-base text-gray-600 dark:text-gray-300">Productivity Increase</div>
              </div>
              <div className="text-center">
                <div className="text-responsive-3xl lg:text-responsive-4xl font-bold text-teal-600 dark:text-pink-400">50K+</div>
                <div className="text-responsive-sm lg:text-responsive-base text-gray-600 dark:text-gray-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-responsive-3xl lg:text-responsive-4xl font-bold text-pink-600 dark:text-purple-400">$2M+</div>
                <div className="text-responsive-sm lg:text-responsive-base text-gray-600 dark:text-gray-300">Revenue Generated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SoloBoss Motto Banner */}
      <section className="p-responsive-xl bg-gradient-to-r from-purple-50 via-teal-50 to-pink-50 dark:from-purple-900/20 dark:via-teal-900/20 dark:to-pink-900/20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <ResponsiveImage
              src="/images/soloboss-banner.jpg"
              alt="Confident. Creative. In control. That's the SoloBoss way."
              width={1200}
              height={300}
              className="w-full h-auto object-cover"
              fallbackSrc="/images/soloboss-banner.png"
            />
            {/* Optional overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="p-responsive-xl bg-white/50 dark:bg-slate-800/50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-3xl lg:text-responsive-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
              Supercharge Your Success
            </h2>
            <p className="text-responsive-lg lg:text-responsive-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform gives you everything you need to dominate your market and achieve unprecedented
              growth.
            </p>
          </motion.div>

          <div className="grid-responsive">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-purple-200 dark:border-teal-800 hover:border-purple-300 dark:hover:border-teal-600">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
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
      <section id="agents" className="p-responsive-xl bg-white/50 dark:bg-slate-800/50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-3xl lg:text-responsive-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
              Meet Your AI Squad ✨
            </h2>
            <p className="text-responsive-lg lg:text-responsive-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              8 specialized AI agents, each with unique personalities and expertise to handle different aspects of your business. 
              Your virtual dream team, available 24/7.
            </p>
          </motion.div>

          <div className="mobile-first-grid mb-12">
            {[
              { name: "Roxy", role: "Creative Strategist", specialty: "Brand & Content Creation", color: "from-purple-500 to-pink-500", image: "/images/agents/roxy.png" },
              { name: "Blaze", role: "Performance Coach", specialty: "Productivity & Goal Achievement", color: "from-orange-500 to-red-500", image: "/images/agents/blaze.png" },
              { name: "Echo", role: "Communication Expert", specialty: "Networking & Relationships", color: "from-teal-500 to-cyan-500", image: "/images/agents/echo.png" },
              { name: "Glitch", role: "QA & Debug Agent", specialty: "Quality Assurance & Testing", color: "from-red-500 to-orange-500", image: "/images/agents/glitch.png" },
              { name: "Lumi", role: "Legal & Docs Agent", specialty: "Legal Compliance & Documentation", color: "from-purple-500 to-indigo-500", image: "/images/agents/lumi.png" },
              { name: "Vex", role: "Tech & Automation", specialty: "Technical Solutions & Workflows", color: "from-cyan-500 to-teal-500", image: "/images/agents/vex.png" },
              { name: "Lexi", role: "Data & Analytics", specialty: "Business Intelligence & Insights", color: "from-teal-500 to-emerald-500", image: "/images/agents/lexi.png" },
              { name: "Nova", role: "Innovation & Growth", specialty: "Strategy & Market Expansion", color: "from-pink-500 to-purple-500", image: "/images/agents/nova.png" }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-purple-200 dark:border-teal-800 hover:border-purple-300 dark:hover:border-teal-600 text-center">
                  <CardHeader>
                    <div className={`w-20 h-20 bg-gradient-to-r ${agent.color} rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden`}>
                      <img
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
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white agent-initial">
                        {agent.name.charAt(0)}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{agent.name}</CardTitle>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-teal-900 dark:text-teal-200">
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
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white text-lg px-8 py-4"
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of entrepreneurs who&apos;ve transformed their businesses with SoloBoss AI.
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
                <Card className="text-center p-8 border-purple-200 dark:border-teal-800">
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 italic">
                      &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <ResponsiveImage
                        src={testimonials[currentTestimonial].avatar || "/default-user.svg"}
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
                  aria-label={`View testimonial ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="p-responsive-xl bg-white/50 dark:bg-slate-800/50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-3xl lg:text-responsive-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Power Level
            </h2>
            <p className="text-responsive-lg lg:text-responsive-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start your journey to becoming a SoloBoss with our flexible pricing plans.
            </p>
          </motion.div>

          <div className="mobile-first-grid max-w-6xl mx-auto">
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
                    <Badge className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <Card
                  className={`h-full ${
                    plan.popular
                      ? "border-purple-300 dark:border-teal-600 shadow-xl"
                      : "border-purple-200 dark:border-teal-800"
                  }`}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-purple-600 dark:text-teal-400">
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
                          ? "bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white"
                          : "border-purple-300 dark:border-teal-600 text-purple-600 dark:text-teal-400 hover:bg-purple-50 dark:hover:bg-teal-900/20"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => {
                        if (plan.cta === "Contact Sales") {
                          router.push("/contact")
                        } else {
                          router.push("/signup")
                        }
                      }}
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
      <section className="p-responsive-xl">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-responsive-3xl lg:text-responsive-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
              Ready to Become a SoloBoss?
            </h2>
            <p className="text-responsive-lg lg:text-responsive-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the revolution of AI-powered entrepreneurs. Start for free today and experience the future of
              productivity.
            </p>
            <div className="flex-responsive justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white text-lg px-8 py-4"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-purple-300 dark:border-teal-600 bg-transparent"
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-responsive-xl">
        <div className="container-responsive">
          <div className="mobile-first-grid">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ResponsiveImage
                  src="/images/soloboss-logo.png"
                  alt="SoloBoss AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  fallbackSrc="/images/logo.png"
                />
                <span className="text-responsive-lg lg:text-responsive-xl font-bold">SoloBoss AI</span>
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
                  <Link href="/help" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="flex-responsive justify-between items-center">
            <p className="text-gray-400">© 2024 SoloBoss AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
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
