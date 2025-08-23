import { NextRequest, NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  try {
    const { token, action, minScore = 0.5 } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA action is required' },
        { status: 400 }
      )
    }

    // Validate the reCAPTCHA token
    const isValid = await validateRecaptcha(token, action, minScore)

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA validation failed. Please try again.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'reCAPTCHA validation successful'
    })

  } catch (error) {
    console.error('reCAPTCHA validation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during reCAPTCHA validation' 
      },
      { status: 500 }
    )
  }
}