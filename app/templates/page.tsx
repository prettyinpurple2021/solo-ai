"use client"

import Link from "next/link"
import { ArrowLeft, Download, Star, FileText, Presentation, Mail, Calendar, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const templates = [
  {
    id: 1,
    title: "Business Plan Template",
    description: "Comprehensive business plan template for solo entrepreneurs",
    category: "Business",
    icon: FileText,
    downloads: 1250,
    rating: 4.9,
    premium: false
  },
  {
    id: 2,
    title: "Pitch Deck Template",
    description: "Professional pitch deck template for investors and clients",
    category: "Presentation",
    icon: Presentation,
    downloads: 980,
    rating: 4.8,
    premium: true
  },
  {
    id: 3,
    title: "Email Marketing Templates",
    description: "Collection of high-converting email templates",
    category: "Marketing",
    icon: Mail,
    downloads: 2100,
    rating: 4.7,
    premium: false
  },
  {
    id: 4,
    title: "Content Calendar Template",
    description: "Monthly content planning template for social media",
    category: "Planning",
    icon: Calendar,
    downloads: 1580,
    rating: 4.9,
    premium: false
  },
  {
    id: 5,
    title: "Client Proposal Template",
    description: "Professional proposal template for client projects",
    category: "Business",
    icon: Briefcase,
    downloads: 890,
    rating: 4.6,
    premium: true
  }
]

const categories = ["All", "Business", "Marketing", "Presentation", "Planning"]

export default function TemplatesPage() {
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
              <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Boss Templates 📋
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Ready-to-use templates designed specifically for solo entrepreneurs. 
              Build your empire faster with our curated collection! ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                50+ Templates Available
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Updated Monthly
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className={category === "All" ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <template.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  {template.premium && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {template.description}
                </CardDescription>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Download className="w-4 h-4" />
                    <span>{template.downloads}</span>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            More Templates Coming Soon! 🚀
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're constantly adding new templates based on community feedback. 
            Have a specific template request? Let us know!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contact">Request a Template</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/community">Join Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}