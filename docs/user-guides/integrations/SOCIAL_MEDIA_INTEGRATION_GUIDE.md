# Social Media Integration Guide for SoloSuccess AI

## Overview

SoloSuccess AI allows you to connect **your own** social media accounts to monitor and analyze your content performance. This guide explains how the integration works and why you need to provide your own API credentials.

## How It Works

When you connect your social media accounts to SoloSuccess AI:

1. **You authorize SoloSuccess AI** to access your social media accounts via OAuth
2. **Your API tokens are securely stored** in our database (encrypted)
3. **SoloSuccess AI uses YOUR tokens** to fetch your posts, engagement metrics, and analytics
4. **All data belongs to you** and is used solely for your analytics and insights

## Why You Need Your Own API Credentials

Social media platforms require each application to:
- Register as a developer
- Create their own API app/application
- Obtain unique API credentials (Client ID, Client Secret)
- Request specific permissions from users

This means:
- ✅ **You control access** - You can revoke access anytime
- ✅ **Your credentials** - Each user has their own API app
- ✅ **Better security** - No shared credentials
- ✅ **Higher rate limits** - Each app has its own quota
- ✅ **Full control** - You decide what permissions to grant

## What Data We Access

For each platform, we only request the minimum permissions needed:

- **LinkedIn**: Read your posts, profile, and engagement metrics
- **Twitter**: Read your tweets, engagement, and profile
- **Facebook**: Read your page posts and insights
- **Instagram**: Read your business account posts and metrics
- **YouTube**: Read your channel videos and analytics

**We never**:
- ❌ Post on your behalf without explicit permission
- ❌ Access private messages
- ❌ Share your data with third parties
- ❌ Store your login credentials

## Step-by-Step Setup

### 1. Choose Your Platforms

Decide which social media accounts you want to connect:
- [ ] LinkedIn (personal or company page)
- [ ] Twitter/X
- [ ] Facebook (page)
- [ ] Instagram (business account)
- [ ] YouTube (channel)

### 2. Create Developer Accounts

For each platform, you'll need to:
1. Create a developer account
2. Create an application/app
3. Configure OAuth settings
4. Get your API credentials

**Detailed guides**: See [Social Media API Setup Guide](./SOCIAL_MEDIA_API_SETUP.md)

### 3. Connect in SoloSuccess AI

1. Go to **Settings → Integrations → Social Media**
2. Click **"Connect [Platform]"** for each platform
3. Enter your Client ID and Client Secret when prompted
4. Authorize the app when redirected to the platform
5. Your account will be connected!

### 4. Monitor Your Accounts

Once connected:
- Posts are automatically synced every hour
- Engagement metrics are calculated
- Sentiment analysis runs on new posts
- Analytics are updated in real-time

## Security & Privacy

### Token Storage
- All tokens are encrypted at rest
- Tokens are stored securely in our database
- Only you can access your connected accounts

### Token Refresh
- Access tokens expire periodically
- Refresh tokens are used to automatically renew access
- You'll be notified if reconnection is needed

### Revoking Access
You can disconnect any account at any time:
1. Go to **Settings → Integrations**
2. Click **"Disconnect"** next to the platform
3. Access is immediately revoked

You can also revoke access from the platform's app settings page.

## Troubleshooting

### "Invalid credentials"
- Double-check your Client ID and Client Secret
- Make sure you copied them correctly (no extra spaces)
- Verify the credentials are from the correct app

### "Redirect URI mismatch"
- Ensure the callback URL in your app settings matches exactly:
  ```
  https://yourdomain.com/api/integrations/[platform]/callback
  ```
- Check for typos, http vs https, trailing slashes

### "Token expired"
- Disconnect and reconnect your account
- Some platforms require periodic re-authorization
- Check your app's token expiration settings

### "Rate limit exceeded"
- Each API app has usage limits
- Wait for the limit to reset (usually hourly or daily)
- Consider upgrading your API tier if needed

### "Permission denied"
- Re-authorize with all required permissions
- Some platforms require app review for certain permissions
- Check the platform's developer dashboard for permission status

## Best Practices

1. **Use separate apps** for production vs testing
2. **Monitor API usage** in platform dashboards
3. **Rotate credentials** if you suspect compromise
4. **Review permissions** regularly
5. **Keep developer accounts secure** (use 2FA)

## FAQ

**Q: Do I need a paid developer account?**  
A: Most platforms offer free developer accounts. Some advanced features may require paid tiers.

**Q: Can I connect multiple accounts?**  
A: Currently, you can connect one account per platform. Multiple account support is coming soon.

**Q: What happens if I disconnect?**  
A: Your tokens are deleted, but historical analytics data is preserved.

**Q: Is my data secure?**  
A: Yes, all tokens are encrypted and we follow security best practices.

**Q: Can SoloSuccess post on my behalf?**  
A: Not without explicit permission. We only request read permissions by default.

## Need Help?

- **Setup guides**: [Social Media API Setup Guide](./SOCIAL_MEDIA_API_SETUP.md)
- **Quick start**: [Social Media Connection Quick Start](./SOCIAL_MEDIA_CONNECTION_QUICK_START.md)
- **Support**: support@solobossai.fun

---

**Last Updated**: December 30, 2025

