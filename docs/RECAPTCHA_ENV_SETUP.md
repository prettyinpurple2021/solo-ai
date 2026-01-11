# Quick Guide: Adding reCAPTCHA Environment Variables

**Step-by-step instructions to add your reCAPTCHA credentials**

---

## Step 1: Get Your Values

You need **3 values**:

1. ✅ **Google Cloud API Key** - You just created this! (starts with `AIza...`)
2. **Site Key** - Found in Google Cloud Console → reCAPTCHA → Your key "SoloSuccess AI WEB"
   - It's: `6Ldx00YsAAAAADAH1dIWDjnoxT85tc0a46rrY0Fa`
3. **Project ID** - This is: `solosuccess-ai`

---

## Step 2: Add to Local Environment (.env.local)

1. **Open or create `.env.local` file** in your project root folder
   - Location: `c:\Users\prett\OneDrive\Desktop\projects\SoloSuccess-AI\.env.local`

2. **Add these lines** (replace with your actual API key):

```bash
# reCAPTCHA Enterprise Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6Ldx00YsAAAAADAH1dIWDjnoxT85tc0a46rrY0Fa"
NEXT_PUBLIC_RECAPTCHA_PROJECT_ID="solosuccess-ai"
GOOGLE_CLOUD_API_KEY="YOUR_API_KEY_HERE"
```

**Replace `YOUR_API_KEY_HERE`** with the API key you just created (the one that starts with `AIza...`)

3. **Save the file**

---

## Step 3: Restart Your Development Server

If your server is running:
1. **Stop it** (press `Ctrl+C` in the terminal)
2. **Start it again** (`npm run dev` or `yarn dev`)

This loads the new environment variables.

---

## Step 4: Add to Production (Vercel)

If you're using Vercel (or another hosting platform):

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (SoloSuccess-AI)
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** (click "Add New"):
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = `6Ldx00YsAAAAADAH1dIWDjnoxT85tc0a46rrY0Fa`
   - `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` = `solosuccess-ai`
   - `GOOGLE_CLOUD_API_KEY` = `YOUR_API_KEY_HERE` (the `AIza...` key)

5. **Make sure to select "Production"** (and optionally "Preview" and "Development")
6. **Click "Save"**
7. **Redeploy** your site (or wait for the next deployment)

---

## Step 5: Test It!

1. **Go to a form** on your site that uses reCAPTCHA (like contact form)
2. **Submit the form**
3. **Check your server logs** - you should see:
   ```
   reCAPTCHA Enterprise score for action 'contact': 0.9
   ```
   (The number might be different, but you should see a success message)

---

## Quick Reference

### Your Values:
- **Site Key**: `6Ldx00YsAAAAADAH1dIWDjnoxT85tc0a46rrY0Fa`
- **Project ID**: `solosuccess-ai`
- **API Key**: `AIza...` (the one you just created)

### Where to Find Them Again:
- **Site Key & Project ID**: Google Cloud Console → Security → reCAPTCHA → "SoloSuccess AI WEB" key
- **API Key**: Google Cloud Console → APIs & Services → Credentials → Your API key (you can't see the value again, but you can create a new one if needed)

---

## Troubleshooting

### "Google Cloud API key not configured"
- Make sure you added `GOOGLE_CLOUD_API_KEY` to `.env.local`
- Make sure you **restarted your server** after adding it
- Check for typos in the variable name

### "Project ID not configured"
- Make sure `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` is set to `solosuccess-ai`
- Check for typos

### Still not working?
- Double-check your API key is correct (copy-paste it carefully)
- Make sure there are no extra spaces in your `.env.local` file
- Make sure the quotes are straight quotes `"` not curly quotes `"`

---

**Once you've added these values, you're all set! 🎉**
