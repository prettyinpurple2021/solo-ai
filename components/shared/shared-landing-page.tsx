"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import {
  Star,
  Users,
  Zap,
  Shield,
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  Menu,
  X,
  MessageSquare,
  Brain,
  Rocket,
  Heart,
  Award,
  Globe,
  Smartphone,
  Headphones,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScheduleDemoModal } from "@/components/schedule/schedule-demo-modal"

export function SharedLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const { theme } = useTheme()

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Squad Management",
      description: "8 specialized AI agents working together to optimize every aspect of your business operations.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Task Automation",
      description: "Intelligent task prioritization and automation that adapts to your workflow and business goals.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Real-time insights and analytics to track your productivity and business growth metrics.",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Voice Chat Integration",
      description: "Natural voice conversations with your AI team members for seamless collaboration.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption to protect your sensitive business data.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Full-featured mobile experience so you can manage your empire from anywhere.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechStart Inc.",
      content:
        "SoloBoss AI transformed how I run my business. The AI squad handles everything from scheduling to analytics, giving me back 20+ hours per week.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Entrepreneur",
      content:
        "The voice chat feature is game-changing. I can literally talk to my AI team like they're real assistants. It's the future of business management.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Freelance Consultant",
      content:
        "As a solo entrepreneur, SoloBoss AI is like having an entire team. The productivity boost is incredible - I've scaled my business 3x in 6 months.",
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: "Launchpad",
      price: "$29",
      period: "per month",
      description: "Perfect for solo entrepreneurs starting their journey",
      features: [
        "4 AI Squad Members",
        "Basic Task Automation",
        "Email Support",
        "Mobile App Access",
        "Basic Analytics",
      ],
      popular: false,
    },
    {
      name: "Accelerator",
      price: "$79",
      period: "per month",
      description: "Ideal for growing businesses and teams",
      features: [
        "8 AI Squad Members",
        "Advanced Automation",
        "Voice Chat Integration",
        "Priority Support",
        "Advanced Analytics",
        "Team Collaboration",
        "Custom Integrations",
      ],
      popular: true,
    },
    {
      name: "Dominator",
      price: "$199",
      period: "per month",
      description: "For enterprises and power users",
      features: [
        "Unlimited AI Squad Members",
        "Enterprise Automation",
        "White-label Options",
        "24/7 Phone Support",
        "Custom AI Training",
        "API Access",
        "Dedicated Account Manager",
      ],
      popular: false,
    },
  ]

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Banner */}
      <div className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <img
              src="/images/soloboss-banner.png"
              alt="SoloBoss AI Platform Banner"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/soloboss-logo.png" alt="SoloBoss AI" className="h-10 w-auto" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SoloBoss AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </a>
              <ThemeToggle />
              <ScheduleDemoModal />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
                  Testimonials
                </a>
                <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">
                  Contact
                </a>
                <ScheduleDemoModal />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Business Management
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent leading-tight">
              Your AI Squad
              <br />
              Your Empire
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Meet your 8-member AI squad that works 24/7 to optimize your business operations, boost productivity, and
              scale your empire to new heights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <ScheduleDemoModal />
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Voice Chat
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">500%</div>
                <div className="text-muted-foreground">Avg. Productivity Boost</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-muted-foreground">AI Squad Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Dominate
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI squad combines cutting-edge technology with intuitive design to give you the ultimate business
              management experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-purple-600">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Users className="w-4 h-4 mr-2" />
              Meet Your Squad
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your 8-Member
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                AI Dream Team
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Each AI agent specializes in different aspects of your business, working together seamlessly to maximize
              your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Roxy",
                role: "Operations Manager",
                specialty: "Task Management & Scheduling",
                image: "/images/agents/roxy.png",
              },
              {
                name: "Blaze",
                role: "Business Strategist",
                specialty: "Growth & Scaling",
                image: "/images/agents/blaze.png",
              },
              {
                name: "Echo",
                role: "Content Creator",
                specialty: "Marketing & Social Media",
                image: "/images/agents/echo.png",
              },
              {
                name: "Lumi",
                role: "Legal Advisor",
                specialty: "Compliance & Contracts",
                image: "/images/agents/lumi.png",
              },
              {
                name: "Vex",
                role: "Tech Architect",
                specialty: "Systems & Automation",
                image: "/images/agents/vex.png",
              },
              {
                name: "Lexi",
                role: "Data Analyst",
                specialty: "Analytics & Insights",
                image: "/images/agents/lexi.png",
              },
              {
                name: "Nova",
                role: "Creative Director",
                specialty: "Design & Branding",
                image: "/images/agents/nova.png",
              },
              {
                name: "Glitch",
                role: "Quality Assurance",
                specialty: "Testing & Optimization",
                image: "/images/agents/glitch.png",
              },
            ].map((agent, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={agent.image || "/placeholder.svg"}
                    alt={agent.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <p className="text-sm opacity-90">{agent.role}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{agent.specialty}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Heart className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Entrepreneurs
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how SoloBoss AI is transforming businesses and empowering entrepreneurs worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Crown className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Power Level
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises. Just pure AI-powered business domination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? "border-2 border-purple-500 shadow-lg scale-105" : "border-2 hover:border-purple-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}

                  <Button
                    className={`w-full mt-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of entrepreneurs who are already dominating their markets with AI.
            </p>

            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                required
              />
              <Button type="submit" variant="secondary" className="bg-white text-purple-600 hover:bg-white/90">
                <Mail className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Headphones className="w-4 h-4 mr-2" />
              Get in Touch
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Dominate?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? Want a demo? Our team is here to help you build your empire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>We'll get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="I'm interested in SoloBoss AI" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Tell us about your business and how we can help..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Us</h3>
                      <p className="text-muted-foreground">hello@soloboss.ai</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Call Us</h3>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Visit Us</h3>
                      <p className="text-muted-foreground">San Francisco, CA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-colors bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Schedule a Demo</h3>
                  <p className="text-muted-foreground mb-4">See SoloBoss AI in action with a personalized demo.</p>
                  <ScheduleDemoModal />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/images/soloboss-logo.png" alt="SoloBoss AI" className="h-8 w-auto" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </div>
              <p className="text-muted-foreground">
                Empowering entrepreneurs with AI-driven business management solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Features
                </a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Pricing
                </a>
                <a href="/team" className="text-muted-foreground hover:text-foreground transition-colors block">
                  AI Squad
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors block">
                  About
                </a>
                <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Blog
                </a>
                <a href="/careers" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Careers
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="/help" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Help Center
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Contact
                </a>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors block">
                  Privacy
                </a>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 SoloBoss AI. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Built with ❤️ for entrepreneurs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
