import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getSql()

    // Get user's brand settings
    const brandSettings = await sql`
      SELECT 
        company_name,
        tagline,
        description,
        industry,
        target_audience,
        brand_personality,
        color_palette,
        typography,
        logo_url,
        logo_prompt,
        moodboard,
        created_at,
        updated_at
      FROM user_brand_settings 
      WHERE user_id = ${user.id}
      LIMIT 1
    `

    if (brandSettings.length === 0) {
      return NextResponse.json({ brand: null })
    }

    const brand = {
      companyName: brandSettings[0].company_name,
      tagline: brandSettings[0].tagline,
      description: brandSettings[0].description,
      industry: brandSettings[0].industry,
      targetAudience: brandSettings[0].target_audience,
      brandPersonality: brandSettings[0].brand_personality || [],
      colorPalette: brandSettings[0].color_palette || {},
      typography: brandSettings[0].typography || {},
      logoUrl: brandSettings[0].logo_url,
      logoPrompt: brandSettings[0].logo_prompt,
      moodboard: brandSettings[0].moodboard || [],
      createdAt: brandSettings[0].created_at,
      updatedAt: brandSettings[0].updated_at
    }

    return NextResponse.json({ brand })
  } catch (error) {
    logError('Error fetching brand settings:', error)
    return NextResponse.json({ error: 'Failed to fetch brand settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandData = await request.json()
    const sql = getSql()

    // Check if brand settings already exist
    const existing = await sql`
      SELECT id FROM user_brand_settings WHERE user_id = ${user.id}
    `

    if (existing.length > 0) {
      // Update existing settings
      const result = await sql`
        UPDATE user_brand_settings 
        SET 
          company_name = ${brandData.companyName || null},
          tagline = ${brandData.tagline || null},
          description = ${brandData.description || null},
          industry = ${brandData.industry || null},
          target_audience = ${brandData.targetAudience || null},
          brand_personality = ${JSON.stringify(brandData.brandPersonality || [])},
          color_palette = ${JSON.stringify(brandData.colorPalette || {})},
          typography = ${JSON.stringify(brandData.typography || {})},
          logo_url = ${brandData.logoUrl || null},
          logo_prompt = ${brandData.logoPrompt || null},
          moodboard = ${JSON.stringify(brandData.moodboard || [])},
          updated_at = NOW()
        WHERE user_id = ${user.id}
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        brand: result[0]
      })
    } else {
      // Create new settings
      const result = await sql`
        INSERT INTO user_brand_settings (
          user_id,
          company_name,
          tagline,
          description,
          industry,
          target_audience,
          brand_personality,
          color_palette,
          typography,
          logo_url,
          logo_prompt,
          moodboard,
          created_at,
          updated_at
        ) VALUES (
          ${user.id},
          ${brandData.companyName || null},
          ${brandData.tagline || null},
          ${brandData.description || null},
          ${brandData.industry || null},
          ${brandData.targetAudience || null},
          ${JSON.stringify(brandData.brandPersonality || [])},
          ${JSON.stringify(brandData.colorPalette || {})},
          ${JSON.stringify(brandData.typography || {})},
          ${brandData.logoUrl || null},
          ${brandData.logoPrompt || null},
          ${JSON.stringify(brandData.moodboard || [])},
          NOW(),
          NOW()
        )
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        brand: result[0]
      })
    }
  } catch (error) {
    logError('Error saving brand settings:', error)
    return NextResponse.json({ error: 'Failed to save brand settings' }, { status: 500 })
  }
}
