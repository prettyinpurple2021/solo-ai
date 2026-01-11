# reCAPTCHA Enterprise Setup Guide

**Last Updated:** January 2025  
**Status:** Production Ready

---

## Quick Overview

Yes! Your **Site Key** is:

This is shown in your Google Cloud Console under the reCAPTCHA Enterprise key "SoloSuccess AI WEB".

---

## What You Need

To complete the reCAPTCHA Enterprise setup, you need **3 things**:

1. ✅ **Site Key** - You already have this:
2. ✅ **Project ID** - This appears to be: (from the API URL in your screenshot)
3. ⚠️ **Google Cloud API Key** - You need to create this (instructions below)

---

## Step 1: Get Your Google Cloud API Key

The API key is needed for server-side verification. Here's how to create it:

### Instructions:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com
   - Make sure you're in the **"solosuccess-ai"** project

2. **Navigate to APIs & Services:**
   - Click the hamburger menu (☰) in the top left
   - Go to **"APIs & Services"** → **"Credentials"**

3. **Create API Key:**
   - Click the **"+ CREATE CREDENTIALS"** button at the top
   - Select **"API key"**
   - A popup will appear with your new API key (starts with `AIza...`)
   - **Copy this key immediately** - you won't be able to see it again later!

4. **Restrict the API Key (IMPORTANT for Security):**
   - In the API key creation popup, click **"RESTRICT KEY"**
   - Under **"API restrictions"**, select **"Restrict key"**
   - Check the box for **"reCAPTCHA Enterprise API"**
   - Under **"Application restrictions"**, choose:
     - **"HTTP referrers"** for web applications
     - Add your domain: `https://yourdomain.com/*` (or `http://localhost:3000/*` for local testing)
   - Click **"SAVE"**

---

## Step 2: Set Environment Variables

Add these to your `.env.local` (for local development) and your production environment (Vercel, etc.):

```bash
# reCAPTCHA Enterprise Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
NEXT_PUBLIC_RECAPTCHA_PROJECT_ID=""
GOOGLE_CLOUD_API_KEY="" # Your API key from Step 1
```

**Important Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for site key and project ID)
- `GOOGLE_CLOUD_API_KEY` is **server-side only** - never expose this to the browser
- In Vercel: Go to Project Settings → Environment Variables → Add each variable

---

## Step 3: Verify Setup

After setting the environment variables:

1. **Restart your development server** (if running locally)
2. **Test a form** that uses reCAPTCHA (like your contact form)
3. **Check the server logs** - you should see:
   - `reCAPTCHA Enterprise score for action 'contact': 0.9` (or similar)

---

## How It Works

### Frontend (Already Set Up ✅):
- Uses `grecaptcha.enterprise.execute()` to generate tokens
- Loads the Enterprise script: `https://www.google.com/recaptcha/enterprise.js`

### Backend (Just Updated ✅):
- Uses the Enterprise REST API to verify tokens
- Sends requests to: `https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_ID}/assessments`
- Returns a risk score (0.0 to 1.0) - higher is better
- Your code validates the score against a minimum threshold (default: 0.5)

---

## Troubleshooting

### "Google Cloud API key not configured"
- Make sure `GOOGLE_CLOUD_API_KEY` is set in your environment variables
- Restart your server after adding the variable

### "reCAPTCHA Enterprise API error (403)"
- Your API key might not have the reCAPTCHA Enterprise API enabled
- Go to Google Cloud Console → APIs & Services → Enabled APIs
- Make sure "reCAPTCHA Enterprise API" is enabled
- Check that your API key is restricted to this API

### "Project ID not configured"
- Make sure `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` is set to `solosuccess-ai`
- Or set `GOOGLE_CLOUD_PROJECT_ID` as an alternative

---

## Security Best Practices

1. ✅ **Restrict your API key** to only the reCAPTCHA Enterprise API
2. ✅ **Add HTTP referrer restrictions** to limit where the key can be used
3. ✅ **Never commit API keys** to git (use environment variables)
4. ✅ **Use different keys** for development and production if possible
5. ✅ **Monitor usage** in Google Cloud Console → APIs & Services → Credentials

---

## Additional Resources

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- Your reCAPTCHA key in Google Cloud: https://console.cloud.google.com/security/recaptcha

---

**Next Steps:**
1. Create your Google Cloud API key (Step 1 above)
2. Add it to your environment variables (Step 2)
3. Test your forms to verify everything works!
