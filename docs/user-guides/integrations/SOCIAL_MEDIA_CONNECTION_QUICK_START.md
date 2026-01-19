# Social Media Connection Quick Start

A quick reference guide for connecting your social media accounts to SoloSuccess AI.

## Prerequisites Checklist

Before connecting, make sure you have:

- [ ] Developer account on the platform
- [ ] Created an app/application
- [ ] Obtained API credentials (Client ID, Client Secret, etc.)
- [ ] Added callback URL to your app settings
- [ ] Required permissions/scopes configured

## Quick Connection Steps

### 1. LinkedIn
**Time Required**: 15-20 minutes

1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Request Marketing Developer Platform access
3. Add callback: `https://yourdomain.com/api/integrations/linkedin/callback`
4. Get Client ID and Secret
5. Connect in SoloSuccess AI → Settings → Integrations

**Required Scopes**: `openid`, `profile`, `email`, `r_organization_social`

---

### 2. Twitter/X
**Time Required**: 10-15 minutes (after developer approval)

1. Apply at [Twitter Developer Portal](https://developer.twitter.com/)
2. Wait for approval (usually instant to 48 hours)
3. Create app and configure OAuth
4. Add callback: `https://yourdomain.com/api/integrations/twitter/callback`
5. Connect in SoloSuccess AI → Settings → Integrations

**Note**: Free tier has limited API access. Consider upgrading for production use.

---

### 3. Facebook
**Time Required**: 10-15 minutes

1. Create app at [Facebook Developers](https://developers.facebook.com/)
2. Add Facebook Login product
3. Add callback: `https://yourdomain.com/api/integrations/facebook/callback`
4. Get App ID and Secret
5. Connect in SoloSuccess AI → Settings → Integrations

**Required Permissions**: `pages_read_engagement`, `pages_read_user_content`, `read_insights`

---

### 4. Instagram (via Facebook)
**Time Required**: 20-25 minutes (includes Facebook setup)

1. Complete Facebook setup first
2. Convert Instagram to Business account
3. Connect Instagram to Facebook Page
4. Add Instagram product to Facebook app
5. Get Instagram Business Account ID
6. Connect in SoloSuccess AI → Settings → Integrations

**Note**: Only Business accounts work with Graph API.

---

### 5. YouTube
**Time Required**: 10-15 minutes

1. Create project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add callback: `https://yourdomain.com/api/integrations/youtube/callback`
5. Connect in SoloSuccess AI → Settings → Integrations

**Default Quota**: 10,000 units/day (can request increase)

---

## Connection Status Indicators

- 🟢 **Green**: Connected and active
- 🟡 **Yellow**: Connected but token expired (auto-refresh will occur)
- 🔴 **Red**: Not connected or error
- ⚪ **Gray**: Disabled by user

## What Happens After Connection?

Once connected:
- ✅ Your posts/content are automatically synced
- ✅ Analytics are calculated and updated regularly
- ✅ You can view engagement metrics
- ✅ Sentiment analysis runs on new posts
- ✅ Alerts are set up for important mentions

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Connection fails | Check callback URL matches exactly |
| Token expired | Disconnect and reconnect |
| No data showing | Wait 5-10 minutes for first sync |
| Permission errors | Re-authorize with required permissions |
| Rate limit errors | Check API usage limits in platform dashboard |

## Need Detailed Instructions?

See the full guide: [Social Media API Setup Guide](./SOCIAL_MEDIA_API_SETUP.md)

