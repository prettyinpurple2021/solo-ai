# Shopify Quick Start

Quick reference for connecting your Shopify store to SoloSuccess AI.

## Prerequisites

- ✅ Shopify store
- ✅ SoloSuccess AI account

## Quick Connection Steps

1. **Get Shopify API Credentials**
   - Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
   - Create a new app manually
   - Enable scopes: `read_orders`, `read_analytics`
   - Copy your **API key** and **API secret key**

2. **Connect in SoloSuccess AI**
   - Settings → Integrations → Revenue Tracking
   - Click "Connect Shopify"
   - Enter your store domain, API key, and secret
   - Authorize access on Shopify's page

3. **Done!**
   - Revenue data syncs automatically
   - View metrics in Analytics → Revenue tab

## Connection Status

- 🟢 **Green**: Connected and syncing
- 🟡 **Yellow**: Connected but sync pending
- 🔴 **Red**: Not connected

## What Gets Synced?

- Order information
- Sales revenue
- Revenue analytics
- Sales trends

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Invalid store domain | Use full domain: `yourstore.myshopify.com` |
| Invalid credentials | Verify API key and secret from Shopify Partners Dashboard |
| Connection fails | Check redirect URI matches in Shopify app settings |
| No data showing | Wait 5-10 minutes for initial sync |

## Disconnect

Settings → Integrations → Revenue Tracking → Shopify → Disconnect

**Need detailed instructions?** See [Shopify Setup Guide](./SHOPIFY_SETUP.md)

