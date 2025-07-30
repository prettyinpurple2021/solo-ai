"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, Server, Key, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data is encrypted in transit and at rest using AES-256 encryption"
  },
  {
    icon: Shield,
    title: "SOC 2 Type II Compliant",
    description: "Regular security audits and compliance with industry standards"
  },
  {
    icon: Key,
    title: "Zero-Knowledge Architecture",
    description: "We never have access to your unencrypted data or business information"
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime"
  },
  {
    icon: Eye,
    title: "Privacy by Design",
    description: "Built with privacy at the core - your data belongs to you"
  }
]

const certifications = [
  { name: "SOC 2 Type II", status: "Certified" },
  { name: "GDPR Compliant", status: "Certified" },
  { name: "CCPA Compliant", status: "Certified" },
  { name: "ISO 27001", status: "In Progress" }
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Shield className="w-20 h-20 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Security & Trust 🔒
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Your business data is precious. We protect it with enterprise-grade security 
              that meets the highest industry standards. Sleep soundly knowing your empire is secure! ✨
            </p>
            <Alert className="max-w-2xl mx-auto bg-white/10 border-white/20 text-white">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last security audit:</strong> December 2024 - All systems secure ✅
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            How We Protect Your Data
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multi-layered security approach ensuring your business information stays private and secure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Security Certifications & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  {cert.status === "Certified" ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
                <h4 className="font-semibold mb-2">{cert.name}</h4>
                <Badge 
                  variant={cert.status === "Certified" ? "default" : "secondary"}
                  className={cert.status === "Certified" ? "bg-green-500" : "bg-yellow-500"}
                >
                  {cert.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Security Practices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold mb-6">Data Protection Practices</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Regular security audits and penetration testing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>24/7 security monitoring and incident response</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Employee security training and background checks</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Secure development lifecycle (SDLC) practices</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Regular security awareness training for all staff</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Infrastructure Security</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Multi-region data backups with 99.9% recovery guarantee</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>DDoS protection and advanced threat detection</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Network segmentation and access controls</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Automated security updates and patch management</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Enterprise-grade firewalls and intrusion detection</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-12">
          <h3 className="text-2xl font-bold mb-6">Security Questions or Concerns?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our security team is here to help. Whether you need technical documentation, 
            want to report a security issue, or have compliance questions - we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/contact">Contact Security Team</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="mailto:security@soloboss.ai">security@soloboss.ai</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}