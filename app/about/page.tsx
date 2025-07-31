"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Rocket, Heart, Flame, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  const coreValues = [
    {
      icon: Crown,
      title: "Empowerment",
      description: "Every solo entrepreneur deserves to feel like the boss they are. We build tools that amplify your natural badassery."
    },
    {
      icon: Rocket,
      title: "Innovation",
      description: "We're not here to follow trends - we're here to set them. Cutting-edge AI meets punk rock attitude."
    },
    {
      icon: Heart,
      title: "Authenticity", 
      description: "No corporate BS. Just real talk from real entrepreneurs who've been where you are."
    },
    {
      icon: Flame,
      title: "Rebellion",
      description: "Against burnout culture. Against 'hustle till you die.' We're rewriting the rules of entrepreneurship."
    }
  ]

  const timeline = [
    {
      year: "2024",
      title: "The Spark",
      description: "Frustrated with generic productivity tools that didn't understand the solo entrepreneur struggle, our founder decided to build something different."
    },
    {
      year: "2024",
      title: "MVP Launch",
      description: "First version launched with basic AI agents. The response was immediate - solo entrepreneurs finally had tools built FOR them."
    },
    {
      year: "2025",
      title: "Community Growth", 
      description: "Thousands of boss babes joined the platform. Features expanded based on real user feedback from real entrepreneurs."
    },
    {
      year: "2025",
      title: "The Future",
      description: "Building the world's most comprehensive AI-powered ecosystem for solo entrepreneurs. This is just the beginning."
    }
  ]

  const stats = [
    { number: "10K+", label: "Boss Entrepreneurs" },
    { number: "8", label: "AI Squad Members" },
    { number: "500K+", label: "Tasks Completed" },
    { number: "95%", label: "User Satisfaction" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <div className="text-2xl">👑</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-full">
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            👑 Our Story
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Redefining Solo
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Entrepreneurship
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're not just another productivity platform. We're a rebellion against burnout culture, 
            a movement for authentic entrepreneurship, and your AI-powered squad for building an empire 
            without losing yourself.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
            <p className="text-2xl font-semibold leading-relaxed">
              "To empower solo entrepreneurs with AI-driven tools that amplify their natural brilliance, 
              eliminate busywork, and create sustainable success without sacrificing their sanity or soul."
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">The Boss Movement</h2>
            <p className="text-xl text-gray-600">Numbers that tell our story</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What We Stand For</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These aren't just words on a wall - they're the values that drive every feature we build 
              and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{value.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">From frustration to revolution</p>
          </div>
          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {event.year}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">The Problem We're Solving</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Solo entrepreneurs burning out trying to wear every hat in their business
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Generic productivity tools that don't understand the entrepreneurial mindset
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    The pressure to "hustle harder" instead of working smarter
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Isolation and lack of support in the entrepreneurial journey
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Solution</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    AI agents that handle the busywork so you can focus on your genius zone
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Purpose-built tools designed specifically for solo entrepreneurs
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Sustainable productivity that prevents burnout and promotes wellness
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    A supportive community of like-minded boss entrepreneurs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet the Founder</h2>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">The Boss Behind SoloBoss</h3>
                <p className="text-purple-600 font-semibold">Founder & Chief Boss Officer</p>
              </div>
              <blockquote className="text-xl text-gray-600 leading-relaxed text-center italic">
                "I was that solo entrepreneur juggling 15 different tools, working 80-hour weeks, 
                and still feeling like I was barely keeping my head above water. I knew there had to be a better way. 
                SoloBoss AI is the solution I wish I'd had when I started my entrepreneurial journey - 
                and it's the solution thousands of other solo entrepreneurs needed too."
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join the Revolution?</h2>
          <p className="text-xl mb-8 opacity-90">
            Stop hustling harder. Start building smarter. Your empire is waiting, and your AI squad is ready to help you rule it.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                Start Building Your Empire
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 