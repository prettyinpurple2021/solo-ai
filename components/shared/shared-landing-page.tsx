"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Crown, Rocket, Play, Star, Users, Sparkles } from "lucide-react"
import { aiAgents, features, testimonials, stats } from "@/lib/landing-data"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: "gradient" | "css-classes"
}

export function SharedLandingPage({
  showAuthModal,
  onShowAuthModal,
  styleVariant = "gradient",
}: SharedLandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={40} height={40} className="w-10 h-10" />
              <span className="text-xl font-bold gradient-text-primary">SoloBoss AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/team" className="text-foreground/80 hover:text-foreground transition-colors">
                AI Squad
              </Link>
              <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <ThemeToggle />
              <Button
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
                onClick={onShowAuthModal}
              >
                Start Building Empire
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground/80 hover:text-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <Link href="/features" className="text-foreground/80 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/team" className="text-foreground/80 hover:text-foreground transition-colors">
                  AI Squad
                </Link>
                <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Button
                  className="gradient-primary text-white hover:opacity-90 transition-opacity w-full"
                  onClick={onShowAuthModal}
                >
                  Start Building Empire
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-8 px-4 py-2 bg-gradient-primary text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            The Future of Solo Entrepreneurship
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text-primary">Build Your Empire</span>
            <br />
            <span className="gradient-text-primary">With AI Squad Power</span>
          </h1>

          {/* Decorative Icons */}
          <div className="flex justify-center items-center space-x-4 mb-8 text-4xl">
            <span className="animate-bounce">👑</span>
            <span className="animate-bounce delay-100">⭐</span>
            <span className="animate-bounce delay-200">💪</span>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Stop being a solo struggle-preneur. Command your personal army of 8 specialized AI agents and transform into
            the <span className="gradient-text-primary font-semibold">legendary boss</span> you were meant to be.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 transition-opacity px-8 py-4 text-lg"
              onClick={onShowAuthModal}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Empire Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 hover:bg-muted bg-transparent">
              <Play className="w-5 h-5 mr-2" />
              Watch Boss Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-4">Meet Your AI Squad</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              8 specialized AI agents, each with unique personalities and expertise, working together to build your
              empire.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAgents.map((agent) => (
              <Card
                key={agent.id}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${agent.color} p-1`}>
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <Image
                        src={agent.avatar || "/placeholder.svg"}
                        alt={agent.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{agent.name}</h3>
                  <p className="text-sm font-medium text-primary mb-2">{agent.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{agent.personality.split(".")[0]}.</p>
                  {agent.isVoiceEnabled && (
                    <Badge className="mt-3 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      🎤 Voice Ready
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="gradient-primary text-white hover:opacity-90 transition-opacity" asChild>
              <Link href="/team">
                <Users className="w-5 h-5 mr-2" />
                Meet Your Full Squad
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-4">Boss-Level Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to command your AI squad and dominate your market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-4">
              Boss Babes Love Their AI Squad
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real results from real entrepreneurs who transformed their businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-6">Ready to Build Your Empire?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of boss babes who've transformed their businesses with AI squad power.
          </p>
          <Button
            size="lg"
            className="gradient-primary text-white hover:opacity-90 transition-opacity px-12 py-4 text-lg"
            onClick={onShowAuthModal}
          >
            <Crown className="w-5 h-5 mr-2" />
            Start Your Empire Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-bold gradient-text-primary">SoloBoss AI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 SoloBoss AI. All rights reserved. Built for boss babes, by boss babes.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
