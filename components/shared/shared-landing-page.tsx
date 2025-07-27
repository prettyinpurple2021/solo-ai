"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Play, Rocket } from "lucide-react"
import { FEATURES, AI_SQUAD, TESTIMONIALS, PRICING_PLANS, STATS } from "@/lib/landing-data"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: "gradient" | "css-classes"
}

export function SharedLandingPage({
  showAuthModal = false,
  onShowAuthModal,
  styleVariant = "gradient",
}: SharedLandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={40} height={40} className="w-10 h-10" />
              <span className="text-2xl font-bold gradient-text-primary">SoloBoss AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/features" className="text-foreground/70 hover:text-foreground font-medium transition-colors">
                Features
              </a>
              <a
                href="#testimonials"
                className="text-foreground/70 hover:text-foreground font-medium transition-colors"
              >
                Success Stories
              </a>
              <a href="/pricing" className="text-foreground/70 hover:text-foreground font-medium transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                onClick={onShowAuthModal}
                className="gradient-primary text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 text-lg px-6 py-2 gradient-secondary text-foreground border-0 rounded-full">
            ✨ The Future of Solo Entrepreneurship
          </Badge>
          <h1 className={`text-5xl md:text-7xl font-bold mb-8 ${isVisible ? "animate-in fade-in duration-1000" : ""}`}>
            <span className="gradient-text-primary block">Build Your Empire</span>
            <span className="gradient-text-primary block">With AI Squad Power</span>
          </h1>

          {/* Decorative Icons */}
          <div className="flex justify-center items-center space-x-4 mb-8 text-4xl">
            <span>👑</span>
            <span>⭐</span>
            <span>💪</span>
          </div>

          <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl mx-auto">
            Stop being a solo struggle-preneur. Command your personal army of 8 specialized AI agents and transform into
            the <span className="gradient-text-accent font-bold">legendary boss</span> you were meant to be.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className="gradient-primary text-white font-semibold text-lg px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Start Your Empire Free</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-border text-foreground hover:bg-accent text-lg px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 bg-transparent"
            >
              <Play className="w-5 h-5" />
              <span>Watch Boss Demo</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STATS.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold gradient-text-primary mb-2">{stat.number}</div>
                <div className="text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">
              Why Boss Babes Choose SoloBoss AI
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Because average is not in your vocabulary. These features will make you unstoppable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 bg-card"
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Meet Your AI Squad</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Each agent has their own personality, expertise, and boss-level attitude. They never sleep, never
              complain, and always deliver.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_SQUAD.map((agent, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 text-center bg-card"
              >
                <CardHeader>
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-blue-900 dark:to-green-900 flex items-center justify-center">
                    <Image
                      src={agent.image || "/placeholder.svg"}
                      alt={agent.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{agent.name}</h3>
                  <p className="text-sm font-medium gradient-text-accent mb-3">{agent.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Boss Success Stories</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Real boss babes, real results. These queens are building empires with their AI squads.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 bg-card"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{testimonial.name}</div>
                      <div className="gradient-text-accent text-sm mb-2">{testimonial.role}</div>
                      <p className="text-foreground/70 italic">&quot;{testimonial.content}&quot;</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-6">Choose Your Boss Level</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Every empire needs the right foundation. Choose the plan that matches your ambition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <Card
                key={index}
                className={`border-2 border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 relative bg-card ${plan.popular ? "ring-4 ring-primary/30 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-secondary text-foreground border-0 text-sm px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold gradient-text-primary">{plan.price}</span>
                    <span className="text-foreground/70">{plan.period}</span>
                  </div>
                  <CardDescription className="text-foreground/70">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onShowAuthModal}
                    className={`w-full gradient-primary text-white font-bold py-3 hover:opacity-90 transition-opacity ${plan.popular ? "animate-pulse" : ""}`}
                  >
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of boss babes who&apos;ve transformed their businesses with AI squad power. Your empire
            awaits.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 transform hover:scale-105 transition-all duration-200"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/images/soloboss-logo.png" alt="SoloBoss AI" width={32} height={32} className="w-8 h-8" />
                <span className="text-2xl font-bold gradient-text-primary">SoloBoss AI</span>
              </div>
              <p className="text-foreground/70 mb-4 max-w-md">
                Empowering ambitious women to build legendary business empires with the power of AI. Your squad is
                waiting.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-foreground/70">
                <li>
                  <a href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/team" className="hover:text-foreground transition-colors">
                    AI Squad
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-foreground">Community</h3>
              <ul className="space-y-2 text-foreground/70">
                <li>
                  <a href="#testimonials" className="hover:text-foreground transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Boss Academy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-foreground/70">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Built by boss babes, for boss babes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
