"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Shield, FileText, Lock, Eye, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            🔒 Data Protection
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your privacy is our priority. We're committed to protecting your data and being transparent about how we handle your information.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Effective Date: July 30, 2025</span>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                SoloBoss AI Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                
                {/* Introduction */}
                <div className="mb-8">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    This Privacy Policy describes how SoloBoss AI ("we," "us," or "our") collects, uses, and discloses your information when you use our web application (the "Service"). We are committed to protecting your privacy and handling your data in a transparent and secure manner.
                  </p>
                </div>

                <Separator className="my-8" />

                {/* Section 1 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                    Information We Collect
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We collect various types of information to provide and improve our Service, manage subscriptions, and enhance user productivity.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        User Account and Profile Data:
                      </h3>
                      <p className="text-gray-600 text-sm">
                        When you register for an account, we collect your email address and a password. We also create a user profile that stores a unique user ID, your name, subscription tier, Clerk customer ID, and the timestamp of your last update. You can view and edit basic profile information within your account settings.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Subscription and Payment Data:
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We collect information related to your subscription plan, including your current tier (Launchpad, Accelerator, Dominator) and whether you have a paid subscription. Payment processing is handled securely by Clerk Billing. We receive webhooks from Clerk to update your subscription status. We store subscription-related data such as subscription_tier_id, tier_name, features_included, ai_agent_access_levels, and price. User-specific subscription data, including user_subscription_id, user_id, subscription_tier_id, start_date, end_date, payment_status, and clerk_customer_id, are also stored.
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                      <h3 className="font-semibold text-gray-800 mb-2">SlayList Generator Data:</h3>
                      <p className="text-gray-600 text-sm">
                        If you use our SlayList Generator, we collect information related to your goals and tasks. This includes the id, user_id, title, status, and created_at for your long-term goals, and the id, goal_id, user_id, title, status, priority, and due_date for individual tasks. Our Lexi AI agent may process your goal data to provide task suggestions.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold text-gray-800 mb-2">Briefcase Data:</h3>
                      <p className="text-gray-600 text-sm">
                        When you upload files to your Briefcase, we store metadata about these files, such as storage_object_path, name, file_type, size, upload_date, and last_modified_date. The actual file content is stored securely in Supabase Storage. We also manage sharing permissions (viewer, editor, owner) for your files.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold text-gray-800 mb-2">BrandStyler Data:</h3>
                      <p className="text-gray-600 text-sm">
                        If you create and save "Brand Profiles" using BrandStyler, we collect and store the id, user_id, profile_name, mission, values, color_palette (JSONB), font_combinations (JSONB), tone, target_audience, keywords, creation_date, and last_modified_date for each profile. Our AI agents, such as Echo, may access your Brand Profile to generate on-brand content.
                      </p>
                    </div>

                    <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400">
                      <h3 className="font-semibold text-gray-800 mb-2">AI Agent Interaction Data:</h3>
                      <p className="text-gray-600 text-sm">
                        We process user requests sent to our AI agents (e.g., topic input for Echo). AI-generated content (e.g., social media captions, insights nudges) is returned to you and may be saved (e.g., to your Briefcase). We also collect user feedback on AI-generated suggestions to refine our models.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                      <h3 className="font-semibold text-gray-800 mb-2">User Activity/Burnout Data:</h3>
                      <p className="text-gray-600 text-sm">
                        SoloBoss AI includes a "Burnout Shield & Focus Mode" feature. To provide personalized suggestions and assess burnout risk, we may collect specific user activity metrics. This data, including activity_data_id, user_id, type_of_activity (e.g., 'slaylist_completion', 'focus_mode_duration'), timestamp, and relevant_metrics (JSONB), may be stored.
                      </p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                      <h3 className="font-semibold text-gray-800 mb-2">Notification Preferences:</h3>
                      <p className="text-gray-600 text-sm">
                        You can set your notification preferences, which are stored in our system, including user_notification_preferences_id, user_id, event_type, and delivery_method_preferences. Notifications themselves are also stored.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 2 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                    How We Use Your Information
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We use the information we collect for the following purposes:
                  </p>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To provide, operate, and maintain our Service.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To process your transactions and manage your subscriptions.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To personalize your experience and deliver relevant content and features.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To enable and enhance the functionality of our AI agents and features like SlayList Generator, Briefcase, and BrandStyler.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To analyze usage trends and improve the performance and design of our Service.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To develop new features and services.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To communicate with you, including sending important updates, notifications, and promotional materials (where you have opted in).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To provide customer support.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To monitor and prevent fraudulent activity and ensure the security of our Service.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>To comply with legal obligations.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 3 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                    Data Storage and Security Measures
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We prioritize robust data security and privacy.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Technology Stack:</h3>
                      <p className="text-gray-600 text-sm">
                        Our primary backend and database are powered by Supabase (PostgreSQL, Auth, Storage), chosen for its scalability, reliability, and security features. Supabase Auth handles user registration, login, authentication, and authorization using JWTs with SSR support. Supabase Storage is used for file management in the Briefcase.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Data Encryption:</h3>
                      <p className="text-gray-600 text-sm">
                        Data is encrypted in transit using HTTPS (TLS 1.2 or higher). Data at rest is also encrypted, as Supabase PostgreSQL provides encryption at rest.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Access Control and Authorization:</h3>
                      <div className="space-y-2 text-gray-600 text-sm">
                        <p><strong>Row Level Security (RLS):</strong> RLS is enabled on all tables containing user data (e.g., goals, tasks, profiles). Policies ensure that users can only access their own data unless explicitly shared.</p>
                        <p><strong>User Role Management:</strong> We manage user access levels based on their subscription tier, assigning features (e.g., AI agent access, chat retention) based on the subscribed plan. Feature gating ensures users on lower tiers are informed if a feature requires a higher tier.</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Input Validation:</h3>
                      <p className="text-gray-600 text-sm">
                        All incoming requests, especially those with a request body, undergo input validation using a Zod schema. This helps prevent vulnerabilities like SQL injection and cross-site scripting (XSS).
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Secure Payments:</h3>
                      <p className="text-gray-600 text-sm">
                        We integrate with Stripe for secure payment processing. Stripe handles all payment information securely via Stripe Elements or Checkout. We do not directly store your full payment card details on our servers.
                      </p>
                    </div>

                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">API Security:</h3>
                      <p className="text-gray-600 text-sm">
                        Our API endpoints include proper authentication and authorization checks. We also emphasize the secure management of API keys and credentials for third-party services.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 4 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">4</span>
                    Third-Party Integrations and Data Sharing
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We integrate with key third-party services essential for our functionality. We share your data with these third parties only as necessary to provide our Service:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold text-gray-800 mb-2">Google Vertex AI:</h3>
                      <p className="text-gray-600 text-sm">
                        We use Google Vertex AI to power our AI Agent suite (e.g., Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, Glitch) and for BrandStyler asset generation. User input and relevant data may be sent to Vertex AI models for processing, and AI-generated content is returned to you.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                              <h3 className="font-semibold text-gray-800 mb-2">Clerk Billing:</h3>
                        <p className="text-gray-600 text-sm">
                          We utilize Clerk Billing for secure payment processing for subscriptions, including customer creation, subscription management, creating checkout sessions, and handling webhooks. Your payment information is subject to Clerk's privacy policy.
                        </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold text-gray-800 mb-2">Vercel:</h3>
                      <p className="text-gray-600 text-sm">
                        Our application is deployed on Vercel, which handles automatic and optimized deployments and environment management.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold text-gray-800 mb-2">Google Calendar:</h3>
                      <p className="text-gray-600 text-sm">
                        If you choose to integrate Google Calendar for features like Focus Mode scheduling, we will, with your explicit consent via an OAuth flow, access your Google Calendar to read events and potentially add events.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400 mt-6">
                    <p className="text-gray-600 text-sm">
                      We do not sell, rent, or trade your personal information with third parties for their marketing purposes. We may share anonymized or aggregated data that does not identify you personally for analytical or business purposes.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Section 5 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">5</span>
                    Your Rights and Choices
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    SoloBoss AI aims to adhere to relevant privacy regulations like GDPR and CCPA. While a conceptual "Guardian AI" platform is envisioned to help SoloBoss AI's users with their own data privacy compliance (including handling user requests for data access, correction, or deletion for their clients), we also provide mechanisms for our own users to exercise similar rights regarding their data stored within SoloBoss AI.
                  </p>

                  <p className="text-gray-600 leading-relaxed mb-4">
                    You have the following rights regarding your personal data:
                  </p>

                  <div className="grid gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Access:
                      </h3>
                      <p className="text-gray-600 text-sm">You can request access to the personal data we hold about you.</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Correction/Rectification:</h3>
                      <p className="text-gray-600 text-sm">You can request that we correct any inaccurate or incomplete personal data we hold about you.</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Erasure ("Right to be Forgotten"):</h3>
                      <p className="text-gray-600 text-sm">You can request that we delete your personal data, subject to certain legal obligations or legitimate business interests.</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Restriction of Processing:</h3>
                      <p className="text-gray-600 text-sm">You can request that we restrict the processing of your personal data in certain circumstances.</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Data Portability:</h3>
                      <p className="text-gray-600 text-sm">You can request to receive your personal data in a structured, commonly used, and machine-readable format.</p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Objection:</h3>
                      <p className="text-gray-600 text-sm">You can object to the processing of your personal data in certain circumstances, including for direct marketing.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mt-6">
                    <p className="text-gray-600 text-sm">
                      To exercise any of these rights, please contact us using the contact information provided below. We will respond to your request in accordance with applicable data protection laws.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Sections 6-8 */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">6</span>
                      Disclaimers and Limitations
                    </h2>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-gray-600 text-sm mb-2">
                        Please note that while our Lumi (Legal & Docs Agent) assists with document generation, its output explicitly includes "appropriate disclaimers." This emphasizes that the AI's output is not a substitute for professional legal advice. SoloBoss AI provides assistance, but users are ultimately responsible for seeking professional advice where necessary.
                      </p>
                      <p className="text-gray-600 text-sm">
                        We acknowledge ethical considerations such as algorithmic bias, transparency, explainability, and accountability related to AI systems. We are committed to addressing these considerations as our Service evolves.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">7</span>
                      Changes to This Privacy Policy
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">8</span>
                      Contact Us
                    </h2>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      <p className="text-gray-600 leading-relaxed mb-4">
                        If you have any questions or concerns about this Privacy Policy, please contact us:
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Email:</h4>
                          <p className="text-purple-600 font-semibold">psychedelic.creator@enchantednightmare.com</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Home Office:</h4>
                          <div className="text-gray-600 space-y-1">
                            <p className="font-semibold">SoloBoss AI</p>
                            <p>Virtual</p>
                            <p>Albany, GA</p>
                            <p>United States</p>
                          </div>
                        </div>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Privacy, Our Priority</h2>
          <p className="text-xl mb-8 opacity-90">
            Ready to build your empire with confidence? Your data is safe with us as you scale your business with SoloBoss AI.
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
            <Link href="/terms">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                View Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 