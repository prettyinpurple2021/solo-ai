# Stripe Connect Quick Start

Quick reference for connecting your Stripe account to SoloSuccess AI.

## Prerequisites

- ✅ Stripe account (free tier works)
- ✅ SoloSuccess AI account
- ✅ Platform administrator has enabled Stripe Connect

## Quick Connection Steps

1. **Go to Settings**
   - SoloSuccess AI → Settings → Integrations → Revenue Tracking

2. **Click "Connect Stripe Account"**

3. **Sign in to Stripe**
   - Use your existing Stripe account credentials
   - Or create a new Stripe account if needed

4. **Authorize Access**
   - Review permissions
   - Click "Connect my Stripe account"

5. **Done!**
   - Your revenue data will sync automatically
   - View metrics in Analytics → Revenue tab

## Connection Status

- 🟢 **Green**: Connected and syncing
- 🟡 **Yellow**: Connected but sync pending
- 🔴 **Red**: Not connected

## What Gets Synced?

- Monthly Recurring Revenue (MRR)
- Total revenue (last 7/30/90/365 days)
- Subscription metrics
- Revenue growth trends
- Transaction breakdowns

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Connection fails | Check redirect URI matches in Stripe Dashboard |
| No data showing | Wait 5-10 minutes for initial sync |
| Token expired | Disconnect and reconnect |
| Permission denied | Re-authorize with required permissions |

## Disconnect

Settings → Integrations → Revenue Tracking → Disconnect

**Need detailed instructions?** See [Stripe Connect Setup Guide](./STRIPE_CONNECT_SETUP.md)

