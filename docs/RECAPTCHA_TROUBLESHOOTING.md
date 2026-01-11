# reCAPTCHA Troubleshooting Guide

**Last Updated:** January 2025

---

## Common Issues & Solutions

### Issue 1: "Security verification failed. Please try again."

**Possible Causes:**
1. **Server not restarted** - Environment variables only load when server starts
2. **API key not configured** - `GOOGLE_CLOUD_API_KEY` missing or invalid
3. **Project ID mismatch** - `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` doesn't match Google Cloud project
4. **API key not restricted** - API key needs to be restricted to reCAPTCHA Enterprise API
5. **Enterprise API not enabled** - reCAPTCHA Enterprise API needs to be enabled in Google Cloud

**Solutions:**

#### Step 1: Restart Development Server
```bash
# Stop server (Ctrl+C)
# Start again:
npm run dev
```

**Why:** Next.js only loads environment variables at startup. If you added/updated variables in `.env.local`, you MUST restart the server.

#### Step 2: Verify Environment Variables
Check that these are set in `.env.local`:
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key-here"
NEXT_PUBLIC_RECAPTCHA_PROJECT_ID="your-project-id-here"
GOOGLE_CLOUD_API_KEY="your-api-key-here"
```

#### Step 3: Check Server Logs
When you submit the form, check your terminal for errors like:
- `Google Cloud API key not configured` → Add `GOOGLE_CLOUD_API_KEY` to `.env.local`
- `reCAPTCHA Enterprise API error (403)` → API key not restricted or Enterprise API not enabled
- `reCAPTCHA Enterprise API error (401)` → Invalid API key

#### Step 4: Verify API Key in Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under **"API restrictions"**: 
   - Select **"Restrict key"**
   - Check **"reCAPTCHA Enterprise API"**
4. Click **"SAVE"**

#### Step 5: Enable reCAPTCHA Enterprise API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"reCAPTCHA Enterprise API"**
3. Click **"Enable"** if not already enabled

---

### Issue 2: "Failed to load reCAPTCHA script"

**Possible Causes:**
1. **Site key not loaded** - Environment variable not loaded (restart server)
2. **Network issue** - Can't reach Google's servers
3. **Invalid site key** - Site key doesn't exist or is wrong

**Solutions:**
1. **Restart server** to load environment variables
2. **Check browser console** for network errors
3. **Verify site key** in Google Cloud Console → reCAPTCHA → Your key

---

### Issue 3: Hydration Error (Footer)

**Cause:** Cached/compiled version of component

**Solution:**
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Restart dev server** to rebuild
4. Clear `.next` directory if issues persist:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Quick Checklist

Before reporting issues, verify:

- [ ] Server restarted after adding/updating environment variables
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in `.env.local`
- [ ] `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` is set to `solosuccess-ai`
- [ ] `GOOGLE_CLOUD_API_KEY` is set in `.env.local`
- [ ] API key is restricted to "reCAPTCHA Enterprise API" in Google Cloud Console
- [ ] reCAPTCHA Enterprise API is enabled in Google Cloud Console
- [ ] Browser console shows no network errors
- [ ] Server logs show no configuration errors

---

## Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for reCAPTCHA errors
   - Check Network tab for failed requests

2. **Check Server Logs:**
   - Look in terminal where `npm run dev` is running
   - Look for errors starting with `[ERROR]` or `reCAPTCHA`

3. **Test API Key:**
   - Try accessing: `https://recaptchaenterprise.googleapis.com/v1/projects/solosuccess-ai/assessments?key=YOUR_API_KEY`
   - Should return an error (this is expected), but not a 403/401

4. **Verify Site Key:**
   - Go to Google Cloud Console → reCAPTCHA
   - Verify your site key matches what's in `.env.local`

---

## Production Deployment

When deploying to production (Vercel, etc.):

1. **Add environment variables** in your hosting platform
2. **Redeploy** after adding variables
3. **Verify** they're loaded in production logs

**Vercel:**
- Project Settings → Environment Variables
- Add all three variables (site key, project ID, API key)
- Redeploy

---

## Still Having Issues?

If you've checked everything above and it's still not working:

1. **Check server logs** for the exact error message
2. **Check browser console** for specific errors
3. **Verify** environment variables are actually loaded:
   - Add a console.log in the code (temporarily)
   - Or check if the script tag is rendered in the HTML source

---

**Last Updated:** January 2025
