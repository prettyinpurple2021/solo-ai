# Netlify Deployment Guide for SoloBoss AI Platform

## Overview
This guide will help you deploy your SoloBoss AI Platform to Netlify. The project has been configured for static export to work with Netlify's hosting platform.

## Prerequisites
- A Netlify account
- Your project repository on GitHub/GitLab/Bitbucket
- Node.js 18+ installed locally for testing

## Configuration Files

### 1. netlify.toml
The project includes a `netlify.toml` file with the following configuration:
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. next.config.mjs
The Next.js configuration has been updated for static export:
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ... other config
}
```

## Deployment Steps

### Step 1: Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository: `v0-solo-boss-ai-platform`

### Step 2: Configure Build Settings
Netlify should automatically detect the settings from `netlify.toml`, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: 18 (or higher)

### Step 3: Set Environment Variables
In your Netlify dashboard, go to Site settings → Environment variables and add:

#### Required Environment Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional Environment Variables:
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_key
```

### Step 4: Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. The first deployment may take 5-10 minutes

## Post-Deployment

### Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Environment-Specific Deployments
You can set up different environment variables for:
- Production (main branch)
- Preview (pull requests)
- Branch deployments

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check the build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

#### 2. API Routes Not Working
- API routes have been removed for static export
- Use external APIs or Netlify Functions for server-side functionality
- Mock API responses are provided in `lib/mock-api.ts`

#### 3. Authentication Issues
- Ensure Clerk environment variables are properly set
- Check that your Clerk application is configured for your Netlify domain

#### 4. Database Connectivity
- Supabase connection works client-side
- Ensure CORS is properly configured in Supabase
- Check that your Supabase project allows your Netlify domain

### Performance Optimization

#### 1. Image Optimization
- Images are set to `unoptimized: true` for static export
- Consider using a CDN for better performance
- Optimize images before uploading

#### 2. Bundle Size
- The build process optimizes JavaScript bundles
- Consider code splitting for large components
- Use dynamic imports for heavy libraries

## Local Testing

Before deploying, test locally:
```bash
npm run build
npm run start
```

## Monitoring

### Netlify Analytics
- Enable Netlify Analytics in your dashboard
- Monitor site performance and user behavior

### Error Tracking
- Set up error tracking (e.g., Sentry)
- Monitor build failures and runtime errors

## Security Considerations

### Environment Variables
- Never commit sensitive keys to your repository
- Use Netlify's environment variable management
- Rotate keys regularly

### CORS Configuration
- Configure Supabase CORS settings for your Netlify domain
- Update Clerk application settings for your domain

## Support

If you encounter issues:
1. Check the Netlify build logs
2. Review the troubleshooting section above
3. Check the Next.js static export documentation
4. Contact support with specific error messages

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
