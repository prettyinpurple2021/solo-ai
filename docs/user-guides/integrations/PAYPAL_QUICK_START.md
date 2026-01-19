# PayPal Quick Start

Quick reference for connecting your PayPal Business account to SoloSuccess AI.

## Prerequisites

- ✅ PayPal Business account
- ✅ SoloSuccess AI account

## Quick Connection Steps

1. **Get PayPal API Credentials**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Sign in with your Business account
   - Create a new app (App Type: Merchant)
   - Copy your **Client ID** and **Secret**

2. **Connect in SoloSuccess AI**
   - Settings → Integrations → Revenue Tracking
   - Click "Connect PayPal"
   - Enter your Client ID and Secret
   - Authorize access on PayPal's page

3. **Done!**
   - Revenue data syncs automatically
   - View metrics in Analytics → Revenue tab

## Connection Status

- 🟢 **Green**: Connected and syncing
- 🟡 **Yellow**: Connected but sync pending
- 🔴 **Red**: Not connected

## What Gets Synced?

- Transaction history
- Payment amounts and dates
- Revenue totals
- Payment status

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Invalid credentials | Verify Client ID and Secret from PayPal Developer Dashboard |
| Connection fails | Check redirect URI matches in PayPal app settings |
| No data showing | Wait 5-10 minutes for initial sync |
| Permission denied | Ensure you're using a Business account (not Personal) |

## Disconnect

Settings → Integrations → Revenue Tracking → PayPal → Disconnect

**Need detailed instructions?** See [PayPal Setup Guide](./PAYPAL_SETUP.md)

