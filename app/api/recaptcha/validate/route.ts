import { logError, logWarn, logInfo,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { createAssessment,} from '@/lib/recaptcha'



export async function POST(request: NextRequest) {
  try {
    const { token, action, minScore = 0.5 } = await request.json()

    if (!token) {
      logError('reCAPTCHA validation: token missing')
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    if (!action) {
      logError('reCAPTCHA validation: action missing')
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA action is required' },
        { status: 400 }
      )
    }

    logInfo(`Validating reCAPTCHA token for action: ${action}`)

    // Step 1: Create assessment with Google Cloud to get the risk score
    // This is what Google Cloud needs to see to verify the integration is complete
    const score = await createAssessment(token, action)
    
    if (score === null) {
      logError(`reCAPTCHA assessment failed for action: ${action}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA validation failed. Please try again.' 
        },
        { status: 400 }
      )
    }

    // Step 2: Validate that the score meets the minimum threshold
    if (score < minScore) {
      logWarn(`reCAPTCHA score ${score} below minimum threshold ${minScore} for action: ${action}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA validation failed. Please try again.',
          score // Include score for debugging
        },
        { status: 400 }
      )
    }

    logInfo(`reCAPTCHA validation successful for action: ${action} with score: ${score}`)
    
    // Return success with the risk score
    // This allows Google Cloud to verify that the risk score is being used
    return NextResponse.json({
      success: true,
      message: 'reCAPTCHA validation successful',
      score: score // Include the risk score in the response
    })

  } catch (error) {
    logError('reCAPTCHA validation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during reCAPTCHA validation' 
      },
      { status: 500 }
    )
  }
}
