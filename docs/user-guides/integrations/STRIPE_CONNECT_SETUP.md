# Stripe Connect Setup Guide

This guide will help you connect your own Stripe account to SoloSuccess AI for revenue tracking and analytics.

## Overview

SoloSuccess AI uses **Stripe Connect** to allow you to connect **your own Stripe account** securely. This enables you to:

- ✅ Track **your own** revenue and MRR
- ✅ Monitor **your own** subscription metrics
- ✅ Analyze **your own** payment data
- ✅ View **your own** financial analytics

**Your Stripe data remains private** - SoloSuccess AI only accesses it with your explicit permission.

---

## Step 1: Set Up Stripe Connect (Platform Setup)

**Note:** This is a one-time setup that your SoloSuccess AI administrator needs to complete. If you're the platform owner, follow these steps:

### 1.1 Create a Stripe Platform Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. If you don't have a Stripe account, create one
3. Navigate to **Settings → Connect** (or go to [Stripe Connect](https://dashboard.stripe.com/settings/applications/overview))

### 1.2 Enable Stripe Connect

1. Click **"Get started"** or **"Enable Connect"**
2. Choose **"Express accounts"** (recommended) or **"Standard accounts"**
   - Express: Faster onboarding, Stripe handles most of the UI
   - Standard: More control, you handle more of the UI
3. Complete the Connect onboarding

### 1.3 Get Your Client ID

1. In **Settings → Connect**, find your **Client ID**
2. It looks like: `ca_xxxxxxxxxxxxxxxxxxxxxxxx`
3. Copy this value - you'll need it for the environment variable

### 1.4 Configure Redirect URI

1. In **Settings → Connect → Redirects**, add:
   ```
   https://yourdomain.com/api/integrations/stripe/connect/callback
   ```
   (Replace `yourdomain.com` with your actual domain)

### 1.5 Set Environment Variables

Your SoloSuccess AI administrator needs to add these to `.env.local`:

```bash
# Stripe Connect Configuration
STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxx  # Your platform's secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx  # Optional: for webhooks
```

---

## Step 2: Connect Your Stripe Account (User Setup)

Once Stripe Connect is configured on the platform, you can connect your own Stripe account:

### 2.1 Go to Settings

1. Log in to SoloSuccess AI
2. Navigate to **Settings → Integrations → Revenue Tracking**
3. Click **"Connect Stripe Account"**

### 2.2 Authorize Connection

1. You'll be redirected to Stripe's authorization page
2. **Sign in to your Stripe account** (or create one if you don't have it)
3. Review the permissions being requested:
   - **Read access** to your account information
   - **Read access** to charges, subscriptions, and payment data
   - **Write access** (optional, for creating subscriptions if needed)
4. Click **"Connect my Stripe account"**

### 2.3 Complete Connection

1. You'll be redirected back to SoloSuccess AI
2. Your Stripe account will be connected
3. Revenue data will start syncing automatically

---

## What Data Is Accessed?

SoloSuccess AI requests the following permissions:

### Read-Only Access:
- ✅ Account information (name, email, business type)
- ✅ Charges and payment intents (amount, date, status)
- ✅ Subscriptions (plan, status, MRR)
- ✅ Customers (count, total)
- ✅ Revenue data (for analytics)

### Write Access (Optional):
- ✅ Create subscriptions
- ✅ Update subscriptions
- ✅ Cancel subscriptions

**You can revoke access at any time** from your Stripe Dashboard → Settings → Connect → Connected Accounts.

---

## Security & Privacy

### Data Privacy:
- ✅ Your Stripe data is **never stored** in SoloSuccess AI's database (except connection tokens)
- ✅ All API calls use **OAuth tokens** that you control
- ✅ You can **disconnect** at any time
- ✅ SoloSuccess AI **never sees** your Stripe secret keys

### Token Storage:
- OAuth access tokens are encrypted and stored securely
- Tokens are scoped to specific permissions
- You can revoke access from Stripe Dashboard

---

## Revenue Tracking Features

Once connected, you can:

1. **View MRR (Monthly Recurring Revenue)**
   - Calculated from active subscriptions
   - Automatically converted to monthly amounts

2. **Track Total Revenue**
   - View revenue for any time period (7 days, 30 days, 90 days, 1 year)
   - See revenue growth trends

3. **Subscription Analytics**
   - Active subscriptions count
   - New subscriptions
   - Canceled subscriptions

4. **Revenue Breakdown**
   - Daily, weekly, or monthly breakdowns
   - Transaction counts
   - Growth percentages

---

## Troubleshooting

### "Stripe Connect not configured"
- Your platform administrator needs to complete Step 1 above
- Make sure `STRIPE_CONNECT_CLIENT_ID` is set in environment variables

### "Connection failed"
- Check that the redirect URI in Stripe Dashboard matches exactly
- Ensure you're signed in to the correct Stripe account
- Try disconnecting and reconnecting

### "No data showing"
- Wait 5-10 minutes for initial sync
- Check that your Stripe account has transactions
- Verify the connection status in Settings

### "Token expired"
- Disconnect and reconnect your Stripe account
- Stripe Connect tokens typically don't expire, but may need refresh

---

## Revoking Access

To disconnect your Stripe account:

1. Go to **Settings → Integrations → Revenue Tracking**
2. Click **"Disconnect Stripe Account"**
3. Confirm disconnection

Or revoke from Stripe Dashboard:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Settings → Connect → Connected Accounts**
3. Find SoloSuccess AI and click **"Revoke access"**

---

## FAQ

**Q: Do I need a paid Stripe account?**  
A: No, you can use a free Stripe account. Stripe Connect works with any Stripe account.

**Q: Will SoloSuccess AI charge fees?**  
A: SoloSuccess AI does not charge any fees. Stripe's normal processing fees apply as usual.

**Q: Can I connect multiple Stripe accounts?**  
A: Currently, you can connect one Stripe account per SoloSuccess AI account. Multiple account support may be added in the future.

**Q: Is my payment data secure?**  
A: Yes, all communication uses Stripe's secure OAuth protocol. SoloSuccess AI never stores your payment card information.

**Q: Can SoloSuccess AI make charges on my behalf?**  
A: Only if you grant write permissions. By default, SoloSuccess AI only requests read permissions for analytics.

---

## Need Help?

- **Stripe Connect Documentation**: [https://stripe.com/docs/connect](https://stripe.com/docs/connect)
- **Stripe Support**: [https://support.stripe.com/](https://support.stripe.com/)
- **SoloSuccess AI Support**: support@solobossai.fun

---

**Last Updated**: December 30, 2025

