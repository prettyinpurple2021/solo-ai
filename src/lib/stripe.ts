import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Updated to a more recent stable version
});

export const PRICE_IDS = {
  accelerator: {
    monthly: process.env.STRIPE_ACCELERATOR_PRICE_ID || '',
    yearly: process.env.STRIPE_ACCELERATOR_YEARLY_PRICE_ID || ''
  },
  dominator: {
    monthly: process.env.STRIPE_DOMINATOR_PRICE_ID || '',
    yearly: process.env.STRIPE_DOMINATOR_YEARLY_PRICE_ID || ''
  }
};

export const SUBSCRIPTION_TIERS = {
  LAUNCH: {
    id: 'launch',
    price: 0,
    stripePriceId: '',
    stripeYearlyPriceId: '',
    limits: {
      dailyConversations: 5,
      aiAgents: 1,
      fileStorage: '100MB'
    }
  },
  ACCELERATOR: {
    id: 'accelerator',
    price: 19,
    stripePriceId: PRICE_IDS.accelerator.monthly,
    stripeYearlyPriceId: PRICE_IDS.accelerator.yearly,
    limits: {
      dailyConversations: 50,
      aiAgents: 5,
      fileStorage: '10GB'
    }
  },
  DOMINATOR: {
    id: 'dominator',
    price: 29,
    stripePriceId: PRICE_IDS.dominator.monthly,
    stripeYearlyPriceId: PRICE_IDS.dominator.yearly,
    limits: {
      dailyConversations: -1,
      aiAgents: 10,
      fileStorage: '100GB'
    }
  }
};

export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

export const listStripeCustomers = async (limit = 10, startingAfter?: string) => {
  if (!isStripeConfigured()) return [];
  const params: Stripe.CustomerListParams = { limit };
  if (startingAfter) params.starting_after = startingAfter;
  const customers = await stripe.customers.list(params);
  return customers.data;
};

export const getStripeCustomersPaginated = async (limit = 10, startingAfter?: string) => {
  if (!isStripeConfigured()) return { customers: [], hasMore: false };
  const params: Stripe.CustomerListParams = { limit };
  if (startingAfter) params.starting_after = startingAfter;
  
  const customers = await stripe.customers.list(params);
  return {
    customers: customers.data,
    hasMore: customers.has_more,
    nextStartingAfter: customers.data.length > 0 ? customers.data[customers.data.length - 1].id : undefined
  };
};

export const getStripe = () => stripe;

export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded'
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) => {
    if (!stripe) throw new Error('Stripe not configured');
    return await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });
};

export const createBillingPortalSession = async (
    customerId: string,
    returnUrl: string
) => {
    if (!stripe) throw new Error('Stripe not configured');
    return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
    });
};
