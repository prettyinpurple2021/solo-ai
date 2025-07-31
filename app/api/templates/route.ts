import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth-utils"

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { templateSlug, templateData, title, description } = body

    if (!templateSlug || !templateData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save template data to database
    const { data, error } = await supabase.from("user_templates").insert({
      user_id: user.id,
      template_slug: templateSlug,
      template_data: templateData,
      title: title || `Saved ${templateSlug}`,
      description: description || `Template data saved on ${new Date().toLocaleDateString()}`,
    })

    if (error) {
      console.error("Error saving template:", error)
      return NextResponse.json({ error: "Failed to save template" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      template: data,
    })
  } catch (error) {
    console.error("Template save error:", error)
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 })
  }
})

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    // Get user's saved templates from database
    const { data: templates, error } = await supabase
      .from("user_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching templates:", error)
      return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
    }

    return NextResponse.json({
      templates: templates || [],
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}) 