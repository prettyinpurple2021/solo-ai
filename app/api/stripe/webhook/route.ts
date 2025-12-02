import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import {
  getUserByStripeCustomerId, updateUserSubscription, getSubscriptionTierFromPriceId
} from '@/lib/stripe-db-utils'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Get Stripe instance
    const stripe = await getStripe()
    const signature = (await headers()).get('stripe-signature')
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    // Verify webhook signature

    let event: import('stripe').Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      logError('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as import('stripe').Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as import('stripe').Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as import('stripe').Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_CREATED:
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_UPDATED:
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      default:
        logInfo(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    logError('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: import('stripe').Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0].price.id

    // Get user by Stripe customer ID
    const user = await getUserByStripeCustomerId(customerId)
    if (!user) {
      logError('User not found for customer:', customerId)
      return
    }

    // Determine subscription tier based on price ID
    const tier = getSubscriptionTierFromPriceId(priceId)

    // Update user subscription in database
    const result = await updateUserSubscription(user.id, {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      subscription_tier: tier,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })

    if (result.success) {
      logInfo(`Subscription created for user ${user.id} (customer ${customerId}): ${tier}`)
    } else {
      logError('Failed to update user subscription:', result.error)
    }
  } catch (error) {
    logError('Error handling subscription created:', error)
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: import('stripe').Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0].price.id

    // Get user by Stripe customer ID
    const user = await getUserByStripeCustomerId(customerId)
    if (!user) {
      logError('User not found for customer:', customerId)
      return
    }

    // Determine subscription tier based on price ID
    const tier = getSubscriptionTierFromPriceId(priceId)

    // Update user subscription in database
    const result = await updateUserSubscription(user.id, {
      subscription_tier: tier,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })

    if (result.success) {
      logInfo(`Subscription updated for user ${user.id} (customer ${customerId}): ${tier}`)
    } else {
      logError('Failed to update user subscription:', result.error)
    }
  } catch (error) {
    logError('Error handling subscription updated:', error)
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: import('stripe').Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Get user by Stripe customer ID
    const user = await getUserByStripeCustomerId(customerId)
    if (!user) {
      logError('User not found for customer:', customerId)
      return
    }

    // Update user subscription in database - downgrade to launch tier
    const result = await updateUserSubscription(user.id, {
      subscription_tier: 'launch',
      subscription_status: 'canceled',
      stripe_subscription_id: undefined,
      cancel_at_period_end: false
    })

    if (result.success) {
      logInfo(`Subscription deleted for user ${user.id} (customer ${customerId}) - downgraded to launch`)
    } else {
      logError('Failed to update user subscription:', result.error)
    }
  } catch (error) {
    logError('Error handling subscription deleted:', error)
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as Stripe.Invoice).subscription as string

    // Update user payment status in database
    // await updateUserPaymentStatus(user.id, {
    //   last_payment_date: new Date(invoice.created * 1000),
    //   next_payment_date: new Date(invoice.period_end * 1000),
    //   payment_status: 'succeeded'
    // })

    logInfo(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`)
  } catch (error) {
    logError('Error handling payment succeeded:', error)
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as Stripe.Invoice).subscription as string

    // Update user payment status in database
    // await updateUserPaymentStatus(user.id, {
    //   payment_status: 'failed',
    //   payment_failure_reason: invoice.last_payment_error?.message
    // })

    // Send notification to user about failed payment
    // await sendPaymentFailedNotification(user.id, invoice)

    logError(`Payment failed for customer ${customerId}, subscription ${subscriptionId}`)
  } catch (error) {
    logError('Error handling payment failed:', error)
  }
}

// Handle customer created
async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    logInfo(`Customer created: ${customer.id}`)
    // Additional customer creation logic if needed
  } catch (error) {
    logError('Error handling customer created:', error)
  }
}

// Handle customer updated
async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    logInfo(`Customer updated: ${customer.id}`)
    // Additional customer update logic if needed
  } catch (error) {
    logError('Error handling customer updated:', error)
  }
}
