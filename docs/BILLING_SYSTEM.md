# Billing System & Subscription Management

## Overview

SoloSuccess AI implements a three-tier subscription model with Stripe integration, usage tracking, and flexible subscription management. This guide covers the billing architecture, subscription tiers, operational workflows, and troubleshooting.

**Key Files**:
- `src/app/dashboard/billing/page.tsx` - Billing UI
- `src/lib/subscription-utils.ts` - Subscription logic
- `src/api/billing/*` - Billing API endpoints
- `src/lib/stripe.ts` - Stripe integration

## Subscription Tiers

### 1. Launch Tier (Free)

**Price**: $0/month  
**Target**: New entrepreneurs starting their journey

**Included Features**:
- Basic Business Plan
- 3 Competitor Analyses per month
- Limited AI Credits (50 credits/month)
- Community access
- Email support

**Stripe Configuration**: No Stripe product needed (free tier handled separately)

### 2. Accelerator Tier (Standard)

**Price**: $29/month  
**Target**: Growing businesses with increasing needs

**Included Features**:
- Advanced Business Plan
- 10 Competitor Analyses per month
- Priority AI Support (24-hour response)
- Market Intelligence dashboard
- API access (basic)
- Unlimited AI Credits
- Email + Slack support

**Stripe Product ID**: Retrieved from `NEXT_PUBLIC_STRIPE_ACCELERATOR_PRICE_ID` environment variable

### 3. Dominator Tier (Premium)

**Price**: $99/month  
**Target**: Fully-scaled businesses needing complete toolset

**Included Features**:
- Unlimited Everything
- Dedicated Strategist (weekly 1-on-1)
- Advanced API access (webhooks, rate limit: 10k/day)
- White Label Reports
- Custom integrations
- Priority support (1-hour response)
- Advanced analytics and forecasting

**Stripe Product ID**: Retrieved from `NEXT_PUBLIC_STRIPE_DOMINATOR_PRICE_ID` environment variable

## Billing Architecture

### Data Flow

```
User Dashboard
      ↓
Billing Page (Next.js)
      ↓
Billing API Routes
      ├─ /api/billing/subscription (GET)
      ├─ /api/billing/checkout (POST)
      ├─ /api/billing/portal (POST)
      └─ /api/billing/cancel-subscription (POST)
      ↓
Stripe Integration
      ├─ Create checkout session
      ├─ Manage subscription
      └─ Webhooks (payment, cancellation)
      ↓
Database
      └─ Store subscription info in user profile
```

### Key Database Fields

```typescript
// In user profile
subscriptions?: {
  tier: "launch" | "accelerator" | "dominator"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  usageCount?: number  // AI credits used
  usageLimit?: number  // AI credits allowed
}
```

## Billing API Endpoints

### GET `/api/billing/subscription`

**Description**: Fetch current subscription info for authenticated user

**Response** (UnifiedSubscriptionPayload):
```typescript
{
  tier: string                    // "launch" | "accelerator" | "dominator"
  status: string                  // "active" | "inactive" | "past_due" | "cancelled"
  current_period_end: string | null  // ISO 8601 date string
  cancel_at_period_end: boolean
  interval: string                // "monthly" or other billing period
  subscription: {
    subscription_tier: string
    subscription_status: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    current_period_start: string | null  // ISO 8601 date string
    current_period_end: string | null    // ISO 8601 date string
    cancel_at_period_end: boolean
    stripe_subscription?: unknown         // Optional Stripe subscription object
    is_admin_override?: boolean           // True if using admin bypass
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `404`: No subscription found (new user)

**Usage**:
```typescript
const response = await fetch('/api/billing/subscription', {
  credentials: 'include'
})
const subscription = await response.json()
```

### POST `/api/billing/checkout`

**Description**: Initiate Stripe checkout for tier upgrade

**Request Body**:
```typescript
{
  tier: "accelerator" | "dominator"
}
```

**Response**:
```typescript
{
  success: true
  url: "https://checkout.stripe.com/..." // Stripe checkout URL
}
```

**Error Responses**:
- `400`: Invalid tier or missing Stripe price IDs (check env vars)
- `401`: Not authenticated
- `500`: Stripe API error

**Usage**:
```typescript
const response = await fetch('/api/billing/checkout', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier: 'accelerator' })
})

if (response.ok) {
  const { url } = await response.json()
  window.location.href = url  // Redirect to Stripe
}
```

### POST `/api/billing/portal`

**Description**: Open Stripe Customer Portal for existing subscriptions

**Response**:
```typescript
{
  success: true
  url: "https://billing.stripe.com/..." // Stripe portal URL
}
```

**Error Responses**:
- `401`: Not authenticated
- `404`: No Stripe customer (user on free tier)
- `500`: Stripe API error

**Usage**:
```typescript
const response = await fetch('/api/billing/portal', {
  method: 'POST',
  credentials: 'include'
})

if (response.ok) {
  const { url } = await response.json()
  window.location.href = url
}
```

### POST `/api/billing/cancel-subscription`

**Description**: Cancel subscription at end of current period (downgrade to free)

**Response**:
```typescript
{
  success: true
  message: "Subscription will cancel at end of period"
  cancelDate: Date
}
```

**Error Responses**:
- `401`: Not authenticated
- `404`: No active subscription (already free)
- `500`: Stripe API error

**Usage**:
```typescript
const response = await fetch('/api/billing/cancel-subscription', {
  method: 'POST',
  credentials: 'include'
})

if (response.ok) {
  const { cancelDate } = await response.json()
  console.log(`Subscription cancels on ${cancelDate}`)
}
```

## Payment Processing Workflow

### Upgrade Flow

1. **User clicks "Upgrade Now"** on Billing page
2. **Frontend calls** `/api/billing/checkout` with tier
3. **Backend creates Stripe checkout session**:
   - Retrieves Stripe price ID from environment
   - Sets success/cancel URLs
   - Includes user email and metadata
4. **Stripe checkout opens** in browser
5. **User enters payment info** on Stripe-hosted page
6. **Stripe webhook** triggers on payment success:
   - Creates/updates subscription in database
   - Marks user tier as "accelerator" or "dominator"
   - Logs audit trail
7. **User redirected** to success page
8. **Billing dashboard** shows new tier

### Downgrade Flow

1. **User clicks "Downgrade"** on Billing page
2. **Frontend calls** `/api/billing/cancel-subscription`
3. **Backend calls** Stripe API with `cancel_at_period_end: true`
4. **Subscription remains active** until period end
5. **On period end**, Stripe webhook triggers:
   - Updates user tier to "launch" (free)
   - Clears usage limits
   - Logs downgrade
6. **User sees "Current Plan: Launch"** next login

### Webhook Handling

SoloSuccess AI listens for these Stripe webhook events:

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Create subscription in DB |
| `customer.subscription.updated` | Update subscription details |
| `customer.subscription.deleted` | Downgrade to free tier |
| `invoice.payment_succeeded` | Log successful payment |
| `invoice.payment_failed` | Send payment failure notification |

## Usage Tracking

### How Usage Limits Work

Each tier has different AI credit allowances:

| Tier | Monthly Credits | Renewal | Overage |
|------|-----------------|---------|---------|
| Launch | 50 | Monthly | Soft limit (slows responses) |
| Accelerator | Unlimited | N/A | N/A |
| Dominator | Unlimited | N/A | N/A |

### API Usage Tracking

```typescript
// src/lib/usage-tracking.ts
async function trackUsage(userId: string, creditsUsed: number) {
  // Increment usage count
  // Check against tier limits
  // Return true if allowed, false if exceeded
}
```

**Integration**:
```typescript
// Before each AI API call
const allowed = await trackUsage(userId, estimatedTokens)

if (!allowed && userTier === 'launch') {
  return {
    error: 'Usage limit reached. Upgrade to continue.',
    nextRenewal: calculateNextRenewalDate(user)
  }
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...           # Live secret key
NEXT_PUBLIC_STRIPE_KEY=pk_live_...      # Public key (safe to expose)

# Pricing
NEXT_PUBLIC_STRIPE_ACCELERATOR_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_DOMINATOR_PRICE_ID=price_...

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_...         # For verifying webhooks
```

### Setting Up Stripe Price IDs

1. **Log into Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate**: Products → Create Product
3. **Configure**:
   - Product name: "SoloSuccess AI - Accelerator"
   - Pricing: Standard pricing ($29/month)
   - Billing period: Monthly
4. **Copy price ID** (format: `price_1ABC...`)
5. **Add to environment variables** in Vercel

## Troubleshooting

### Issue: Checkout Button Shows "Checkout unavailable"

**Cause**: Missing or incorrect Stripe price IDs in environment

**Fix**:
```bash
# 1. Verify env variables in Vercel dashboard
# 2. Confirm price IDs exist in Stripe
# 3. Redeploy if recently updated

vercel env pull  # Pull latest env vars
```

### Issue: User Tier Not Updating After Payment

**Cause**: Stripe webhook not firing or not being processed

**Diagnosis**:
```bash
# 1. Check Stripe webhook deliveries
# Dashboard → Developers → Webhooks → Select endpoint → View deliveries

# 2. Check application logs for webhook errors
vercel logs --follow

# 3. Manually trigger webhook replay
# Dashboard → Developers → Webhooks → Select event → Resend
```

**Fix**:
```typescript
// Manually update user tier if webhook failed
await db.user.update({
  where: { id: userId },
  data: {
    subscriptions: {
      tier: 'accelerator',
      stripeSubscriptionId: 'sub_...'
    }
  }
})
```

### Issue: User Sees "No Active Subscription" When They Paid

**Cause**: Stripe customer ID not stored in database

**Diagnosis**:
```typescript
// Check Stripe customer creation
const customer = await stripe.customers.retrieve(stripeCustomerId)
console.log(customer)  // Should show subscription
```

**Fix**:
```typescript
// Sync Stripe subscription to database
const subscription = await stripe.subscriptions.retrieve(stripeSubId)
await syncSubscriptionToDb(userId, subscription)
```

### Issue: Billing Portal Shows Wrong Subscription Details

**Cause**: Customer Portal information out of sync with Stripe

**Fix**:
```bash
# In Stripe Dashboard:
# 1. Navigate to Customers
# 2. Find customer by email
# 3. Verify subscription and billing details
# 4. Update if needed directly in Stripe
```

## Admin Tasks

### Viewing User Subscriptions

```typescript
// In admin dashboard or script
const user = await db.user.findUnique({
  where: { id: userId },
  include: { subscriptions: true }
})

console.log(`${user.name} - Tier: ${user.subscriptions?.tier}`)
```

### Manually Upgrading User

```typescript
// For testing or customer service
const updatedUser = await db.user.update({
  where: { id: userId },
  data: {
    subscriptions: {
      tier: 'dominator',
      // Note: Don't set stripeSubscriptionId unless from Stripe
    }
  }
})
```

### Checking Revenue Metrics

```bash
# In Stripe Dashboard:
# 1. Reports → Revenue Recognition
# 2. Filter by date range
# 3. See total MRR, churn, new subscriptions
```

### Creating Test Subscriptions

```bash
# Use Stripe test mode with test card
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits

# Webhook simulation:
stripe trigger customer.subscription.created
```

## Best Practices

1. **Always use checkout sessions, not direct token handling**
   - Stripe checkout is PCI-compliant and secure
   - Never store raw card data

2. **Handle webhooks asynchronously**
   - Webhook must respond with 200 within 5 seconds
   - Process subscription updates in background queue

3. **Test tier limits thoroughly**
   - Verify Launch users hit credit limit
   - Confirm Accelerator/Dominator have unlimited credits

4. **Monitor webhook health**
   - Set up alerts for failed webhook deliveries
   - Regularly review Stripe dashboard webhook status

5. **Implement retry logic for API calls**
   - Stripe is highly available but network errors happen
   - Retry with exponential backoff

## Performance & Scalability

- **Checkout creation**: ~500ms (Stripe API call)
- **Portal redirect**: ~200ms
- **Subscription queries**: ~50ms (database cache recommended)
- **Webhook processing**: <5 seconds (background job recommended)

**At scale**:
- Cache subscription tier in Redis (5-minute TTL)
- Queue webhook processing with Bull or Temporal
- Monitor Stripe API rate limits (no strict limits, but be reasonable)

## Security Considerations

1. **Never expose Stripe secret key** in frontend or version control
2. **Always verify webhook signatures** before processing
3. **Use Stripe test mode** for development
4. **Rotate webhook endpoints** when secrets are compromised
5. **Audit payment history** regularly for suspicious patterns

## Related Documentation

- [Stripe Integration Guide](https://stripe.com/docs/billing) - Official Stripe docs
- [Subscription Utils Guide](./SUBSCRIPTION_UTILS.md) - Code-level subscription helpers
- [Finn Agent Guide](./FINN_AGENT_GUIDE.md) - AI-powered financial recommendations
- [Deployment Configuration](./deployment/ENV_VARS_VERCEL_AND_RAILWAY.md) - Environment setup
