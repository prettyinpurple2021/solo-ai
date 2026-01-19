# WooCommerce Integration Setup Guide

This guide will help you connect your WooCommerce store to SoloSuccess AI for revenue tracking.

## Overview

SoloSuccess AI uses WooCommerce REST API to securely access your store's sales data. This enables you to:

- ✅ Track revenue from WooCommerce sales
- ✅ Monitor order activity
- ✅ Analyze revenue trends
- ✅ View sales history

**Your WooCommerce data remains private** - SoloSuccess AI only accesses it with your explicit permission.

---

## Prerequisites

- ✅ WordPress site with WooCommerce installed
- ✅ Admin access to your WordPress site
- ✅ SoloSuccess AI account

---

## Step 1: Generate WooCommerce API Keys

### 1.1 Access WooCommerce Settings

1. Log in to your WordPress admin dashboard
2. Navigate to **WooCommerce → Settings**
3. Click on the **"Advanced"** tab
4. Click on **"REST API"** in the left sidebar

### 1.2 Create a New API Key

1. Click **"Add key"** button
2. Fill in the key details:
   - **Description**: `SoloSuccess AI Revenue Tracking` (or any name you prefer)
   - **User**: Select your admin user account
   - **Permissions**: Select **"Read"** (read-only access)
3. Click **"Generate API key"**

### 1.3 Copy Your API Credentials

After generating the key, you'll see:

1. **Consumer Key** - Copy this value (looks like: `ck_xxxxxxxxxxxxxxxxxxxxxxxx`)
2. **Consumer Secret** - Copy this value (looks like: `cs_xxxxxxxxxxxxxxxxxxxxxxxx`)

**⚠️ Important:** 
- Keep these credentials secure. Never share them publicly.
- You can only see the Consumer Secret once. Save it immediately.

### 1.4 Get Your Store URL

1. Note your WordPress site URL (e.g., `https://yourstore.com`)
2. The WooCommerce REST API endpoint will be: `https://yourstore.com/wp-json/wc/v3`

---

## Step 2: Verify API Access

### 2.1 Test API Connection

You can test your API credentials using curl or a tool like Postman:

```bash
curl https://yourstore.com/wp-json/wc/v3/orders \
  -u ck_xxxxxxxxxxxxxxxxxxxxxxxx:cs_xxxxxxxxxxxxxxxxxxxxxxxx
```

If successful, you should see a JSON response with your orders.

---

## Step 3: Connect to SoloSuccess AI

### 3.1 Go to Settings

1. Log in to SoloSuccess AI
2. Navigate to **Settings → Integrations → Revenue Tracking**
3. Find the **WooCommerce** card
4. Click **"Connect WooCommerce"**

### 3.2 Enter Store Information

1. A dialog will appear asking for:
   - **Store URL**: Your WordPress site URL (e.g., `https://yourstore.com`)
   - **Consumer Key**: Paste your WooCommerce Consumer Key
   - **Consumer Secret**: Paste your WooCommerce Consumer Secret
2. Click **"Connect"**

### 3.3 Verify Connection

1. SoloSuccess AI will test the connection
2. If successful, your WooCommerce store will be connected
3. Revenue data will start syncing automatically

---

## What Data Is Accessed?

SoloSuccess AI requests the following permissions:

### Read-Only Access:
- ✅ Order information
- ✅ Sales data
- ✅ Revenue analytics
- ✅ Product information (for revenue breakdown)

**SoloSuccess AI cannot:**
- ❌ Create or modify orders
- ❌ Access payment methods
- ❌ Modify store settings
- ❌ Access customer passwords

---

## Security & Privacy

### Data Privacy:
- ✅ All API calls use **HTTPS encryption**
- ✅ Credentials are encrypted and stored securely
- ✅ You can **revoke access** at any time by deleting the API key
- ✅ SoloSuccess AI **never sees** your WordPress password

### API Key Security:
- API keys are encrypted and stored securely
- Keys are scoped to read-only permissions
- You can revoke access by deleting the key in WooCommerce

---

## Revenue Tracking Features

Once connected, you can:

1. **View Total Revenue**
   - See revenue from WooCommerce sales
   - Filter by date range (7 days, 30 days, 90 days, 1 year)

2. **Order Analytics**
   - Order counts
   - Average order value
   - Revenue trends

3. **Sales Breakdown**
   - Revenue by product
   - Revenue by category
   - Revenue by payment method

---

## Troubleshooting

### "Invalid Store URL"
- Ensure you're using the full URL with `https://`
- Don't include trailing slashes
- Verify your WordPress site is accessible

### "Invalid Consumer Key or Secret"
- Double-check that you copied the Consumer Key and Secret correctly
- Ensure there are no extra spaces or line breaks
- Verify the API key has "Read" permissions

### "Connection failed"
- Check that your WordPress site is accessible
- Verify WooCommerce is installed and active
- Ensure REST API is enabled (should be by default)
- Check that your site allows external API access

### "No data showing"
- Wait 5-10 minutes for initial sync
- Check that your WooCommerce store has orders
- Verify the connection status in Settings
- Test the API manually using curl or Postman

### "Permission denied"
- Ensure your API key has "Read" permissions
- Verify the API key is associated with an admin user
- Check that WooCommerce REST API is enabled

---

## Revoking Access

To disconnect your WooCommerce store:

1. Go to **Settings → Integrations → Revenue Tracking**
2. Find the **WooCommerce** card
3. Click **"Disconnect"**
4. Confirm disconnection

Or revoke from WordPress:
1. Log in to your WordPress admin
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Find your API key and click **"Revoke"** or **"Delete"**

---

## FAQ

**Q: Do I need a paid WordPress hosting?**  
A: No, you can use any WordPress hosting. The free tier works for API access.

**Q: Will SoloSuccess AI charge fees?**  
A: SoloSuccess AI does not charge any fees. Your normal hosting and WooCommerce fees apply.

**Q: Can I connect multiple WooCommerce stores?**  
A: Currently, you can connect one WooCommerce store per SoloSuccess AI account. Multiple store support may be added in the future.

**Q: Is my store data secure?**  
A: Yes, all communication uses HTTPS encryption. SoloSuccess AI never stores your WordPress password.

**Q: Can SoloSuccess AI modify my store?**  
A: No, SoloSuccess AI only requests read-only permissions for revenue tracking.

**Q: What if my site uses a custom WooCommerce endpoint?**  
A: Contact SoloSuccess AI support for custom endpoint configuration.

---

## Need Help?

- **WooCommerce REST API Documentation**: [https://woocommerce.github.io/woocommerce-rest-api-docs/](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- **WooCommerce Support**: [https://woocommerce.com/support/](https://woocommerce.com/support/)
- **SoloSuccess AI Support**: support@solobossai.fun

---

**Last Updated**: December 30, 2025

