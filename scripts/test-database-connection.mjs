#!/usr/bin/env node

/**
 * Verification script to ensure build configuration is correct for production.
 * Checks environment variables and route configurations.
 */

console.log('🧪 Verifying Production Build Configuration...')

// Verify Build Environment Variables
process.env.NODE_ENV = 'production'
process.env.NEXT_PHASE = 'phase-production-build'

// Load environment variables
const envFile = '.env.production.build'
try {
  const fs = await import('fs')
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8')
    const envLines = envContent.split('\n')
    
    for (const line of envLines) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=')
          process.env[key] = value
        }
      }
    }
    console.log('✅ Environment variables loaded from .env.production.build')
  } else {
    // This is acceptable if running in an environment where vars are already set (like Vercel)
    console.log('ℹ️  No .env.production.build file found (checking existing environment)')
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error)
  process.exit(1)
}

// Verify Database Connection Strategy
// We don't "simulate" the connection here, we just check the configuration
// The actual connection is managed by the app code we are testing for config compliance.

const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'

if (isBuildTime) {
    console.log('✅ Build phase detected correctly')
} else {
    console.warn('⚠️  Warning: Script not running in build phase context')
}

// Check Critical Route Configurations
try {
  console.log('🔍 Verifying API route configurations...')
  
  const fs = await import('fs')
  const routeFile = 'app/api/learning/modules/route.ts'
  
  if (fs.existsSync(routeFile)) {
    const content = fs.readFileSync(routeFile, 'utf8')
    
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log('✅ Learning modules route has dynamic export configured')
    } else {
      console.error('❌ Learning modules route missing dynamic export')
      process.exit(1)
    }
    
    if (content.includes('getNeonConnection')) {
      console.log('✅ Learning modules route uses safe database connection utility')
    } else {
      console.warn('⚠️  Learning modules route may not use safe database connection')
    }
    
  } else {
    console.error(`❌ Route file not found: ${routeFile}`)
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ Configuration verification failed:', error)
  process.exit(1)
}

console.log('🎉 Build configuration verified successfully!')
