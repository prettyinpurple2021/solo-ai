import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadFile, checkFileQuota } from "@/lib/blob-storage"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get user's subscription tier
    const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()

    const subscriptionTier = profile?.subscription_tier || "launchpad"

    // Check file quota
    const quota = await checkFileQuota(user.id, subscriptionTier)

    if (!quota.canUpload) {
      return NextResponse.json({ error: "File quota exceeded. Please upgrade your plan." }, { status: 413 })
    }

    if (file.size > quota.available) {
      return NextResponse.json({ error: "File too large for remaining quota." }, { status: 413 })
    }

    // Upload file
    const result = await uploadFile(file, file.name, user.id)

    // Save file record to database
    const { error: dbError } = await supabase.from("user_files").insert({
      user_id: user.id,
      filename: file.name,
      file_url: result.url,
      file_path: result.pathname,
      file_size: file.size,
      content_type: result.contentType,
    })

    if (dbError) {
      console.error("Error saving file record:", dbError)
      // File uploaded but DB record failed - could implement cleanup here
    }

    return NextResponse.json({
      success: true,
      file: {
        url: result.url,
        filename: file.name,
        size: file.size,
        contentType: result.contentType,
      },
      quota: {
        used: quota.used + file.size,
        limit: quota.limit,
        available: quota.available - file.size,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's files from database
    const { data: files, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching files:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    // Get user's subscription tier for quota info
    const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()

    const subscriptionTier = profile?.subscription_tier || "launchpad"
    const quota = await checkFileQuota(user.id, subscriptionTier)

    return NextResponse.json({
      files: files || [],
      quota,
    })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
