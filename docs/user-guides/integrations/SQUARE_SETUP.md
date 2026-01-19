# Square Integration Setup Guide

This guide will help you connect your Square account to SoloSuccess AI for revenue tracking.

## Overview

SoloSuccess AI uses Square's Connect API to securely access your transaction data. This enables you to:

- ✅ Track revenue from in-person and online payments
- ✅ Monitor transaction activity
- ✅ Analyze revenue trends
- ✅ View payment history

**Your Square data remains private** - SoloSuccess AI only accesses it with your explicit permission.

---

## Prerequisites

- ✅ Square account (free tier works)
- ✅ Access to Square Developer Dashboard
- ✅ SoloSuccess AI account

---

## Step 1: Create a Square Application

### 1.1 Access Square Developer Dashboard

1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Sign in with your Square account credentials
3. If you don't have a developer account, click **"Sign Up"** and follow the prompts

### 1.2 Create a New Application

1. Click **"Applications"** in the left sidebar
2. Click **"New Application"** button
3. Fill in the application details:
   - **Application Name**: `SoloSuccess AI Revenue Tracking` (or any name you prefer)
   - **Description**: `Revenue tracking and analytics integration`
4. Click **"Create Application"**

### 1.3 Get Your API Credentials

After creating the application:

1. Go to **"Credentials"** tab
2. You'll see:
   - **Application ID** - Copy this value
   - **Application Secret** - Click **"Show"** to reveal and copy this value

**⚠️ Important:** Keep these credentials secure. Never share them publicly.

---

## Step 2: Configure OAuth Settings

### 2.1 Set Up OAuth Redirect URI

1. In your application settings, go to **"OAuth"** tab
2. Under **"Redirect URL"**, add:
   ```
   https://yourdomain.com/api/integrations/payment-providers/square/callback
   ```
   (Replace `yourdomain.com` with your SoloSuccess AI domain)

### 2.2 Request Required Permissions

Your application needs the following OAuth scopes:

- `PAYMENTS_READ` - Read payment information
- `ORDERS_READ` - Read order information
- `TRANSACTIONS_READ` - Read transaction history

These can be requested during the OAuth flow.

---

## Step 3: Connect to SoloSuccess AI

### 3.1 Go to Settings

1. Log in to SoloSuccess AI
2. Navigate to **Settings → Integrations → Revenue Tracking**
3. Find the **Square** card
4. Click **"Connect Square"**

### 3.2 Enter API Credentials

1. A dialog will appear asking for:
   - **Application ID**: Paste your Square Application ID
   - **Application Secret**: Paste your Square Application Secret
2. Click **"Connect"**

### 3.3 Authorize Access

1. You'll be redirected to Square's authorization page
2. **Sign in to your Square account**
3. Review the permissions being requested:
   - Read payments
   - Read orders
   - Read transactions
4. Click **"Allow"**

### 3.4 Complete Connection

1. You'll be redirected back to SoloSuccess AI
2. Your Square account will be connected
3. Revenue data will start syncing automatically

---

## What Data Is Accessed?

SoloSuccess AI requests the following permissions:

### Read-Only Access:
- ✅ Payment information
- ✅ Transaction history
- ✅ Order details
- ✅ Revenue data

**SoloSuccess AI cannot:**
- ❌ Process payments
- ❌ Access your Square balance
- ❌ Modify transactions
- ❌ Access customer payment methods

---

## Security & Privacy

### Data Privacy:
- ✅ All API calls use **OAuth tokens** that you control
- ✅ Credentials are encrypted and stored securely
- ✅ You can **revoke access** at any time
- ✅ SoloSuccess AI **never sees** your Square password

### Token Storage:
- OAuth access tokens are encrypted and stored securely
- Tokens are scoped to specific permissions
- You can revoke access from Square Developer Dashboard

---

## Revenue Tracking Features

Once connected, you can:

1. **View Total Revenue**
   - See revenue from Square transactions
   - Filter by date range (7 days, 30 days, 90 days, 1 year)

2. **Transaction Analytics**
   - Transaction counts
   - Average transaction value
   - Revenue trends

3. **Payment Method Breakdown**
   - Card payments
   - Cash payments
   - Other payment methods

---

## Troubleshooting

### "Invalid Application ID or Secret"
- Double-check that you copied the Application ID and Secret correctly
- Ensure there are no extra spaces or line breaks
- Verify you're using credentials from the correct Square application

### "Connection failed"
- Check that the redirect URI in Square matches exactly
- Ensure you're signed in to the correct Square account
- Try disconnecting and reconnecting

### "No data showing"
- Wait 5-10 minutes for initial sync
- Check that your Square account has transactions
- Verify the connection status in Settings

### "Permission denied"
- Ensure your Square application has the required OAuth scopes
- Re-authorize with required permissions

---

## Revoking Access

To disconnect your Square account:

1. Go to **Settings → Integrations → Revenue Tracking**
2. Find the **Square** card
3. Click **"Disconnect"**
4. Confirm disconnection

Or revoke from Square Developer Dashboard:
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Navigate to **Applications**
3. Find your application and revoke access

---

## FAQ

**Q: Do I need a paid Square account?**  
A: No, you can use a free Square account. The free tier works for API access.

**Q: Will SoloSuccess AI charge fees?**  
A: SoloSuccess AI does not charge any fees. Square's normal processing fees apply as usual.

**Q: Can I connect multiple Square accounts?**  
A: Currently, you can connect one Square account per SoloSuccess AI account. Multiple account support may be added in the future.

**Q: Is my payment data secure?**  
A: Yes, all communication uses Square's secure OAuth protocol. SoloSuccess AI never stores your Square password or payment card information.

**Q: Can SoloSuccess AI process payments on my behalf?**  
A: No, SoloSuccess AI only requests read-only permissions for revenue tracking.

---

## Need Help?

- **Square Developer Documentation**: [https://developer.squareup.com/docs](https://developer.squareup.com/docs)
- **Square Support**: [https://squareup.com/help](https://squareup.com/help)
- **SoloSuccess AI Support**: support@solobossai.fun

---

**Last Updated**: December 30, 2025

