import { db } from '@/db/index'
import { paymentProviderConnections } from '@/shared/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { logError, logWarn, logInfo } from '@/lib/logger'
import Stripe from 'stripe'
import axios from 'axios'


type PaymentConnection = typeof paymentProviderConnections.$inferSelect

export interface RevenueMetrics {
  mrr: number // Monthly Recurring Revenue
  totalRevenue: number // Total revenue for period
  revenueGrowth: number // Percentage growth
  revenueByPeriod: Array<{
    period: string
    revenue: number
    transactions: number
  }>
  subscriptions: {
    active: number
    canceled: number
    new: number
  }
  providers: string[] // List of active providers
  lastUpdated: Date
}

export class RevenueTrackingService {
  /**
    * Calculate MRR across all user's connected accounts
    */
  static async calculateMRR(userId: string): Promise<number> {
    try {
      const connections = await this.getActiveConnections(userId)
      let totalMRR = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalMRR += await this.calculateStripeMRR(connection)
        } else if (connection.provider === 'paypal') {
          totalMRR += await this.calculatePayPalMRR(connection)
        }
        // Add more providers here as they are integrated
      }

      return Math.round(totalMRR * 100) / 100
    } catch (error) {
      logError('Error calculating aggregate MRR:', error)
      return 0
    }
  }

  /**
    * Calculate total revenue across all user's connected accounts
    */
  static async calculateRevenue(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const connections = await this.getActiveConnections(userId)
      let totalRevenue = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalRevenue += await this.calculateStripeRevenue(connection, startDate, endDate)
        } else if (connection.provider === 'paypal') {
          totalRevenue += await this.calculatePayPalRevenue(connection, startDate, endDate)
        }
      }

      return Math.round(totalRevenue * 100) / 100
    } catch (error) {
      logError('Error calculating aggregate revenue:', error)
      return 0
    }
  }

  /**
   * Calculate total MRR across platform
   */
  static async calculateGlobalMRR(): Promise<number> {
    try {
      const connections = await this.getAllActiveConnections()
      let totalMRR = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalMRR += await this.calculateStripeMRR(connection)
        } else if (connection.provider === 'paypal') {
          totalMRR += await this.calculatePayPalMRR(connection)
        }
      }

      return Math.round(totalMRR * 100) / 100
    } catch (error) {
      logError('Error calculating global MRR:', error)
      return 0
    }
  }

  /**
   * Calculate total revenue across platform
   */
  static async calculateGlobalRevenue(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const connections = await this.getAllActiveConnections()
      let totalRevenue = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalRevenue += await this.calculateStripeRevenue(connection, startDate, endDate)
        } else if (connection.provider === 'paypal') {
          totalRevenue += await this.calculatePayPalRevenue(connection, startDate, endDate)
        }
      }

      return Math.round(totalRevenue * 100) / 100
    } catch (error) {
      logError('Error calculating global revenue:', error)
      return 0
    }
  }

  /**
   * Internal helper for making authenticated PayPal requests with automatic 401 retry
   */
  private static async paypalRequest(
    connection: PaymentConnection,
    method: 'GET' | 'POST',
    endpoint: string,
    params: Record<string, any> = {},
    data: any = null
  ): Promise<any> {
    const baseUrl = process.env.PAYPAL_MODE === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com'

    const makeRequest = async (token: string) => {
      return await axios({
        method,
        url: `${baseUrl}${endpoint}`,
        params,
        data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    }

    try {
      if (!connection.access_token) throw new Error('No access token for PayPal')
      return await makeRequest(connection.access_token)
    } catch (error: any) {
      if (error.response?.status === 401 && connection.refresh_token) {
        logInfo('PayPal 401 detected, attempting token refresh...', { userId: connection.user_id })
        const refreshed = await this.refreshToken(connection.user_id, 'paypal')
        if (refreshed) {
          // Re-fetch the connection to get the NEW access token
          const [updatedConnection] = await db
            .select()
            .from(paymentProviderConnections)
            .where(eq(paymentProviderConnections.id, connection.id))
            .limit(1)
          
          if (updatedConnection?.access_token) {
            logInfo('PayPal token refreshed. Retrying request.', { userId: connection.user_id })
            return await makeRequest(updatedConnection.access_token)
          }
        }
      }
      throw error // Re-throw if refresh fails or wasn't a 401
    }
  }

  /**
    * Stripe-specific MRR calculation
    */
   /**
    * Stripe-specific MRR calculation
    * Iterates through ALL subscriptions and their items to calculate total MRR
    */
  private static async calculateStripeMRR(connection: PaymentConnection): Promise<number> {
    if (!connection.access_token) return 0
    try {
      const stripe = new Stripe(connection.access_token, {
        apiVersion: '2025-02-24.acacia'
      })

      let mrr = 0
      
      // Use auto-pagination to iterate through all active subscriptions
      for await (const subscription of stripe.subscriptions.list({
        status: 'active',
        limit: 100, // Max limit per page
        expand: ['data.items.data.price'] // Ensure we get price recurring info
      })) {
        
        // Iterate through all items in the subscription
        for (const item of subscription.items.data) {
          const price = item.price
          
          if (price && price.recurring && typeof price.unit_amount === 'number') {
             const quantity = item.quantity || 1
             const amount = (price.unit_amount / 100) * quantity
             const intervalCount = price.recurring.interval_count || 1
             
             // Normalize to monthly MRR using precise multipliers
             switch (price.recurring.interval) {
               case 'month':
                 mrr += amount / intervalCount
                 break
               case 'year':
                 mrr += amount / (intervalCount * 12)
                 break
               case 'week':
                 mrr += (amount / intervalCount) * 4.3333 
                 break
               case 'day': 
                 mrr += (amount / intervalCount) * 30.4375
                 break
               default:
                 logWarn(`Unknown recurring interval: ${price.recurring.interval}`, { subscriptionId: subscription.id })
                 break
             }
          }
        }
      }

      return mrr
    } catch (error) {
      logError('Stripe MRR calculation failed:', error)
      return 0
    }
  }

  /**
    * Stripe-specific revenue calculation
    */
  private static async calculateStripeRevenue(connection: PaymentConnection, startDate: Date, endDate: Date): Promise<number> {
    if (!connection.access_token) return 0
    try {
      const stripe = new Stripe(connection.access_token, {
        apiVersion: '2025-02-24.acacia'
      })

      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      })

      const countedPaymentIntentIds = new Set<string>()
      let total = 0

      for (const charge of charges.data) {
        if (charge.status === 'succeeded' && charge.paid) {
          total += charge.amount / 100
          if (charge.payment_intent && typeof charge.payment_intent === 'string') {
            countedPaymentIntentIds.add(charge.payment_intent)
          }
        }
      }

      // Check payment intents for direct payments without charges in list
      const paymentIntents = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      })

      for (const pi of paymentIntents.data) {
        if (pi.status === 'succeeded' && pi.amount && !countedPaymentIntentIds.has(pi.id)) {
          total += pi.amount / 100
        }
      }

      return total
    } catch (error) {
      logError('Stripe Revenue calculation failed:', error)
      return 0
    }
  }

  /**
    * PayPal-specific MRR calculation
    * Fetches active subscriptions and sums their monthly value
    */
  private static async calculatePayPalMRR(connection: PaymentConnection): Promise<number> {
    try {
      let mrr = 0
      let nextToken: string | undefined = undefined
      
      do {
        const response = await this.paypalRequest(connection, 'GET', '/v1/billing/subscriptions', {
          status: 'ACTIVE',
          total_required: 'true',
          page_size: 100,
          ...(nextToken ? { next_page_token: nextToken } : {})
        })

        const subscriptions = response.data.subscriptions || []
        for (const sub of subscriptions) {
          const amountValue = sub.billing_info?.last_payment?.amount?.value
          if (amountValue) {
            mrr += parseFloat(amountValue)
          }
        }

        const nextLink = (response.data.links || []).find((l: any) => l.rel === 'next')
        if (nextLink) {
           const url = new URL(nextLink.href)
           nextToken = url.searchParams.get('next_page_token') || undefined
        } else {
           nextToken = undefined
        }
      } while (nextToken)

      return mrr
    } catch (error: any) {
      logError('PayPal MRR calculation failed:', error)
      return 0
    }
  }

  /**
    * PayPal-specific revenue calculation
    * Fetches transaction history for a period
    */
  private static async calculatePayPalRevenue(
    connection: PaymentConnection, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    try {
      let total = 0
      let currentPage = 1
      let hasMore = true
      
      while (hasMore) {
        const response = await this.paypalRequest(connection, 'GET', '/v1/reporting/transactions', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          fields: 'transaction_info',
          page_size: 500,
          page: currentPage
        })

        const transactions = response.data.transaction_details || []
        for (const t of transactions) {
          const info = t.transaction_info
          if (info && info.transaction_status === 'S') {
            total += parseFloat(info.transaction_amount?.value || '0')
          }
        }

        // Check if we need to fetch more pages
        // The API returns total_pages or we check if we got a full page
        const totalPages = response.data.total_pages || 1
        hasMore = currentPage < totalPages && transactions.length > 0
        currentPage++
      }

      return total
    } catch (error) {
      logError('PayPal Revenue calculation failed:', error)
      return 0
    }
  }

  /**
    * Get comprehensive revenue metrics for a user
    */
  static async getRevenueMetrics(
    userId: string,
    periodDays: number = 30
  ): Promise<RevenueMetrics> {
    try {
      const connections = await this.getActiveConnections(userId)
      if (connections.length === 0) {
        return {
          mrr: 0,
          totalRevenue: 0,
          revenueGrowth: 0,
          revenueByPeriod: [],
          subscriptions: { active: 0, canceled: 0, new: 0 },
          providers: [],
          lastUpdated: new Date()
        }
      }

      const now = new Date()
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

      const currentRevenue = await this.calculateRevenue(userId, startDate, now)
      const previousRevenue = await this.calculateRevenue(userId, previousStartDate, startDate)
      const mrr = await this.calculateMRR(userId)

      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

      // Aggregate subscriptions (active total)
      let activeCount = 0
      for (const conn of connections) {
        if (conn.provider === 'stripe' && conn.access_token) {
          const stripe = new Stripe(conn.access_token, { apiVersion: '2025-02-24.acacia' })
          for await (const _sub of stripe.subscriptions.list({ status: 'active', limit: 100 })) {
            activeCount++
          }
        } else if (conn.provider === 'paypal') {
          try {
            const response = await this.paypalRequest(conn, 'GET', '/v1/billing/subscriptions', {
               status: 'ACTIVE',
               page_size: 1
            })
            activeCount += response.data.total_items || 0
          } catch (err) {
            logError('Failed to count PayPal subscriptions:', err)
          }
        }
      }

      // Update sync timestamps in batch
      const connectionIds = connections.map(c => c.id)
      if (connectionIds.length > 0) {
        await db.update(paymentProviderConnections)
          .set({ last_synced_at: new Date(), updated_at: new Date() })
          .where(inArray(paymentProviderConnections.id, connectionIds))
      }

      return {
        mrr,
        totalRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        revenueByPeriod: [], // TODO: implement multi-provider period aggregation
        subscriptions: {
          active: activeCount,
          canceled: 0,
          new: 0
        },
        providers: connections.map(c => c.provider),
        lastUpdated: new Date()
      }
    } catch (error) {
      logError('Error getting aggregate revenue metrics:', error)
      return {
        mrr: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        revenueByPeriod: [],
        subscriptions: { active: 0, canceled: 0, new: 0 },
        providers: [],
        lastUpdated: new Date()
      }
    }
  }

  /**
    * Get all active payment connections for a user
    */
  private static async getActiveConnections(userId: string): Promise<PaymentConnection[]> {
    return await db
      .select()
      .from(paymentProviderConnections)
      .where(
        and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.is_active, true)
        )
      )
  }

  /**
   * Get all active payment connections across platform
   */
  private static async getAllActiveConnections(): Promise<PaymentConnection[]> {
    return await db
      .select()
      .from(paymentProviderConnections)
      .where(eq(paymentProviderConnections.is_active, true))
  }

  /**
    * Refresh provider access token if expired
    */
  static async refreshToken(userId: string, provider: string): Promise<boolean> {
    try {
      const connections = await db
        .select()
        .from(paymentProviderConnections)
        .where(
          and(
            eq(paymentProviderConnections.user_id, userId),
            eq(paymentProviderConnections.provider, provider),
            eq(paymentProviderConnections.is_active, true)
          )
        )
        .limit(1)

      if (connections.length === 0 || !connections[0].refresh_token) {
        return false
      }

      const connection = connections[0]

      if (provider === 'paypal') {
        try {
          const baseUrl = process.env.PAYPAL_MODE === 'sandbox' 
            ? 'https://api-m.sandbox.paypal.com' 
            : 'https://api-m.paypal.com'

          // Use production environment variables for PayPal credentials
          const clientId = process.env.PAYPAL_CLIENT_ID
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET

          if (!clientId || !clientSecret) {
            logError('PayPal credentials missing for token refresh')
            return false
          }

          const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
          const response = await axios.post(`${baseUrl}/v1/oauth2/token`, 
            'grant_type=refresh_token&refresh_token=' + connection.refresh_token, 
            {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          )

          const { access_token, refresh_token, expires_in } = response.data
          const expiresAt = new Date(Date.now() + expires_in * 1000)

          await db.update(paymentProviderConnections)
            .set({ 
              access_token, 
              refresh_token: refresh_token || connection.refresh_token,
              expires_at: expiresAt,
              updated_at: new Date() 
            })
            .where(eq(paymentProviderConnections.id, connection.id))

          logInfo('PayPal token refreshed successfully', { userId })
          return true
        } catch (error) {
          logError('PayPal token refresh failed:', error)
          return false
        }
      }

      // Stripe doesn't typically expire access tokens in the same way (Connect use case)
      // but we handle it as a placeholder for other providers
      logWarn(`${provider} token refresh not implemented or needed`, { userId })
      return false
    } catch (error) {
      logError(`Error refreshing ${provider} token:`, error)
      return false
    }
  }
}
