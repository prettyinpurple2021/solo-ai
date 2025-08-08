import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    const client = await createClient()
    const { rows } = await client.query(
      `INSERT INTO brand_profiles (user_id, brand_name, tagline, description, industry, colors, typography, logo_data, logo_style)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user.id, brandName, tagline || '', description || '', industry || '', JSON.stringify(colors), JSON.stringify(typography), logoData, logoStyle]
    )

    return NextResponse.json({ 
      message: 'Brand kit saved successfully',
      brandProfile: rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving brand kit:', error)
    return NextResponse.json(
      { error: 'Failed to save brand kit' },
      { status: 500 }
    )
  }
}
