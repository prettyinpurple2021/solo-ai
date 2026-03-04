import Stripe from 'stripe';

export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

// Conditionally initialize stripe to prevent app crashes when env vars are missing locally
export const stripe = isStripeConfigured() 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  : (null as unknown as Stripe);

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
