import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { paymentProviderConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const PostSchema = z.object({
  disconnect: z.boolean().optional(),
  storeUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  applicationId: z.string().optional(),
  applicationSecret: z.string().optional(),
  consumerKey: z.string().optional(),
  consumerSecret: z.string().optional()
})

/**
 * GET: Get connection status for a payment provider
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      const connection = await db
        .select()
        .from(paymentProviderConnections)
        .where(and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.provider, provider),
          eq(paymentProviderConnections.is_active, true)
        ))
        .limit(1)

      if (connection.length === 0) {
        return NextResponse.json({ connected: false })
      }

      const conn = connection[0]
      return NextResponse.json({
        connected: true,
        accountId: conn.account_id,
        accountName: conn.account_name,
        accountEmail: conn.account_email,
        lastSyncedAt: conn.last_synced_at
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logError('Payment Provider API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST: Connect or disconnect a payment provider
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const body = await request.json()
    const validation = PostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.errors }, { status: 400 })
    }

    const data = validation.data

    if (data.disconnect) {
      await db
        .update(paymentProviderConnections)
        .set({
          is_active: false,
          updated_at: new Date()
        })
        .where(and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.provider, provider)
        ))

      logInfo('Payment provider disconnected', { userId, provider })
      return NextResponse.json({ success: true })
    }

    // Store credentials and mark as connected.
    // This generic implementation supports various provider authentication schemes (OAuth tokens, API keys).
    // The specific 'connectionData' mapping happens below based on provider type.
    const existing = await db
      .select()
      .from(paymentProviderConnections)
      .where(and(
        eq(paymentProviderConnections.user_id, userId),
        eq(paymentProviderConnections.provider, provider)
      ))
      .limit(1)

    const connectionData: any = {
      user_id: userId,
      provider: provider,
      is_active: true,
      updated_at: new Date()
    }

    // Store provider-specific credentials based on provider type
    // Each provider uses different credential naming conventions
    switch (provider) {
      case 'shopify':
        if (data.storeUrl) connectionData.account_id = data.storeUrl
        if (data.apiKey) connectionData.access_token = data.apiKey
        if (data.apiSecret) connectionData.refresh_token = data.apiSecret
        break
      
      case 'paypal':
        if (data.clientId) connectionData.access_token = data.clientId
        if (data.clientSecret) connectionData.refresh_token = data.clientSecret
        break
      
      case 'square':
        if (data.applicationId) connectionData.access_token = data.applicationId
        if (data.applicationSecret) connectionData.refresh_token = data.applicationSecret
        break
      
      case 'woocommerce':
        if (data.storeUrl) connectionData.account_id = data.storeUrl
        if (data.consumerKey) connectionData.access_token = data.consumerKey
        if (data.consumerSecret) connectionData.refresh_token = data.consumerSecret
        break
      
      default:
        // For unknown providers, try to map common patterns
        if (data.apiKey) connectionData.access_token = data.apiKey
        if (data.apiSecret) connectionData.refresh_token = data.apiSecret
        if (data.clientId && !connectionData.access_token) connectionData.access_token = data.clientId
        if (data.clientSecret && !connectionData.refresh_token) connectionData.refresh_token = data.clientSecret
        if (data.storeUrl) connectionData.account_id = data.storeUrl
    }

    if (existing.length > 0) {
      await db
        .update(paymentProviderConnections)
        .set(connectionData)
        .where(eq(paymentProviderConnections.id, existing[0].id))
    } else {
      connectionData.created_at = new Date()
      await db.insert(paymentProviderConnections).values(connectionData)
    }

    logInfo('Payment provider connected', { userId, provider })
    return NextResponse.json({ 
      success: true,
      message: `${provider} account connected successfully`
    })
  } catch (error) {
    logError('Payment Provider Connection Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
