"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Shield, FileText, Download, Trash2, Edit, Eye, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function GDPRPage() {
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
            🛡️ GDPR Compliance
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Data Rights
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Under the General Data Protection Regulation (GDPR), you have specific rights regarding your personal data. 
            Here's how we protect your privacy and how you can exercise your rights.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>GDPR Compliant Since: May 2018</span>
          </div>
        </div>
      </section>

      {/* GDPR Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                GDPR Information & Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">

                {/* What is GDPR */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                    What is GDPR?
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. 
                    It applies to all companies that process personal data of individuals in the European Union, regardless of where the company is located.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-600 text-sm">
                      <strong>At SoloBoss AI:</strong> We fully comply with GDPR requirements and are committed to protecting your personal data with the highest standards of privacy and security.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Your Rights */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                    Your GDPR Rights
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Under GDPR, you have several important rights regarding your personal data:
                  </p>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        Right to Access (Article 15)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        You have the right to know what personal data we hold about you and how we use it.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Request a copy of your personal data</li>
                        <li>Understand how we process your data</li>
                        <li>Know who we share your data with</li>
                        <li>Learn how long we keep your data</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Edit className="w-5 h-5 text-blue-600" />
                        Right to Rectification (Article 16)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        You can request that we correct any inaccurate or incomplete personal data.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Update incorrect information</li>
                        <li>Complete missing information</li>
                        <li>Ensure your data is accurate and current</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        Right to Erasure (Article 17)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Also known as the "right to be forgotten" - you can request deletion of your personal data.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Delete your account and all associated data</li>
                        <li>Remove data that's no longer necessary</li>
                        <li>Withdraw consent for data processing</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Download className="w-5 h-5 text-purple-600" />
                        Right to Data Portability (Article 20)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        You can request your data in a portable format to transfer to another service.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Export your data in JSON or CSV format</li>
                        <li>Transfer your data to another platform</li>
                        <li>Maintain data continuity when switching services</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-yellow-600" />
                        Right to Restrict Processing (Article 18)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        You can request that we limit how we process your personal data.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Suspend data processing temporarily</li>
                        <li>Limit use to specific purposes only</li>
                        <li>Maintain data while resolving disputes</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-400">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-600" />
                        Right to Object (Article 21)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        You can object to certain types of data processing, especially for marketing purposes.
                      </p>
                      <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                        <li>Stop direct marketing communications</li>
                        <li>Object to automated decision-making</li>
                        <li>Opt out of profiling activities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* How to Exercise Rights */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                    How to Exercise Your Rights
                  </h2>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Contact Our Data Protection Officer</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      To exercise any of your GDPR rights, please contact us using the information below:
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <p className="text-purple-600 font-semibold mb-1">psychedelic.creator@enchantednightmare.com</p>
                      <p className="text-gray-600 text-sm">Subject: GDPR Data Request - [Your Request Type]</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Response Time</h3>
                      <p className="text-gray-600 text-sm">
                        We will respond to your request within 30 days (or 1 month) as required by GDPR. 
                        In complex cases, we may extend this by an additional 2 months and will inform you of any delay.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">No Cost</h3>
                      <p className="text-gray-600 text-sm">
                        Exercising your GDPR rights is completely free of charge. We will not charge you for processing legitimate requests.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Identity Verification</h3>
                      <p className="text-gray-600 text-sm">
                        To protect your privacy, we may need to verify your identity before processing certain requests. 
                        This helps ensure your personal data isn't disclosed to unauthorized parties.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Our Commitment */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">4</span>
                    Our GDPR Compliance Commitment
                  </h2>
                  
                  <div className="grid gap-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Data Protection by Design
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We build privacy protection into every aspect of SoloBoss AI from the ground up. 
                        Data protection isn't an afterthought - it's fundamental to how we operate.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Minimal Data Collection
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We only collect personal data that is necessary for providing our services. 
                        We don't collect data "just in case" - every piece of data has a specific purpose.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" />
                        Strong Security Measures
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Your data is protected with enterprise-grade security including encryption, access controls, 
                        and regular security audits to prevent unauthorized access or data breaches.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-600" />
                        Transparent Processing
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We provide clear information about how we collect, use, and store your data. 
                        No hidden practices - everything is documented in our Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Data Transfers */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">5</span>
                    International Data Transfers
                  </h2>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-600 text-sm mb-4">
                      SoloBoss AI uses cloud infrastructure that may involve transferring your data outside the European Economic Area (EEA). 
                      When we do this, we ensure adequate protection through:
                    </p>
                    <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                      <li><strong>Adequacy Decisions:</strong> Transferring to countries deemed adequate by the European Commission</li>
                      <li><strong>Standard Contractual Clauses:</strong> Using EU-approved contractual safeguards</li>
                      <li><strong>Certified Providers:</strong> Working only with cloud providers that meet EU data protection standards</li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Complaints */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">6</span>
                    Filing a Complaint
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you're not satisfied with how we've handled your personal data or your GDPR rights, you have the right to file a complaint with a supervisory authority.
                  </p>
                  
                  <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                    <h3 className="font-semibold text-gray-800 mb-3">EU Supervisory Authorities</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      You can file a complaint with the data protection authority in your EU country. Some key authorities include:
                    </p>
                    <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                      <li><strong>Germany:</strong> Federal Commissioner for Data Protection and Freedom of Information</li>
                      <li><strong>France:</strong> Commission Nationale de l'Informatique et des Libertés (CNIL)</li>
                      <li><strong>UK:</strong> Information Commissioner's Office (ICO)</li>
                      <li><strong>Ireland:</strong> Data Protection Commission (DPC)</li>
                    </ul>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Questions About GDPR?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    If you have any questions about GDPR, your rights, or our data practices, please contact us:
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-purple-600 font-semibold">psychedelic.creator@enchantednightmare.com</p>
                    <p className="text-gray-600 text-sm mt-1">Subject: GDPR Information Request</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Related Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/privacy">
              <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Privacy Policy</h4>
                  <p className="text-gray-600 text-sm">Detailed information about our data practices</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cookies">
              <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Cookie Policy</h4>
                  <p className="text-gray-600 text-sm">How we use cookies and tracking technologies</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h4>
                  <p className="text-gray-600 text-sm">Get in touch with our data protection team</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Privacy, Our Priority</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your empire-building journey with confidence, knowing your data is protected by industry-leading privacy standards.
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
                Contact Data Protection Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 