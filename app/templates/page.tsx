import { getAllTemplates } from '@/lib/templates-client';
import { TemplateCategory } from '@/lib/templates-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const categories = await getAllTemplates();

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
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name={category.icon as any} className="w-6 h-6" />
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              <p className="text-muted-foreground mb-6">{category.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.templates.map((template) => (
                  <Link href={`/templates/${template.slug}`} key={template.id}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{template.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
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