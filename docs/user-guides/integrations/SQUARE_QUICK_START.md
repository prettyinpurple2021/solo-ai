# Square Quick Start

Quick reference for connecting your Square account to SoloSuccess AI.

## Prerequisites

- ✅ Square account
- ✅ SoloSuccess AI account

## Quick Connection Steps

1. **Get Square API Credentials**
   - Go to [Square Developer Dashboard](https://developer.squareup.com/)
   - Sign in with your Square account
   - Create a new application
   - Copy your **Application ID** and **Application Secret**

2. **Connect in SoloSuccess AI**
   - Settings → Integrations → Revenue Tracking
   - Click "Connect Square"
   - Enter your Application ID and Secret
   - Authorize access on Square's page

3. **Done!**
   - Revenue data syncs automatically
   - View metrics in Analytics → Revenue tab

## Connection Status

- 🟢 **Green**: Connected and syncing
- 🟡 **Yellow**: Connected but sync pending
- 🔴 **Red**: Not connected

## What Gets Synced?

- Payment transactions
- Order information
- Revenue totals
- Transaction history

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Invalid credentials | Verify Application ID and Secret from Square Developer Dashboard |
| Connection fails | Check redirect URI matches in Square app settings |
| No data showing | Wait 5-10 minutes for initial sync |
| Permission denied | Ensure required OAuth scopes are enabled |

## Disconnect

Settings → Integrations → Revenue Tracking → Square → Disconnect

**Need detailed instructions?** See [Square Setup Guide](./SQUARE_SETUP.md)

