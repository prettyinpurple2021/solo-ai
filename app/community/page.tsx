"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Calendar, Users, Bell, Mail, MessageCircle, Network, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CommunityComingSoonPage() {
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
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            👑 Boss Community Coming Soon
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Boss Community
            </span>
            <br />
            <span className="text-gray-600 text-3xl md:text-4xl">Social Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The ultimate social media platform dedicated to startups and small businesses. 
            Connect, collaborate, and conquer together! Launching July 1st, 2026! 🚀
          </p>
          
          {/* Launch Date */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-6 h-6" />
              <span className="text-lg font-semibold">Official Launch Date</span>
            </div>
            <div className="text-3xl font-bold">July 1, 2026</div>
          </div>
        </div>
      </section>

      {/* What We're Building */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What We're Building</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A revolutionary social platform designed specifically for entrepreneurs, startups, and small businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-purple-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Networking</h3>
                <p className="text-gray-600">
                  AI-powered matching to connect you with the right entrepreneurs, potential collaborators, and business partners.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Business-First Content</h3>
                <p className="text-gray-600">
                  Share wins, challenges, and insights in a space designed for business content - no algorithm promoting nonsense.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Collaboration Tools</h3>
                <p className="text-gray-600">
                  Built-in tools for project collaboration, partnership management, and community-driven business building.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why We're Building It */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Why We're Building This</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Current social media platforms are filled with distractions and irrelevant content
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Entrepreneurs waste time scrolling instead of connecting with other builders
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    No platform exists specifically for business collaboration and networking
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <p className="text-gray-600">
                    Algorithms prioritize engagement over meaningful business connections
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Solution</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    A business-focused social platform built by entrepreneurs, for entrepreneurs
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    AI-powered networking that connects you with relevant business partners
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Content algorithms designed to promote valuable business insights
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Integrated collaboration tools for real business building
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Feature Preview</h2>
            <p className="text-xl text-gray-600">
              Here's what we're building for the ultimate entrepreneur social experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Smart Entrepreneur Matching
              </h3>
              <p className="text-gray-600 text-sm">
                AI analyzes your business goals, skills, and interests to suggest relevant connections and potential collaborators.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Business Update Feed
              </h3>
              <p className="text-gray-600 text-sm">
                Share and discover business milestones, challenges, and insights in a distraction-free, business-focused environment.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-600" />
                Collaboration Spaces
              </h3>
              <p className="text-gray-600 text-sm">
                Create private or public spaces for project collaboration, mastermind groups, and business partnerships.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Startup Showcase
              </h3>
              <p className="text-gray-600 text-sm">
                Dedicated spaces to showcase your startup, get feedback, find co-founders, and connect with potential investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Early Access */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Get Early Access</h2>
          <p className="text-xl text-gray-600 mb-8">
            Be among the first entrepreneurs to join Boss Community when we launch in 2026!
          </p>
          
          <Card className="max-w-2xl mx-auto shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Bell className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">Join the Waitlist</h3>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <p className="text-gray-600 mb-4">
                  Subscribe to our newsletter to get exclusive updates about Boss Community development and be first in line for early access!
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                  <Mail className="w-5 h-5" />
                  <span>Newsletter subscribers get first access! 👇</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Development Timeline</h2>
            <p className="text-xl text-gray-600">Here's what we're working on and when to expect it</p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  2025
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm flex-grow border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Platform Development</h3>
                <p className="text-gray-600 leading-relaxed">
                  Core platform development, user experience design, AI networking algorithms, and infrastructure setup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  Q1 2026
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm flex-grow border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Beta Testing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Closed beta with select entrepreneurs and startup founders to test features and gather feedback.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  July 2026
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm flex-grow border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Public Launch</h3>
                <p className="text-gray-600 leading-relaxed">
                  Official launch of Boss Community to all entrepreneurs, startups, and small business owners worldwide!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Together?</h2>
          <p className="text-xl mb-8 opacity-90">
            While we build Boss Community, start connecting with entrepreneurs today through SoloBoss AI!
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                Start Your Empire
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                Get Updates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 