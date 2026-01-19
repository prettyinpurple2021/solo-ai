# Shopify Integration Setup Guide

This guide will help you connect your Shopify store to SoloSuccess AI for revenue tracking.

## Overview

SoloSuccess AI uses Shopify's Admin API to securely access your store's sales data. This enables you to:

- ✅ Track revenue from Shopify sales
- ✅ Monitor order activity
- ✅ Analyze revenue trends
- ✅ View sales history

**Your Shopify data remains private** - SoloSuccess AI only accesses it with your explicit permission.

---

## Prerequisites

- ✅ Shopify store (any plan works)
- ✅ Access to Shopify Admin
- ✅ SoloSuccess AI account

---

## Step 1: Create a Shopify App

### 1.1 Access Shopify Partners Dashboard

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Sign in with your Shopify account
3. If you don't have a Partners account, click **"Sign Up"** and follow the prompts

### 1.2 Create a New App

1. Click **"Apps"** in the left sidebar
2. Click **"Create app"** button
3. Choose **"Create app manually"**
4. Fill in the app details:
   - **App name**: `SoloSuccess AI Revenue Tracking` (or any name you prefer)
   - **App URL**: `https://yourdomain.com` (your SoloSuccess AI domain)
5. Click **"Create app"**

### 1.3 Configure API Scopes

1. In your app settings, go to **"Configuration"** tab
2. Under **"Admin API integration scopes"**, enable:
   - `read_orders` - Read order information
   - `read_analytics` - Read analytics data
   - `read_customers` - Read customer information (optional)
3. Click **"Save"**

### 1.4 Get Your API Credentials

1. Go to **"API credentials"** tab
2. You'll see:
   - **API key** - Copy this value
   - **API secret key** - Click **"Reveal"** to show and copy this value

**⚠️ Important:** Keep these credentials secure. Never share them publicly.

---

## Step 2: Set Up OAuth Redirect

### 2.1 Configure App URL

1. In **"Configuration"** tab, set:
   - **App URL**: `https://yourdomain.com/api/integrations/payment-providers/shopify`
   - **Allowed redirection URL(s)**: 
     ```
     https://yourdomain.com/api/integrations/payment-providers/shopify/callback
     ```

### 2.2 Install App on Your Store

1. Go to **"Overview"** tab in your app
2. Click **"Install app"** button
3. Select your Shopify store
4. Review and approve the requested permissions

---

## Step 3: Connect to SoloSuccess AI

### 3.1 Go to Settings

1. Log in to SoloSuccess AI
2. Navigate to **Settings → Integrations → Revenue Tracking**
3. Find the **Shopify** card
4. Click **"Connect Shopify"**

### 3.2 Enter Store Information

1. A dialog will appear asking for:
   - **Store Domain**: Your Shopify store domain (e.g., `yourstore.myshopify.com`)
   - **API Key**: Paste your Shopify API key
   - **API Secret**: Paste your Shopify API secret key
2. Click **"Connect"**

### 3.3 Authorize Access

1. You'll be redirected to Shopify's authorization page
2. **Sign in to your Shopify account**
3. Review the permissions being requested:
   - Read orders
   - Read analytics
   - Read customers (if enabled)
4. Click **"Install app"**

### 3.4 Complete Connection

1. You'll be redirected back to SoloSuccess AI
2. Your Shopify store will be connected
3. Revenue data will start syncing automatically

---

## What Data Is Accessed?

SoloSuccess AI requests the following permissions:

### Read-Only Access:
- ✅ Order information
- ✅ Sales data
- ✅ Revenue analytics
- ✅ Customer information (optional)

**SoloSuccess AI cannot:**
- ❌ Create or modify orders
- ❌ Access payment methods
- ❌ Modify store settings
- ❌ Access financial account information

---

## Security & Privacy

### Data Privacy:
- ✅ All API calls use **OAuth tokens** that you control
- ✅ Credentials are encrypted and stored securely
- ✅ You can **revoke access** at any time
- ✅ SoloSuccess AI **never sees** your Shopify password

### Token Storage:
- OAuth access tokens are encrypted and stored securely
- Tokens are scoped to specific permissions
- You can revoke access from Shopify Admin

---

## Revenue Tracking Features

Once connected, you can:

1. **View Total Revenue**
   - See revenue from Shopify sales
   - Filter by date range (7 days, 30 days, 90 days, 1 year)

2. **Order Analytics**
   - Order counts
   - Average order value
   - Revenue trends

3. **Sales Breakdown**
   - Revenue by product
   - Revenue by channel
   - Revenue by customer segment

---

## Troubleshooting

### "Invalid Store Domain"
- Ensure you're using the full store domain (e.g., `yourstore.myshopify.com`)
- Don't include `https://` or trailing slashes

### "Invalid API Key or Secret"
- Double-check that you copied the API key and secret correctly
- Ensure there are no extra spaces or line breaks
- Verify you're using credentials from the correct Shopify app

### "Connection failed"
- Check that the redirect URI in Shopify app matches exactly
- Ensure you're signed in to the correct Shopify account
- Try disconnecting and reconnecting

### "No data showing"
- Wait 5-10 minutes for initial sync
- Check that your Shopify store has orders
- Verify the connection status in Settings

### "Permission denied"
- Ensure your Shopify app has the required scopes enabled
- Re-install the app with required permissions

---

## Revoking Access

To disconnect your Shopify store:

1. Go to **Settings → Integrations → Revenue Tracking**
2. Find the **Shopify** card
3. Click **"Disconnect"**
4. Confirm disconnection

Or uninstall from Shopify Admin:
1. Go to your Shopify Admin
2. Navigate to **Settings → Apps and sales channels**
3. Find your app and click **"Uninstall"**

---

## FAQ

**Q: Do I need a paid Shopify plan?**  
A: No, you can use any Shopify plan. The free trial works for API access.

**Q: Will SoloSuccess AI charge fees?**  
A: SoloSuccess AI does not charge any fees. Shopify's normal fees apply as usual.

**Q: Can I connect multiple Shopify stores?**  
A: Currently, you can connect one Shopify store per SoloSuccess AI account. Multiple store support may be added in the future.

**Q: Is my store data secure?**  
A: Yes, all communication uses Shopify's secure OAuth protocol. SoloSuccess AI never stores your Shopify password.

**Q: Can SoloSuccess AI modify my store?**  
A: No, SoloSuccess AI only requests read-only permissions for revenue tracking.

---

## Need Help?

- **Shopify API Documentation**: [https://shopify.dev/docs/api](https://shopify.dev/docs/api)
- **Shopify Support**: [https://help.shopify.com/](https://help.shopify.com/)
- **SoloSuccess AI Support**: support@solobossai.fun

---

**Last Updated**: December 30, 2025

