"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Crown, Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            💬 Let's Connect
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contact the Boss
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Ready to rule your empire? Have questions? Need support? The boss is here to help! 
            Reach out and let's build something amazing together. 🚀
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-purple-600" />
                    Send a Message
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Got a question, suggestion, or just want to say hi? Drop us a line!
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent! 🎉</h3>
                      <p className="text-gray-600">
                        Thanks for reaching out, boss! We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <Input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Enter your boss name"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="your.email@empire.com"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="What's this about?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Question</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                            <SelectItem value="press">Press & Media</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder="Brief subject line"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message *
                        </label>
                        <Textarea
                          required
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Tell us how we can help you build your empire! Be as detailed as you'd like..."
                          className="w-full min-h-[120px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 px-6 rounded-full"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending Message...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message 🚀
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    Direct Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Email the Boss</p>
                        <a 
                          href="mailto:psychedelic.creator@enchantednightmare.com"
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          psychedelic.creator@enchantednightmare.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Home Office</p>
                        <p className="text-gray-600">Albany, GA, United States</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Response Time</p>
                        <p className="text-gray-600">Usually within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Quick Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link 
                      href="/help" 
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">Help Center</p>
                          <p className="text-sm text-gray-600">Find answers to common questions</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                      </div>
                    </Link>

                    <Link 
                      href="/docs" 
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">API Documentation</p>
                          <p className="text-sm text-gray-600">Technical docs and guides</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                      </div>
                    </Link>

                    <Link 
                      href="/status" 
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">System Status</p>
                          <p className="text-sm text-gray-600">Check service availability</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Join the Boss Community! 👑</h3>
                  <p className="mb-4 opacity-90">
                    Connect with other ambitious entrepreneurs building their empires. Share wins, get support, and level up together!
                  </p>
                  <Link href="/community">
                    <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold">
                      Join Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Support Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Need Urgent Help?</h3>
          </div>
          <p className="text-yellow-700 max-w-2xl mx-auto">
            For critical issues affecting your business operations, please mark your message as "Technical Support" 
            and we'll prioritize your request. We typically respond to urgent matters within 4-6 hours during business days.
          </p>
        </div>
      </section>
    </div>
  )
} 