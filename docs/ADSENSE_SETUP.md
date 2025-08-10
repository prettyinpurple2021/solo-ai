# AdSense Integration Documentation

## Overview
This project implements Google AdSense integration following security best practices by using environment variables instead of hardcoded client IDs.

## Security Features
- ✅ **No hardcoded client IDs** - All sensitive configuration is stored in environment variables
- ✅ **Environment-specific configuration** - Different AdSense IDs can be used for development, staging, and production
- ✅ **Input validation** - Client ID format is validated before use
- ✅ **Graceful fallback** - AdSense is disabled if not properly configured
- ✅ **Clear error messages** - Helpful warnings in console for debugging

## Setup Instructions

### 1. Configure Environment Variable
Copy the environment template and add your AdSense client ID:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder:
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-actual-client-id
```

### 2. Get Your AdSense Client ID
1. Log into your [Google AdSense account](https://www.google.com/adsense/)
2. Go to "Ads" → "Overview" 
3. Your client ID will be in the format: `ca-pub-XXXXXXXXXXXXXXXX`

### 3. Environment Variable Format
The client ID must:
- Start with `ca-pub-`
- Contain only your numeric publisher ID
- Example: `ca-pub-1234567890123456`

## Implementation Details

### Component Location
- Main component: `/components/adsense/adsense.tsx`
- Integration: `/app/layout.tsx`
- Types: `/lib/env.d.ts`

### How It Works
1. The `AdSense` component receives the client ID from environment variables
2. Input validation ensures the client ID is properly formatted
3. If valid, the Google AdSense script is loaded with the proper client ID
4. If invalid or missing, the component gracefully fails with helpful error messages

### Code Example
```typescript
// ✅ Secure - uses environment variable
<AdSense clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} />

// ❌ Insecure - hardcoded client ID (DON'T DO THIS)
<AdSense clientId="ca-pub-1234567890123456" />
```

## Environment Variables
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - Your Google AdSense client ID

## Security Notes
- Never commit your actual client ID to version control
- Use different client IDs for different environments
- The `NEXT_PUBLIC_` prefix makes this variable available to the client-side code
- Always validate environment variables before use

## Troubleshooting
- Check browser console for AdSense-related warnings or errors
- Verify your `.env.local` file contains the correct client ID
- Ensure the client ID starts with `ca-pub-`
- Make sure you have a valid AdSense account and approval