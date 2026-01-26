import { db } from '@/db'
import { paymentProviderConnections } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { logError, logWarn } from '@/lib/logger'
import Stripe from 'stripe'

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
        expand: ['data.items'] // Ensure we get all line items
      })) {
        
        // Iterate through all items in the subscription
        for (const item of subscription.items.data) {
          const price = item.price
          
          if (price && price.recurring && typeof price.unit_amount === 'number') {
             const quantity = item.quantity || 1
             const amount = (price.unit_amount / 100) * quantity
             
             // Normalize to monthly MRR
             switch (price.recurring.interval) {
               case 'month':
                 mrr += amount * (price.recurring.interval_count || 1) // Handle "every 3 months" etc? No, usually handled by division if it's billing frequency. 
                 // Wait, interval_count of 3 months means billing every 3 months. So monthly revenue is Amount / 3.
                 // Correction:
                 const intervalCount = price.recurring.interval_count || 1
                 mrr += amount / intervalCount
                 break
               case 'year':
                 mrr += amount / 12
                 break
               case 'week':
                 mrr += amount * 4.33 // Avg weeks in a month
                 break
               case 'day': 
                 mrr += amount * 30 // Avg days in a month
                 break
               default:
                 // unexpected interval, default to straight addition if unknown (safest fallback or log warning)
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
    * PayPal-specific MRR calculation (Placeholder for real API)
    */
  private static async calculatePayPalMRR(connection: PaymentConnection): Promise<number> {
    // Future: PayPal Subscription API integration
    // Current V1 implementation focuses on Stripe.
    logWarn('PayPal MRR calculation deferred to V2', { connectionId: connection.id })
    return 0
  }

  /**
    * PayPal-specific revenue calculation (Placeholder for real API)
    */
  private static async calculatePayPalRevenue(connection: PaymentConnection, arg_Date: Date, arg_Date: Date): Promise<number> {
    // Future: PayPal Orders/Transactions API integration
    logWarn('PayPal Revenue calculation deferred to V2', { connectionId: connection.id })
    return 0
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
          const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 })
          activeCount += subs.data.length
          // Note: In production, we should handle pagination here too
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

      // Future: Implement provider-specific OAuth refresh (e.g. /oauth/token for Stripe)
      // Current behavior requires manual reconnection on expiry.
      logWarn(`${provider} token refresh deferred, user needs to reconnect`, { userId })
      return false
    } catch (error) {
      logError(`Error refreshing ${provider} token:`, error)
      return false
    }
  }
}
