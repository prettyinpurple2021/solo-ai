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

    // Save brand profile
    const { data: brandProfile, error: brandError } = await supabase
      .from("brand_profiles")
      .upsert({
        user_id: user.id,
        name: brandName,
        tagline: tagline || null,
        description: description || null,
        industry: industry || null,
        color_palette: colors || {},
        fonts: typography || {},
        logo_url: logoData || null,
        style_guide: {
          logo_style: logoStyle || null,
          created_at: new Date().toISOString()
        },
        is_primary: true, // Set as primary brand profile
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,name"
      })
      .select()
      .single()

    if (brandError) {
      console.error("Brand profile save error:", brandError)
      return NextResponse.json({ error: "Failed to save brand profile" }, { status: 500 })
    }

    // Create a brand kit document in the briefcase
    const brandKitContent = JSON.stringify({
      brandName,
      tagline,
      description,
      industry,
      colors,
      typography,
      logoData,
      logoStyle,
      createdAt: new Date().toISOString()
    }, null, 2)

    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `${brandName} - Brand Kit`,
        content: brandKitContent,
        file_type: "application/json",
        folder: "brand-kits",
        tags: ["brand-kit", "branding", brandName.toLowerCase().replace(/\s+/g, "-")],
        is_ai_processed: false,
        ai_summary: `Brand kit for ${brandName} including colors, typography, and styling information.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (docError) {
      console.error("Document save error:", docError)
      return NextResponse.json({ error: "Failed to save brand kit to briefcase" }, { status: 500 })
    }

    // Update daily stats
    try {
      await supabase.rpc('update_daily_stats', {
        p_user_id: user.id,
        p_stat_type: 'documents_created',
        p_increment: 1
      })
    } catch (statsError) {
      console.error("Stats update error:", statsError)
      // Don't fail the request if stats update fails
    }

    return NextResponse.json({
      success: true,
      brandProfile,
      document,
      message: "Brand kit saved successfully to your briefcase!"
    })

  } catch (error) {
    console.error("Brand save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}