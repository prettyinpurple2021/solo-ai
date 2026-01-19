# Social Media API Setup Guide

This guide will help you set up API access for your own social media accounts to enable monitoring and analytics in SoloSuccess AI.

## Overview

To monitor and analyze your social media accounts, you'll need to connect them via OAuth. Each platform has its own setup process:

- **LinkedIn**: Requires LinkedIn Developer App
- **Twitter/X**: Requires Twitter Developer Account
- **Facebook**: Requires Facebook Developer App
- **Instagram**: Requires Facebook Developer App (connected to Instagram)
- **YouTube**: Requires Google Cloud Project

---

## 📘 LinkedIn Setup

### Step 1: Create a LinkedIn Developer Account
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click **"Create app"**

### Step 2: Create Your App
1. Fill in the app details:
   - **App name**: Your app name (e.g., "SoloSuccess Social Media Monitor")
   - **LinkedIn Page**: Select a LinkedIn Page you manage (required)
   - **Privacy policy URL**: Your privacy policy URL
   - **App logo**: Upload an app logo (optional)
2. Accept the API Terms of Use
3. Click **"Create app"**

### Step 3: Add Products
1. In your app dashboard, go to the **"Products"** tab
2. Request access to:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Marketing Developer Platform** (for Company Page API access)
3. Wait for approval (may take 1-2 business days for Marketing Developer Platform)

### Step 4: Configure OAuth Settings
1. Go to the **"Auth"** tab
2. Under **"Redirect URLs"**, add:
   ```
   https://yourdomain.com/api/integrations/linkedin/callback
   ```
   (Replace `yourdomain.com` with your actual domain)
3. Under **"Authorized redirect URLs for your app"**, add the same URL

### Step 5: Get Your Credentials
1. In the **"Auth"** tab, you'll see:
   - **Client ID**
   - **Client Secret**
2. Copy these values - you'll need them when connecting in SoloSuccess AI

### Step 6: Required Scopes
Make sure your app requests these scopes:
- `openid`
- `profile`
- `email`
- `w_member_social` (for posting)
- `r_organization_social` (for Company Page access)

### Step 7: Connect in SoloSuccess AI
1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect LinkedIn"**
3. Enter your Client ID and Client Secret
4. Authorize the app when redirected to LinkedIn
5. Your account will be connected!

**Note**: For Company Page monitoring, you need to be an admin of the LinkedIn Company Page.

---

## 🐦 Twitter/X Setup

### Step 1: Apply for Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Click **"Sign up"** or **"Apply"**
4. Complete the application form:
   - Select **"Making a bot"** or **"Exploring the API"**
   - Describe your use case
   - Accept terms and submit

### Step 2: Create a Project and App
1. Once approved, go to [Twitter Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click **"Create Project"**
3. Fill in project details:
   - **Project name**: e.g., "SoloSuccess Social Monitor"
   - **Use case**: Select appropriate use case
4. Create an app within the project:
   - **App name**: e.g., "SoloSuccess App"
   - **App environment**: Select "Development" or "Production"

### Step 3: Configure App Settings
1. In your app settings, go to **"User authentication settings"**
2. Click **"Set up"**
3. Configure:
   - **App permissions**: Read, Read and write, or Read and write and Direct message (choose based on needs)
   - **Type of App**: Web App
   - **Callback URI / Redirect URL**: 
     ```
     https://yourdomain.com/api/integrations/twitter/callback
     ```
   - **Website URL**: Your website URL
   - **Terms of Service**: Your ToS URL
   - **Privacy policy**: Your privacy policy URL
4. Click **"Save"**

### Step 4: Get Your Credentials
1. In your app's **"Keys and tokens"** tab, you'll see:
   - **API Key** (Client ID)
   - **API Key Secret** (Client Secret)
   - **Bearer Token** (for app-only authentication)
2. For user authentication, you'll also need:
   - **Client ID** (from User authentication settings)
   - **Client Secret** (from User authentication settings)

### Step 5: Generate Access Token (OAuth 1.0a)
1. Go to **"Keys and tokens"** tab
2. Under **"Access Token and Secret"**, click **"Generate"**
3. Save both:
   - **Access Token**
   - **Access Token Secret**

### Step 6: Connect in SoloSuccess AI
1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect Twitter"**
3. You'll be redirected to Twitter to authorize
4. After authorization, you'll be redirected back
5. Your Twitter account will be connected!

**Note**: Twitter API v2 requires a paid subscription for higher rate limits. Free tier has limited access.

---

## 📘 Facebook Setup

### Step 1: Create Facebook Developer Account
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Sign in with your Facebook account
3. Click **"My Apps"** → **"Create App"**

### Step 2: Choose App Type
1. Select **"Business"** or **"Other"** as app type
2. Fill in app details:
   - **App name**: e.g., "SoloSuccess Social Monitor"
   - **App contact email**: Your email
   - **Business account**: Select or create one
3. Click **"Create app"**

### Step 3: Add Facebook Login Product
1. In your app dashboard, go to **"Add a Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** platform

### Step 4: Configure OAuth Settings
1. Go to **Facebook Login → Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://yourdomain.com/api/integrations/facebook/callback
   ```
3. Under **Settings → Basic**, add:
   - **App Domains**: Your domain
   - **Privacy Policy URL**: Your privacy policy
   - **Terms of Service URL**: Your ToS

### Step 5: Get App Credentials
1. Go to **Settings → Basic**
2. You'll see:
   - **App ID** (Client ID)
   - **App Secret** (Client Secret) - Click "Show" to reveal

### Step 6: Request Permissions
Your app needs these permissions:
- `pages_read_engagement` (read posts)
- `pages_read_user_content` (read user content)
- `pages_show_list` (list pages)
- `read_insights` (analytics)

### Step 7: Connect in SoloSuccess AI
1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect Facebook"**
3. Authorize the app with required permissions
4. Select which Facebook Page to connect (if you manage multiple)
5. Your Facebook account will be connected!

**Note**: Facebook requires app review for certain permissions in production.

---

## 📸 Instagram Setup (via Facebook)

Instagram Business accounts are managed through Facebook, so you need to complete Facebook setup first.

### Step 1: Convert to Instagram Business Account
1. Open Instagram app → Settings → Account
2. Switch to **"Professional account"**
3. Select **"Business"**
4. Connect to your Facebook Page

### Step 2: Add Instagram Product to Facebook App
1. Go to your Facebook App dashboard
2. Click **"Add Product"**
3. Find **"Instagram"** and click **"Set Up"**

### Step 3: Get Instagram Business Account ID
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. In the search bar, type: `me/accounts`
4. Click on your Facebook Page
5. Make a request to: `{page-id}?fields=instagram_business_account`
6. Note the Instagram Business Account ID

### Step 4: Connect in SoloSuccess AI
1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect Instagram"**
3. Authorize through Facebook (same as Facebook connection)
4. Enter your Instagram Business Account ID
5. Your Instagram account will be connected!

**Note**: Instagram Basic Display API is for personal accounts. For business features, use Instagram Graph API.

---

## 🎥 YouTube Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"**
4. Enter project name: e.g., "SoloSuccess YouTube Monitor"
5. Click **"Create"**

### Step 2: Enable YouTube Data API v3
1. In your project, go to **"APIs & Services" → "Library"**
2. Search for **"YouTube Data API v3"**
3. Click on it and click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (for testing) or Internal (for Google Workspace)
   - Fill in app information
   - Add scopes: `https://www.googleapis.com/auth/youtube.readonly`
   - Add test users (if external)
4. Create OAuth client:
   - **Application type**: Web application
   - **Name**: e.g., "SoloSuccess YouTube"
   - **Authorized redirect URIs**: 
     ```
     https://yourdomain.com/api/integrations/youtube/callback
     ```
5. Click **"Create"**

### Step 4: Get Your Credentials
1. After creating, you'll see:
   - **Client ID**
   - **Client Secret**
2. Copy these values

### Step 5: Optional - Enable YouTube Analytics API
For advanced analytics:
1. In **"APIs & Services" → "Library"**
2. Search for **"YouTube Analytics API"**
3. Enable it

### Step 6: Connect in SoloSuccess AI
1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect YouTube"**
3. Enter your Client ID and Client Secret
4. Authorize when redirected to Google
5. Select the YouTube channel to connect
6. Your YouTube account will be connected!

**Note**: YouTube Data API has a daily quota (10,000 units per day by default). You can request a quota increase if needed.

---

## 🔐 Security Best Practices

1. **Never share your API credentials** publicly
2. **Use environment variables** for storing credentials
3. **Rotate credentials** periodically
4. **Monitor API usage** to detect unauthorized access
5. **Use the minimum required permissions** (principle of least privilege)
6. **Enable 2FA** on all developer accounts
7. **Review connected apps** regularly and revoke unused access

---

## ❓ Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Make sure the callback URL in your app settings matches exactly (including https/http and trailing slashes)

**"App not approved for production"**
- Some platforms require app review before production use
- Use development/test mode while developing

**"Rate limit exceeded"**
- Implement proper rate limiting in your app
- Consider upgrading to paid tiers for higher limits

**"Permission denied"**
- Ensure you've granted all required permissions
- Some permissions require app review

**"Token expired"**
- Tokens expire periodically; implement automatic token refresh
- SoloSuccess AI handles this automatically

### Getting Help

If you encounter issues:
1. Check platform-specific documentation
2. Review error messages in SoloSuccess AI
3. Check API status pages for platform outages
4. Contact support: support@solobossai.fun

---

## 📚 Additional Resources

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)

---

**Last Updated**: December 30, 2025

