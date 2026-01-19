# WooCommerce Quick Start

Quick reference for connecting your WooCommerce store to SoloSuccess AI.

## Prerequisites

- ✅ WordPress site with WooCommerce
- ✅ Admin access to WordPress
- ✅ SoloSuccess AI account

## Quick Connection Steps

1. **Get WooCommerce API Keys**
   - WordPress Admin → WooCommerce → Settings → Advanced → REST API
   - Click "Add key"
   - Description: "SoloSuccess AI Revenue Tracking"
   - Permissions: Read
   - Copy **Consumer Key** and **Consumer Secret**

2. **Connect in SoloSuccess AI**
   - Settings → Integrations → Revenue Tracking
   - Click "Connect WooCommerce"
   - Enter your store URL, Consumer Key, and Secret
   - Click "Connect"

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
| Invalid store URL | Use full URL: `https://yourstore.com` |
| Invalid credentials | Verify Consumer Key and Secret from WooCommerce REST API settings |
| Connection fails | Check that REST API is enabled and site is accessible |
| No data showing | Wait 5-10 minutes for initial sync |

## Disconnect

Settings → Integrations → Revenue Tracking → WooCommerce → Disconnect

**Need detailed instructions?** See [WooCommerce Setup Guide](./WOOCOMMERCE_SETUP.md)

