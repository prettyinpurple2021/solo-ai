"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, Play } from "lucide-react"
import { FEATURES, AI_SQUAD, TESTIMONIALS, PRICING_PLANS, STATS } from "@/lib/landing-data"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: "gradient" | "css-classes"
}

export function SharedLandingPage({ 
  showAuthModal = false, 
  onShowAuthModal, 
  styleVariant = "gradient" 
}: SharedLandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Style helpers based on variant
  const getButtonClass = () => {
    return styleVariant === "gradient"
      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold"
      : "punk-button text-white font-semibold"
  }

  const getBadgeClass = () => {
    return styleVariant === "gradient"
      ? "mb-6 text-lg px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
      : "girlboss-badge mb-6 text-lg px-6 py-2"
  }

  const getHeadingClass = (text: string) => {
    return styleVariant === "gradient"
      ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
      : "boss-heading"
  }

  const getCardClass = () => {
    return styleVariant === "gradient"
      ? "border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:scale-105"
      : "boss-card glitter-effect bounce-on-hover"
  }

  const getSectionGradientClass = () => {
    return styleVariant === "gradient"
      ? "bg-gradient-to-r from-purple-600 to-pink-600"
      : "soloboss-gradient"
  }

  const getTextClass = () => {
    return styleVariant === "gradient"
      ? "text-gray-800"
      : "empowering-text"
  }

  const getStatsClass = () => {
    return styleVariant === "gradient"
      ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
      : "soloboss-text-gradient"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${styleVariant === 'gradient' ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'boss-heading'}`}>
                SoloBoss AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={onShowAuthModal}
                className={getButtonClass()}
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
          <Badge className={getBadgeClass()}>
            ✨ The Ultimate AI Empire Builder ✨
          </Badge>
          <h1 className={`text-5xl md:text-7xl font-bold mb-8 ${isVisible ? "animate-in fade-in duration-1000" : ""}`}>
            <span className={`${getHeadingClass("")} block`}>Build Your Empire</span>
            <span className={`${getHeadingClass("")} block`}>With AI Squad Power</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop being a one-person army. Command your personal squad of 8 AI agents and transform
            into the <span className={`${styleVariant === 'gradient' ? 'text-purple-600' : 'empowering-text'} font-bold`}>legendary boss</span> you were meant to be.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className={`${getButtonClass()} text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200`}
            >
              Start Your Empire Today
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STATS.map((stat, index) => (
              <div key={index}>
                <div className={`text-4xl font-bold ${getStatsClass()} mb-2`}>{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${getHeadingClass("")} mb-6`}>
              Why Boss Babes Choose SoloBoss AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Because average is not in your vocabulary. These features will make you unstoppable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card
                key={index}
                className={getCardClass()}
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 ${styleVariant === 'gradient' ? 'shadow-lg' : 'punk-shadow'}`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className={`text-xl font-bold ${getTextClass()}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Squad Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${getHeadingClass("")} mb-6`}>
              Meet Your AI Squad
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each agent has their own personality, expertise, and boss-level attitude. They never sleep, never complain, and always deliver.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_SQUAD.map((agent, index) => (
              <Card key={index} className={`${getCardClass()} text-center`}>
                <CardHeader>
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center mx-auto mb-4 ${styleVariant === 'gradient' ? 'shadow-lg' : 'punk-shadow'} text-3xl`}
                  >
                    {agent.mood}
                  </div>
                  <h3 className={`text-lg font-bold ${getTextClass()} mb-2`}>{agent.name}</h3>
                  <p className="text-sm font-medium text-purple-600 mb-3">{agent.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${getHeadingClass("")} mb-6`}>
              Boss Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real boss babes, real results. These queens are building empires with their AI squads.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className={`${getCardClass()}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className={`w-12 h-12 rounded-full object-cover ${styleVariant === 'gradient' ? 'shadow-md' : 'punk-shadow'}`}
                    />
                    <div className="flex-1">
                      <div className={`font-bold ${getTextClass()}`}>{testimonial.name}</div>
                      <div className="text-purple-600 text-sm mb-2">{testimonial.role}</div>
                      <p className="text-gray-600 italic">&quot;{testimonial.content}&quot;</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${getHeadingClass("")} mb-6`}>
              Choose Your Boss Level
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every empire needs the right foundation. Choose the plan that matches your ambition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <Card
                key={index}
                className={`${getCardClass()} relative ${plan.popular ? "ring-4 ring-purple-300 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className={styleVariant === 'gradient' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-sm px-4 py-1' : 'girlboss-badge text-sm px-4 py-1'}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl font-bold ${getTextClass()} mb-2`}>{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className={`text-5xl font-bold ${getStatsClass()}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onShowAuthModal}
                    className={`w-full ${getButtonClass()} font-bold py-3 ${plan.popular ? "animate-pulse" : ""}`}
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
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${getSectionGradientClass()} text-white`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of boss babes who&apos;ve transformed their businesses with AI squad power.
            Your empire awaits.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              onClick={onShowAuthModal}
              className={`bg-white ${styleVariant === 'gradient' ? 'text-purple-600 hover:bg-gray-100' : 'text-purple-600 hover:bg-gray-100'} font-bold px-8 transform hover:scale-105 transition-all duration-200`}
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering ambitious women to build legendary business empires with the power of AI.
                Your squad is waiting.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
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
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Boss Academy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Built by boss babes, for boss babes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}