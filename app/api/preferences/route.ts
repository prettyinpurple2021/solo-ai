import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// // Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    return (decoded?.userId as string) || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql()
    const userId = await getUserIdFromToken(req)

    // Get specific preference key from query params
    const url = new URL(req.url)
    const key = url.searchParams.get('key')

    if (!userId) {
      // For anonymous users, return default/empty state
      return NextResponse.json({ preferences: {} })
    }

    if (key) {
      // Get specific preference
      const result = await sql`
        select preference_value from user_preferences 
        where user_id = ${userId} and preference_key = ${key}
      `

      const value = result.length > 0 ? result[0].preference_value : null
      return NextResponse.json({ key, value })
    } else {
      // Get all preferences for user
      const result = await sql`
        select preference_key, preference_value from user_preferences 
        where user_id = ${userId}
      `

      const preferences = result.reduce((acc, row) => {
        acc[row.preference_key] = row.preference_value
        return acc
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as Record<string, any>)

      return NextResponse.json({ preferences })
    }
  } catch (error) {
    logError('Preferences GET error:', error)
    // If table is missing, return empty preferences instead of 500
    if (isNeonDbError(error) && error.code === '42P01') { // '42P01' is for undefined_table
      return NextResponse.json({ preferences: {} })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getSql()
    const userId = await getUserIdFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { key, value, preferences } = await req.json().catch(() => ({}))

    if (preferences) {
      // Bulk update multiple preferences
      const results = []
      for (const [prefKey, prefValue] of Object.entries(preferences)) {
        const result = await sql`
          insert into user_preferences (user_id, preference_key, preference_value, updated_at) 
          values (${userId}, ${prefKey}, ${JSON.stringify(prefValue)}, now())
          on conflict (user_id, preference_key) do update set 
            preference_value = ${JSON.stringify(prefValue)}, 
            updated_at = now()
          returning preference_key, preference_value
        `
        results.push(result[0])
      }

      return NextResponse.json({
        success: true,
        updated: results.length,
        preferences: results.reduce((acc, row) => {
          acc[row.preference_key] = row.preference_value
          return acc
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as Record<string, any>)
      })
    } else if (key && value !== undefined) {
      // Update single preference
      const result = await sql`
        insert into user_preferences (user_id, preference_key, preference_value, updated_at) 
        values (${userId}, ${key}, ${JSON.stringify(value)}, now())
        on conflict (user_id, preference_key) do update set 
          preference_value = ${JSON.stringify(value)}, 
          updated_at = now()
        returning preference_key, preference_value
      `

      return NextResponse.json({
        success: true,
        key: result[0].preference_key,
        value: result[0].preference_value
      })
    } else {
      return NextResponse.json({ error: 'Key and value, or preferences object required' }, { status: 400 })
    }
  } catch (error) {
    logError('Preferences POST error:', error)
    // Neon read-only compute or transaction
    if ((error as any)?.code === '25006') {
      return NextResponse.json(
        { error: 'Database is read-only. Use a writable Neon endpoint to save preferences.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sql = getSql()
    const userId = await getUserIdFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const key = url.searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key parameter required' }, { status: 400 })
    }

    await sql`
      delete from user_preferences 
      where user_id = ${userId} and preference_key = ${key}
    `

    return NextResponse.json({ success: true, deleted: key })
  } catch (error) {
    logError('Preferences DELETE error:', error)
    if ((error as any)?.code === '25006') {
      return NextResponse.json(
        { error: 'Database is read-only. Use a writable Neon endpoint to delete preferences.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}