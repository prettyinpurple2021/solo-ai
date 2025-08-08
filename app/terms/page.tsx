"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Crown, Scale, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// AuthModal removed - using Clerk authentication instead

export default function TermsOfServicePage() {
  const router = useRouter()
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
              <Button 
                onClick={() => router.push('/sign-up')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-full"
              >
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
              <Scale className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            ⚖️ Legal Framework
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Building empires requires clear foundations. Here are the terms that govern your journey with SoloBoss AI.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Effective Date: July 30th, 2025</span>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                SoloBoss AI Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {/* Section 1 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                    Introduction and Acceptance of Terms
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Welcome to SoloBoss AI! SoloBoss AI is an innovative web application designed to be an AI-driven productivity platform for solo entrepreneurs, freelancers, and small business owners. Our purpose is to provide a highly valuable, feature-rich, and production-ready platform that simulates a "virtual team experience," enabling independent professionals to streamline operations, enhance productivity, and scale their businesses without the need for traditional hiring.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By accessing or using the SoloBoss AI web application and its services (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
                  </p>
                </div>

                <Separator className="my-8" />

                {/* Section 2 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                    Your SoloBoss AI Account
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    To access most features of SoloBoss AI, you must register for an account.
                  </p>
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Account Creation:</h3>
                    <p className="text-gray-600 text-sm">
                      The system allows new users to register for a SoloBoss AI account using Supabase Auth, which handles secure password hashing and creates a user record.
                    </p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Account Information:</h3>
                    <p className="text-gray-600 text-sm">
                      You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Account Security:</h3>
                    <p className="text-gray-600 text-sm">
                      You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. The system uses Supabase Auth to authenticate credentials and establish a secure user session. You can view and edit your basic profile information, which is retrieved from the profiles table in the Supabase PostgreSQL database.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 3 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                    Subscription Plans and Payments
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    SoloBoss AI offers a tiered subscription model to cater to different user needs.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Product Tiers:</h3>
                  
                  <div className="grid gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-gray-800 mb-2">Launch (Free):</h4>
                      <p className="text-gray-600 text-sm">
                        This tier provides a basic entry point with access to 2 AI agents and 5 daily conversations. It is available at no cost monthly or yearly.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h4 className="font-semibold text-gray-800 mb-2">Accelerator (Pro):</h4>
                      <p className="text-gray-600 text-sm">
                        This tier offers enhanced capabilities, including access to 5 AI Agents, advanced automation workflows, and priority support. It is priced at $19 per month or $190 per year.
                      </p>
                    </div>
                    
                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                      <h4 className="font-semibold text-gray-800 mb-2">Dominator (Empire):</h4>
                      <p className="text-gray-600 text-sm">
                        This tier provides the most comprehensive features for advanced users, with unrestricted access to all current and future premium functionalities. Pricing for this tier is $29 per month or $290 per year.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Subscription Plans:</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      The system displays subscription tiers for marketing purposes: Launch ($0), Accelerator ($19/$190), and Dominator ($29/$290) plans with different feature sets.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Payment processing has been removed from this platform. The pricing page serves as a marketing tool to display available service tiers and their respective features.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Feature Access:</h3>
                    <p className="text-gray-600 text-sm">
                      The system displays features available at different subscription tiers for informational purposes. All users currently have access to the Launch tier features. Feature gating serves as a demonstration of potential premium functionalities.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 4 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">4</span>
                    Intellectual Property Rights
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    All rights reserved. This project is proprietary software developed for SoloBoss AI Platform.
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4 border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-gray-800 mb-2">Ownership:</h3>
                    <p className="text-gray-600 text-sm">
                      SoloBoss AI and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof), are owned by SoloBoss AI, its licensors, or other providers of such material. This includes the distinct brand identity, brand name "SoloBoss", tagline "Be the Boss. Build Solo. Rule Your Empire.", brand voice (e.g., Confident, Empowering, Rebellious with purpose), brand personality (e.g., Punk Rock meets Girlboss CEO, Energetic, creative, driven), brand aesthetic (e.g., Vibrant Purple, Teal, Hot Pink, paint splatter, shimmer/glitter overlays, cute skulls with bows), and the distinct personalities and roles of the 8 AI Agents (Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, Glitch).
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-400">
                    <h3 className="font-semibold text-gray-800 mb-2">Limited License:</h3>
                    <p className="text-gray-600 text-sm">
                      These Terms of Service grant you a limited, non-exclusive, non-transferable, revocable license to use the Service solely for your personal and business use, in accordance with these Terms.
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h3 className="font-semibold text-gray-800 mb-2">Restrictions:</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as generally permitted through your use of the Service. You must not:
                    </p>
                    <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                      <li>Modify copies of any materials from this site.</li>
                      <li>Use any illustrations, photographs, video or audio sequences, or any graphics separately from the accompanying text.</li>
                      <li>Delete or alter any copyright, trademark, or other proprietary rights notices from copies of materials from this site.</li>
                      <li>Introduce new libraries or frameworks without team approval for the underlying platform.</li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Continue with remaining sections... */}
                {/* Section 5 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">5</span>
                    User-Generated Content
                  </h2>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Your Content:</h3>
                    <p className="text-gray-600 text-sm">
                      The Service allows you to input and generate content, such as SlayList goals and tasks, Briefcase files, Brand Profiles (color palettes, font combinations), and interactions with AI agents (inputs and outputs). You retain all rights in and to your User-Generated Content.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">License to SoloBoss AI:</h3>
                    <p className="text-gray-600 text-sm">
                      By submitting, posting, or displaying User-Generated Content on or through the Service, you grant SoloBoss AI a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any and all media or distribution methods (now known or later developed) for the sole purpose of providing and improving the Service to you. This includes, for example, AI agents accessing your Brand Profile to generate on-brand content or Lexi analyzing SlayList data to provide insights.
                    </p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Responsibility for Content:</h3>
                    <p className="text-gray-600 text-sm">
                      You are solely responsible for your User-Generated Content and the consequences of submitting and publishing your content on the Service.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 6 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">6</span>
                    Use of Service
                  </h2>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Acceptable Use Policy:</h3>
                    <p className="text-gray-600 text-sm">
                      You agree to use the Service only for lawful purposes and in accordance with these Terms of Service. You are provided with AI Agents for various business needs, such as Roxy (Executive Assistant) for schedule management, Blaze (Growth & Sales Strategist) for idea validation, Echo (Marketing Maven) for content generation, Lumi (Legal & Docs Agent) for document generation, Vex (Technical Architect) for technical specifications, Lexi (Strategy & Insight Analyst) for data analysis, Nova (Product Designer) for UI/UX brainstorming, and Glitch (QA & Debug Agent) for identifying UX friction.
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg mb-4 border-l-4 border-red-400">
                    <h3 className="font-semibold text-gray-800 mb-2">Prohibited Actions:</h3>
                    <p className="text-gray-600 text-sm mb-2">You agree not to:</p>
                    <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                      <li>Use the Service in any way that violates any applicable federal, state, local, or international law or regulation.</li>
                      <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm SoloBoss AI or users of the Service or expose them to liability.</li>
                      <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
                      <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-gray-800 mb-2">AI Agent Outputs Disclaimer:</h3>
                    <p className="text-gray-600 text-sm">
                      While AI Agents like Lumi (Legal & Docs Agent) can assist with legal requirements and document generation, their outputs come "with appropriate disclaimers". The information provided by SoloBoss AI agents is for informational purposes only and does not constitute professional advice (e.g., legal, financial, or technical). You should consult with a qualified professional for advice tailored to your specific situation.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 7 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">7</span>
                    Disclaimers and Limitation of Liability
                  </h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">"As Is" Basis:</h3>
                    <p className="text-gray-600 text-sm">
                      Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. SoloBoss AI aims for a scalable, resilient, and maintainable architecture, robust data security, and reliable integrations.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">AI Outputs:</h3>
                    <p className="text-gray-600 text-sm">
                      SoloBoss AI does not guarantee the accuracy, completeness, or usefulness of any information generated by the AI Agents or other AI-powered features. The effectiveness of any Large Language Model (LLM) is fundamentally constrained by the quality and structure of the context it is given.
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h3 className="font-semibold text-gray-800 mb-2">Limitation of Liability:</h3>
                    <p className="text-gray-600 text-sm">
                      In no event will SoloBoss AI, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Service, including any direct, indirect, special, incidental, consequential, or punitive damages, including but not limited to, personal injury, pain and suffering, emotional distress, loss of revenue, loss of profits, loss of business or anticipated savings, loss of use, loss of goodwill, loss of data, whether caused by tort (including negligence), breach of contract, or otherwise, even if foreseeable.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Sections 8-11 */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">8</span>
                      Termination
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">By SoloBoss AI:</h3>
                      <p className="text-gray-600 text-sm">
                        We may terminate or suspend your access to all or part of the Service immediately, without prior notice or liability, if you breach these Terms of Service. This includes processing events related to subscription deletion, which may revert your account to the free tier.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">By You:</h3>
                      <p className="text-gray-600 text-sm">
                        You may stop using the Service at any time. Instructions for managing or canceling your subscription can be found within the billing portal.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">9</span>
                      Governing Law
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      These Terms of Service and any dispute or claim arising out of, or related to them, shall be governed by and construed in accordance with the laws of Dougherty County in Albany, Georgia without giving effect to any choice or conflict of law provision or rule.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">10</span>
                      Changes to Terms of Service
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the Service thereafter. Your continued use of the Service following the posting of revised Terms of Service means that you accept and agree to the changes.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">11</span>
                      Contact Information
                    </h2>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      <p className="text-gray-600 leading-relaxed mb-4">
                        To ask questions or comment about these Terms of Service, you may contact the boss at:
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-purple-600 font-semibold">psychedelic.creator@enchantednightmare.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Now that you know the terms, it's time to start your boss journey. Join thousands of entrepreneurs already scaling with SoloBoss AI.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              onClick={() => router.push('/sign-up')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
            >
              Start Building Empire
            </Button>
            <Link href="/privacy">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                View Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Modal removed - using Clerk authentication */}
    </div>
  )
} 