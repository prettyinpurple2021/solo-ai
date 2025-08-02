import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      brandName,
      tagline,
      description,
      industry,
      colors,
      typography,
      logoData,
      logoStyle
    } = body

    // Validate required fields
    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    // Create comprehensive brand kit export data
    const brandKitExport = {
      metadata: {
        brandName,
        exportDate: new Date().toISOString(),
        version: "1.0",
        generatedBy: "SoloBoss AI - BrandStyler Studio"
      },
      brandIdentity: {
        name: brandName,
        tagline: tagline || "",
        description: description || "",
        industry: industry || ""
      },
      colorPalette: {
        primary: colors?.primary || "#8E24AA",
        secondary: colors?.secondary || "#E1BEE7",
        accent: colors?.accent || "#FF4081",
        additional: colors?.colors || []
      },
      typography: {
        headingFont: typography?.heading || "Inter",
        bodyFont: typography?.body || "Inter",
        style: typography?.style || "Modern and clean"
      },
      logo: {
        url: logoData || null,
        style: logoStyle || "minimalist",
        description: `Logo design for ${brandName} in ${logoStyle || 'minimalist'} style`
      },
      brandGuidelines: {
        voiceTone: "Professional, confident, and approachable",
        usage: "Consistent application across all brand touchpoints",
        dosDonts: [
          "DO: Use consistent color palette across all materials",
          "DO: Maintain proper logo spacing and sizing",
          "DON'T: Alter logo proportions or colors",
          "DON'T: Use colors outside the defined palette"
        ]
      },
      files: {
        colorSwatches: generateColorSwatches(colors),
        typographyGuide: generateTypographyGuide(typography),
        brandSheet: generateBrandSheet({
          brandName,
          tagline,
          description,
          industry,
          colors,
          typography
        })
      }
    }

    // Create CSS variables file
    const cssVariables = generateCSSVariables(colors, typography)

    // Create brand guidelines document
    const brandGuidelines = generateBrandGuidelines(brandKitExport)

    // Return the export data that the frontend can use to create downloadable files
    return NextResponse.json({
      success: true,
      exportData: {
        brandKit: brandKitExport,
        files: {
          "brand-kit.json": JSON.stringify(brandKitExport, null, 2),
          "brand-colors.css": cssVariables,
          "brand-guidelines.md": brandGuidelines,
          "color-palette.json": JSON.stringify(brandKitExport.colorPalette, null, 2),
          "typography.json": JSON.stringify(brandKitExport.typography, null, 2)
        }
      },
      message: "Brand kit exported successfully!"
    })

  } catch (error) {
    console.error("Brand export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateColorSwatches(colors: any) {
  const swatches = {
    primary: colors?.primary || "#8E24AA",
    secondary: colors?.secondary || "#E1BEE7", 
    accent: colors?.accent || "#FF4081"
  }
  
  return Object.entries(swatches).map(([name, color]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    hex: color,
    rgb: hexToRgb(color as string),
    usage: `Use for ${name} brand elements`
  }))
}

function generateTypographyGuide(typography: any) {
  return {
    heading: {
      font: typography?.heading || "Inter",
      usage: "Use for headings, titles, and emphasis",
      sizes: ["48px", "36px", "24px", "18px"]
    },
    body: {
      font: typography?.body || "Inter", 
      usage: "Use for body text, descriptions, and content",
      sizes: ["16px", "14px", "12px"]
    }
  }
}

function generateBrandSheet(data: any) {
  return {
    overview: {
      name: data.brandName,
      tagline: data.tagline,
      description: data.description,
      industry: data.industry
    },
    colorPalette: data.colors,
    typography: data.typography,
    createdAt: new Date().toISOString()
  }
}

function generateCSSVariables(colors: any, typography: any) {
  return `:root {
  /* Brand Colors */
  --brand-primary: ${colors?.primary || "#8E24AA"};
  --brand-secondary: ${colors?.secondary || "#E1BEE7"};
  --brand-accent: ${colors?.accent || "#FF4081"};
  
  /* Typography */
  --font-heading: "${typography?.heading || "Inter"}", sans-serif;
  --font-body: "${typography?.body || "Inter"}", sans-serif;
  
  /* Generated by SoloBoss AI BrandStyler Studio */
}`
}

function generateBrandGuidelines(brandKit: any) {
  return `# ${brandKit.brandIdentity.name} Brand Guidelines

## Brand Identity
- **Name:** ${brandKit.brandIdentity.name}
- **Tagline:** ${brandKit.brandIdentity.tagline}
- **Industry:** ${brandKit.brandIdentity.industry}
- **Description:** ${brandKit.brandIdentity.description}

## Color Palette
- **Primary:** ${brandKit.colorPalette.primary}
- **Secondary:** ${brandKit.colorPalette.secondary}
- **Accent:** ${brandKit.colorPalette.accent}

## Typography
- **Heading Font:** ${brandKit.typography.headingFont}
- **Body Font:** ${brandKit.typography.bodyFont}
- **Style:** ${brandKit.typography.style}

## Logo
- **Style:** ${brandKit.logo.style}
- **Description:** ${brandKit.logo.description}

## Brand Guidelines
${brandKit.brandGuidelines.dosDonts.map((item: string) => `- ${item}`).join('\n')}

---
*Generated by SoloBoss AI BrandStyler Studio on ${new Date().toLocaleDateString()}*
`
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}