"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Upload, 
  Eye,
  Save,
  Sparkles
} from "lucide-react"

export default function BrandPage() {
  const [brandData, setBrandData] = useState({
    name: "",
    tagline: "",
    description: "",
    industry: "",
    targetAudience: "",
    brandVoice: "",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899"
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSave = async () => {
    try {
      const response = await fetch('/api/brand/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData)
      })
      
      if (response.ok) {
        // Show success message
        console.log('Brand saved successfully')
      }
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const generateLogo = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandData.name,
          industry: brandData.industry,
          style: 'modern'
        })
      })
      
      if (response.ok) {
        // Handle logo generation response
        console.log('Logo generated successfully')
      }
    } catch (error) {
      console.error('Error generating logo:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Studio</h1>
          <p className="text-gray-600">Create and manage your brand identity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Brand
          </Button>
          <Button onClick={generateLogo} disabled={isGenerating} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Logo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Information
            </CardTitle>
            <CardDescription>
              Define your brand's core identity and values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={brandData.name}
                onChange={(e) => setBrandData({...brandData, name: e.target.value})}
                placeholder="Enter your brand name"
              />
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={brandData.tagline}
                onChange={(e) => setBrandData({...brandData, tagline: e.target.value})}
                placeholder="Your brand's tagline"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={brandData.description}
                onChange={(e) => setBrandData({...brandData, description: e.target.value})}
                placeholder="Describe your brand"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={brandData.industry}
                onChange={(e) => setBrandData({...brandData, industry: e.target.value})}
                placeholder="e.g., Technology, Health, Finance"
              />
            </div>
            
            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                value={brandData.targetAudience}
                onChange={(e) => setBrandData({...brandData, targetAudience: e.target.value})}
                placeholder="Who is your target audience?"
              />
            </div>
            
            <div>
              <Label htmlFor="brand-voice">Brand Voice</Label>
              <Input
                id="brand-voice"
                value={brandData.brandVoice}
                onChange={(e) => setBrandData({...brandData, brandVoice: e.target.value})}
                placeholder="e.g., Professional, Friendly, Bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
            <CardDescription>
              Choose your brand colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary-color"
                  type="color"
                  value={brandData.primaryColor}
                  onChange={(e) => setBrandData({...brandData, primaryColor: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={brandData.primaryColor}
                  onChange={(e) => setBrandData({...brandData, primaryColor: e.target.value})}
                  placeholder="#8B5CF6"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondary-color"
                  type="color"
                  value={brandData.secondaryColor}
                  onChange={(e) => setBrandData({...brandData, secondaryColor: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={brandData.secondaryColor}
                  onChange={(e) => setBrandData({...brandData, secondaryColor: e.target.value})}
                  placeholder="#EC4899"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Label>Color Preview</Label>
              <div className="flex gap-2 mt-2">
                <div 
                  className="w-12 h-12 rounded-lg border"
                  style={{ backgroundColor: brandData.primaryColor }}
                />
                <div 
                  className="w-12 h-12 rounded-lg border"
                  style={{ backgroundColor: brandData.secondaryColor }}
                />
                <div className="flex-1 border rounded-lg p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: brandData.primaryColor }}
                    />
                    <span>Primary</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: brandData.secondaryColor }}
                    />
                    <span>Secondary</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Brand Assets
          </CardTitle>
          <CardDescription>
            Upload and manage your brand assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload Logo</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose File
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload Images</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload Documents</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Brand Guidelines
          </CardTitle>
          <CardDescription>
            Your brand guidelines and usage rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Typography</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-bold">Heading Font</p>
                  <p className="text-sm text-gray-600">Inter - Bold</p>
                </div>
                <div>
                  <p className="text-base font-medium">Body Font</p>
                  <p className="text-sm text-gray-600">Inter - Regular</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Usage Guidelines</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Do</Badge>
                  <span>Use primary color for main actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Do</Badge>
                  <span>Use secondary color for accents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Don't</Badge>
                  <span>Use colors outside the palette</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
