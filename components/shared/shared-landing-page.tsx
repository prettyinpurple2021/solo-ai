"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, Play, Star, Users, Mic } from "lucide-react"
import { aiAgents, features, testimonials, stats } from "@/lib/landing-data"
import { ThemeToggle } from "@/components/theme-toggle"

export function SharedLandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={40} height={40} className="rounded-lg" />
              <span className="text-2xl font-bold gradient-text-primary">SoloBoss AI</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#success-stories" className="text-foreground/80 hover:text-foreground transition-colors">
                Success Stories
              </Link>
              <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button className="gradient-primary text-white hover:opacity-90 transition-opacity">
                <Rocket className="w-4 h-4 mr-2" />
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-8 px-6 py-2 text-sm bg-primary/10 text-primary border-primary/20">
            ✨ The Future of Solo Entrepreneurship
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text-primary">Build Your Empire</span>
            <br />
            <span className="gradient-text-secondary">With AI Squad Power</span>
          </h1>

          <div className="flex justify-center items-center space-x-4 mb-8 text-6xl">
            <span className="animate-float">👑</span>
            <span className="animate-float" style={{ animationDelay: "0.5s" }}>
              ⭐
            </span>
            <span className="animate-float" style={{ animationDelay: "1s" }}>
              💪
            </span>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Stop being a solo struggle-preneur. Command your personal army of 8 specialized AI agents and transform into
            the <span className="gradient-text-primary font-semibold">legendary boss</span> you were meant to be.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 transition-opacity px-8 py-4 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Empire Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 bg-transparent">
              <Play className="w-5 h-5 mr-2" />
              Watch Boss Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Meet Your AI Squad</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              8 specialized AI agents, each with unique personalities and expertise, ready to transform your business
              into an unstoppable empire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAgents.map((agent) => (
              <Card
                key={agent.id}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full gradient-primary p-1">
                      <Image
                        src={agent.image || "/placeholder.svg"}
                        alt={agent.name}
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    {agent.voiceEnabled && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold gradient-text-primary mb-2">{agent.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{agent.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>

                  <div className="flex flex-wrap gap-1 justify-center">
                    {agent.specialties.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="gradient-primary text-white hover:opacity-90">
              <Link href="/team">
                <Users className="w-5 h-5 mr-2" />
                Meet Your Full Squad
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Empire-Building Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to command your AI squad and build the business empire of your dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold gradient-text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="success-stories" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Boss Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real entrepreneurs who transformed their struggles into empires with their AI squad.
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
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold gradient-text-primary">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join thousands of solo entrepreneurs who've transformed their businesses with the power of AI. Your squad is
            waiting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 transition-opacity px-8 py-4 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Empire Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 bg-transparent">
              <Play className="w-5 h-5 mr-2" />
              Watch Boss Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold gradient-text-primary">SoloBoss AI</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Built for legendary entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
