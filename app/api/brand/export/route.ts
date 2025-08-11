import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'

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

    // Generate brand kit export data
    const brandKit = {
      brandName,
      tagline,
      description,
      industry,
      colors,
      typography,
      logoData,
      logoStyle,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    // Create a zip file dynamically and return as attachment
    // To keep it serverless-friendly, return a JSON payload for now with embedded data URL for simple downloads
    const payload = Buffer.from(JSON.stringify(brandKit, null, 2)).toString('base64')
    const dataUrl = `data:application/json;base64,${payload}`
    return NextResponse.json({ 
      message: 'Brand kit exported successfully',
      brandKit,
      downloadUrl: dataUrl
    }, { status: 200 })
  } catch (error) {
    console.error('Error exporting brand kit:', error)
    return NextResponse.json(
      { error: 'Failed to export brand kit' },
      { status: 500 }
    )
  }
}
