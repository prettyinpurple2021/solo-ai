"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Cookie, Shield, FileText, Settings, Eye, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function CookiePolicyPage() {
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
              <Cookie className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            🍪 Cookie Policy
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cookie Policy
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We believe in transparency about how we collect and use data. Here's everything you need to know about our cookie usage.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Last Updated: January 2025</span>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                SoloBoss AI Cookie Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">

                {/* What Are Cookies */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                    What Are Cookies?
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how our site is used.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-600 text-sm">
                      <strong>Think of cookies like a helpful assistant:</strong> They remember your preferences (like staying logged in) so you don't have to repeat yourself every time you visit.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Types of Cookies */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                    Types of Cookies We Use
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Essential Cookies (Required)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        These cookies are necessary for the website to function and cannot be switched off in our systems.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Authentication cookies (keeping you logged in)</li>
                        <li>Security cookies (protecting against attacks)</li>
                        <li>Session cookies (maintaining your session)</li>
                        <li>Preference cookies (remembering your settings)</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        Analytics Cookies (Optional)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        These cookies help us understand how you use our website so we can improve it.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Page views and user interactions</li>
                        <li>Feature usage statistics</li>
                        <li>Performance monitoring</li>
                        <li>Error tracking for bug fixes</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600" />
                        Functional Cookies (Optional)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        These cookies enable enhanced functionality and personalization.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>AI agent preferences</li>
                        <li>Dashboard customizations</li>
                        <li>Language and region settings</li>
                        <li>Theme and layout preferences</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Database className="w-5 h-5 text-yellow-600" />
                        Marketing Cookies (Optional)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        These cookies track your activity to show you relevant ads and measure campaign effectiveness.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Ad personalization</li>
                        <li>Social media integration</li>
                        <li>Marketing campaign tracking</li>
                        <li>Conversion measurement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Third Party Cookies */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                    Third-Party Cookies
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We use some third-party services that may set their own cookies. We carefully select these partners and ensure they meet our privacy standards.
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Google Analytics</h3>
                      <p className="text-gray-600 text-sm">
                        Helps us understand website usage and improve user experience. 
                        <a href="https://policies.google.com/privacy" className="text-purple-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                          Google Privacy Policy
                        </a>
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Stripe</h3>
                      <p className="text-gray-600 text-sm">
                        Secure payment processing for subscriptions. 
                        <a href="https://stripe.com/privacy" className="text-purple-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                          Stripe Privacy Policy
                        </a>
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Supabase</h3>
                      <p className="text-gray-600 text-sm">
                        Backend infrastructure for authentication and data storage. 
                        <a href="https://supabase.com/privacy" className="text-purple-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                          Supabase Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Managing Cookies */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">4</span>
                    Managing Your Cookie Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Browser Settings</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        You can control cookies through your browser settings. Here's how:
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                        <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                        <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                        <li><strong>Edge:</strong> Settings → Site permissions → Cookies and stored data</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Our Cookie Preferences</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        You can manage your cookie preferences directly on our website:
                      </p>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Manage Cookie Preferences
                      </Button>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold text-gray-800 mb-2">⚠️ Important Note</h3>
                      <p className="text-gray-600 text-sm">
                        Disabling certain cookies may affect the functionality of SoloBoss AI. Essential cookies cannot be disabled as they're required for the service to work properly.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Data Retention */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">5</span>
                    How Long We Keep Cookies
                  </h2>
                  
                  <div className="grid gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Session Cookies</h3>
                      <p className="text-gray-600 text-sm">
                        Deleted when you close your browser
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Persistent Cookies</h3>
                      <p className="text-gray-600 text-sm">
                        Stored for up to 2 years, depending on the cookie type and purpose
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
                      <p className="text-gray-600 text-sm">
                        Typically stored for 12-24 months to track long-term trends
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Contact */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">6</span>
                    Questions About Cookies?
                  </h2>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      If you have any questions about our use of cookies or this Cookie Policy, please don't hesitate to contact us:
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <p className="text-purple-600 font-semibold">psychedelic.creator@enchantednightmare.com</p>
                    </div>
                  </div>
                </div>

                {/* Updates */}
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                  <h3 className="font-semibold text-gray-800 mb-2">Policy Updates</h3>
                  <p className="text-gray-600 text-sm">
                    We may update this Cookie Policy from time to time. We'll notify you of any significant changes by posting the updated policy on this page and updating the "Last Updated" date at the top.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Related Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/privacy">
              <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Privacy Policy</h4>
                  <p className="text-gray-600 text-sm">Learn how we collect, use, and protect your personal data</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/terms">
              <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Terms of Service</h4>
                  <p className="text-gray-600 text-sm">Read the terms that govern your use of SoloBoss AI</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Now that you understand our cookie usage, start your journey with SoloBoss AI and experience the power of AI-driven productivity.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                Start Building Empire
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 