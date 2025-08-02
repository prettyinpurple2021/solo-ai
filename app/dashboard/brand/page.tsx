"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Palette, Type, ImageIcon, Download, Save, Sparkles, Crown, Lightbulb, Loader2 } from "lucide-react"

// Simple color picker component
const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
    </div>
  </div>
)

const COLOR_PALETTES = [
  {
    name: "Boss Babe Purple",
    primary: "#8E24AA",
    secondary: "#E1BEE7",
    accent: "#FF4081",
    colors: ["#8E24AA", "#AB47BC", "#CE93D8", "#E1BEE7", "#FF4081"],
  },
  {
    name: "Empire Gold",
    primary: "#FF8F00",
    secondary: "#FFE0B2",
    accent: "#FF5722",
    colors: ["#FF8F00", "#FFB300", "#FFCC02", "#FFE0B2", "#FF5722"],
  },
  {
    name: "Teal Power",
    primary: "#00695C",
    secondary: "#B2DFDB",
    accent: "#FF4081",
    colors: ["#00695C", "#00897B", "#26A69A", "#B2DFDB", "#FF4081"],
  },
  {
    name: "Rose Gold Luxury",
    primary: "#AD1457",
    secondary: "#F8BBD9",
    accent: "#FF6F00",
    colors: ["#AD1457", "#C2185B", "#E91E63", "#F8BBD9", "#FF6F00"],
  },
]

const FONT_OPTIONS = [
  "Inter", "Poppins", "Montserrat", "Playfair Display", "Source Sans Pro", "Open Sans", 
  "Roboto", "Lato", "Nunito", "Merriweather", "Oswald", "Raleway", "PT Sans", "Ubuntu",
  "Fira Sans", "Work Sans", "Crimson Text", "Libre Baskerville", "Oxygen", "Cabin",
  "Dancing Script", "Great Vibes", "Pacifico", "Shadows Into Light", "Indie Flower",
  "Comfortaa", "Quicksand", "Righteous", "Abril Fatface", "Fredoka One"
]

const TYPOGRAPHY_OPTIONS = [
  {
    name: "Modern Boss",
    heading: "Inter",
    body: "Inter",
    style: "Clean, modern, and professional",
  },
  {
    name: "Elegant Empire",
    heading: "Playfair Display",
    body: "Source Sans Pro",
    style: "Sophisticated and luxurious",
  },
  {
    name: "Bold Leader",
    heading: "Montserrat",
    body: "Open Sans",
    style: "Strong and confident",
  },
  {
    name: "Creative Visionary",
    heading: "Poppins",
    body: "Nunito",
    style: "Friendly and approachable",
  },
]

const LOGO_STYLES = [
  {
    name: "Minimalist Crown",
    description: "Clean, simple crown icon with text",
    style: "minimalist",
  },
  {
    name: "Elegant Script",
    description: "Sophisticated script with decorative elements",
    style: "elegant",
  },
  {
    name: "Bold Geometric",
    description: "Strong geometric shapes and bold typography",
    style: "bold",
  },
  {
    name: "Playful Modern",
    description: "Fun, contemporary design with personality",
    style: "playful",
  },
]

const BOSS_TIPS = [
  "Your brand colors should reflect your personality and resonate with your target audience",
  "Consistency across all touchpoints builds trust and recognition",
  "A strong brand voice helps you stand out in a crowded marketplace",
  "Your logo should work well in both color and black & white",
  "Typography choices can convey emotion and personality",
  "Your brand should evolve as your empire grows",
]

export default function BrandStylerStudio() {
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0])
  const [selectedTypography, setSelectedTypography] = useState(TYPOGRAPHY_OPTIONS[0])
  const [selectedLogo, setSelectedLogo] = useState(LOGO_STYLES[0])
  const [currentTip, setCurrentTip] = useState(0)
  const [brandName, setBrandName] = useState("")
  const [brandTagline, setBrandTagline] = useState("")
  const [brandDescription, setBrandDescription] = useState("")
  const [industry, setIndustry] = useState("")
  
  // Custom font selection states
  const [customHeadingFont, setCustomHeadingFont] = useState("Inter")
  const [customBodyFont, setCustomBodyFont] = useState("Inter")
  const [useCustomFonts, setUseCustomFonts] = useState(false)
  
  // Custom color states
  const [customColors, setCustomColors] = useState({
    primary: "#8E24AA",
    secondary: "#E1BEE7", 
    accent: "#FF4081"
  })
  const [useCustomColors, setUseCustomColors] = useState(false)
  
  // Logo generation state
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false)
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([])
  const [selectedGeneratedLogo, setSelectedGeneratedLogo] = useState<string | null>(null)

  // Load Google Fonts dynamically
  useEffect(() => {
    const loadGoogleFonts = () => {
      // Create Google Fonts link with all needed fonts
      const fontList = FONT_OPTIONS.join(":300,400,500,600,700|").replace(/ /g, "+")
      const link = document.createElement("link")
      link.href = `https://fonts.googleapis.com/css2?family=${fontList}&display=swap`
      link.rel = "stylesheet"
      
      // Check if already loaded
      const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"]`)
      if (!existingLink) {
        document.head.appendChild(link)
      }
    }

    loadGoogleFonts()
  }, [])

  const rotateTip = () => {
    setCurrentTip((prev) => (prev + 1) % BOSS_TIPS.length)
  }

  const generateLogos = async () => {
    if (!brandName.trim()) {
      alert("Please enter a brand name first!")
      return
    }
    
    setIsGeneratingLogo(true)
    try {
      // Call the AI logo generation API
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName,
          industry,
          style: selectedLogo.style,
          colors: getActiveColors(),
          typography: getActiveTypography(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate logos')
      }

      const data = await response.json()
      
      // Extract logo URLs from the response
      const logoUrls = data.logos.map((logo: any) => logo.url)
      setGeneratedLogos(logoUrls)

      // Show fallback notice if applicable
      if (data.isFallback) {
        console.warn('Using fallback logo generation:', data.fallbackReason)
      }
      
    } catch (error) {
      console.error("Logo generation failed:", error)
      alert(`Logo generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsGeneratingLogo(false)
    }
  }

  const getActiveColors = () => {
    return useCustomColors ? customColors : {
      primary: selectedPalette.primary,
      secondary: selectedPalette.secondary,
      accent: selectedPalette.accent
    }
  }

  const getActiveTypography = () => {
    return useCustomFonts ? {
      heading: customHeadingFont,
      body: customBodyFont,
      name: "Custom",
      style: "Custom font selection"
    } : selectedTypography
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BrandStyler Studio
                </h1>
                <p className="text-gray-600">Create a legendary brand that commands attention</p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">✨ AI-Powered Brand Creation</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="basics">Brand Basics</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="logo">Logo Style</TabsTrigger>
                </TabsList>

                {/* Brand Basics Tab */}
                <TabsContent value="basics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <span>Define Your Empire</span>
                      </CardTitle>
                      <CardDescription>Start by defining the core elements of your brand identity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="brandName">Brand Name</Label>
                          <Input
                            id="brandName"
                            placeholder="Enter your brand name"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Select value={industry} onValueChange={setIndustry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coaching">Coaching & Consulting</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="saas">SaaS & Technology</SelectItem>
                              <SelectItem value="creative">Creative Services</SelectItem>
                              <SelectItem value="health">Health & Wellness</SelectItem>
                              <SelectItem value="finance">Finance & Investment</SelectItem>
                              <SelectItem value="education">Education & Training</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tagline">Brand Tagline</Label>
                        <Input
                          id="tagline"
                          placeholder="Your powerful tagline"
                          value={brandTagline}
                          onChange={(e) => setBrandTagline(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Brand Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your brand's mission, values, and what makes you unique..."
                          rows={4}
                          value={brandDescription}
                          onChange={(e) => setBrandDescription(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Colors Tab */}
                <TabsContent value="colors">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                        <span>Choose Your Power Colors</span>
                      </CardTitle>
                      <CardDescription>Select a color palette that reflects your brand personality</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Toggle for custom colors */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="custom-colors"
                          checked={useCustomColors}
                          onCheckedChange={setUseCustomColors}
                        />
                        <Label htmlFor="custom-colors">Use custom colors</Label>
                      </div>

                      {useCustomColors ? (
                        /* Custom Color Picker Section */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ColorPicker
                              label="Primary Color"
                              value={customColors.primary}
                              onChange={(color) => setCustomColors(prev => ({ ...prev, primary: color }))}
                            />
                            <ColorPicker
                              label="Secondary Color"
                              value={customColors.secondary}
                              onChange={(color) => setCustomColors(prev => ({ ...prev, secondary: color }))}
                            />
                            <ColorPicker
                              label="Accent Color"
                              value={customColors.accent}
                              onChange={(color) => setCustomColors(prev => ({ ...prev, accent: color }))}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Predefined Palette Selection */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {COLOR_PALETTES.map((palette, index) => (
                            <Card
                              key={index}
                              className={`cursor-pointer transition-all duration-200 ${
                                selectedPalette.name === palette.name
                                  ? "ring-2 ring-purple-300 bg-purple-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedPalette(palette)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="font-semibold text-gray-800">{palette.name}</h3>
                                  {selectedPalette.name === palette.name && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  {palette.colors.map((color, colorIndex) => (
                                    <div
                                      key={colorIndex}
                                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Typography Tab */}
                <TabsContent value="typography">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Type className="w-5 h-5 text-purple-600" />
                        <span>Typography That Commands</span>
                      </CardTitle>
                      <CardDescription>Choose fonts that convey your brand's personality and authority</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Toggle for custom fonts */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="custom-fonts"
                          checked={useCustomFonts}
                          onCheckedChange={setUseCustomFonts}
                        />
                        <Label htmlFor="custom-fonts">Use custom fonts</Label>
                      </div>

                      {useCustomFonts ? (
                        /* Custom Font Selection */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Heading Font</Label>
                              <Select value={customHeadingFont} onValueChange={setCustomHeadingFont}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {FONT_OPTIONS.map((font) => (
                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                      {font}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="p-3 border rounded-lg">
                                <div 
                                  className="text-2xl font-bold"
                                  style={{ fontFamily: customHeadingFont }}
                                >
                                  Sample Heading
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Body Font</Label>
                              <Select value={customBodyFont} onValueChange={setCustomBodyFont}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {FONT_OPTIONS.map((font) => (
                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                      {font}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="p-3 border rounded-lg">
                                <div 
                                  className="text-sm"
                                  style={{ fontFamily: customBodyFont }}
                                >
                                  This is sample body text to preview how your content will look with the selected font.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Predefined Typography Options */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {TYPOGRAPHY_OPTIONS.map((typography, index) => (
                            <Card
                              key={index}
                              className={`cursor-pointer transition-all duration-200 ${
                                selectedTypography.name === typography.name
                                  ? "ring-2 ring-purple-300 bg-purple-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedTypography(typography)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="font-semibold text-gray-800">{typography.name}</h3>
                                  {selectedTypography.name === typography.name && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <div className="text-xl font-bold" style={{ fontFamily: typography.heading }}>
                                    Heading Font
                                  </div>
                                  <div className="text-sm" style={{ fontFamily: typography.body }}>
                                    Body text font for readability
                                  </div>
                                  <p className="text-xs text-gray-500">{typography.style}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Logo Style Tab */}
                <TabsContent value="logo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                        <span>AI Logo Generator</span>
                      </CardTitle>
                      <CardDescription>Generate custom logos using AI based on your brand preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Generation Button */}
                      <div className="text-center">
                        <Button 
                          onClick={generateLogos}
                          disabled={isGeneratingLogo || !brandName.trim()}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                          size="lg"
                        >
                          {isGeneratingLogo ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Logos...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate AI Logos
                            </>
                          )}
                        </Button>
                        {!brandName.trim() && (
                          <p className="text-sm text-gray-500 mt-2">Please enter a brand name first</p>
                        )}
                      </div>

                      {/* Generated Logos */}
                      {generatedLogos.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">Generated Logos:</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {generatedLogos.map((logo, index) => (
                              <Card
                                key={index}
                                className={`cursor-pointer transition-all duration-200 ${
                                  selectedGeneratedLogo === logo
                                    ? "ring-2 ring-purple-300 bg-purple-50"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedGeneratedLogo(logo)}
                              >
                                <CardContent className="p-4 text-center">
                                  <img 
                                    src={logo} 
                                    alt={`Generated logo ${index + 1}`}
                                    className="w-full h-20 object-contain mb-2"
                                  />
                                  {selectedGeneratedLogo === logo && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Style Reference (for inspiration) */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Style Inspiration:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {LOGO_STYLES.map((logo, index) => (
                            <Card
                              key={index}
                              className={`cursor-pointer transition-all duration-200 ${
                                selectedLogo.name === logo.name
                                  ? "ring-2 ring-purple-300 bg-purple-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedLogo(logo)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="font-semibold text-gray-800">{logo.name}</h3>
                                  {selectedLogo.name === logo.name && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      Selected Style
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{logo.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Brand Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 rounded-lg" style={{ backgroundColor: getActiveColors().secondary }}>
                    {selectedGeneratedLogo ? (
                      <div className="mb-3">
                        <img 
                          src={selectedGeneratedLogo} 
                          alt="Generated logo"
                          className="w-20 h-10 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: getActiveColors().primary }}
                      >
                        👑
                      </div>
                    )}
                    <h3
                      className="font-bold text-lg"
                      style={{ color: getActiveColors().primary, fontFamily: getActiveTypography().heading }}
                    >
                      {brandName || "Your Brand"}
                    </h3>
                    <p className="text-sm mt-1" style={{ fontFamily: getActiveTypography().body }}>
                      {brandTagline || "Your powerful tagline"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Color Palette</h4>
                    <div className="flex space-x-2">
                      <div
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: getActiveColors().primary }}
                        title={getActiveColors().primary}
                      />
                      <div
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: getActiveColors().secondary }}
                        title={getActiveColors().secondary}
                      />
                      <div
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: getActiveColors().accent }}
                        title={getActiveColors().accent}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Typography</h4>
                    <div className="text-xs text-gray-600">
                      <div>Heading: {getActiveTypography().heading}</div>
                      <div>Body: {getActiveTypography().body}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Boss Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span>Boss Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{BOSS_TIPS[currentTip]}</p>
                  <Button variant="outline" size="sm" onClick={rotateTip} className="w-full bg-transparent">
                    Next Tip
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Brand Kit
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export Assets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent"
                    onClick={generateLogos}
                    disabled={isGeneratingLogo || !brandName.trim()}
                  >
                    {isGeneratingLogo ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Logo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
