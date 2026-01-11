# Vercel Environment Variables Setup

This document outlines the required environment variables that must be set in Vercel for successful deployment.

## Required Environment Variables

Refer to `env.example` for a complete list of all environment variables needed for the application.

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Select which environments it applies to (Production, Preview, Development)
5. Click **Save**

## Important Notes

- **Environment-Specific**: Make sure to set the correct values for each environment (Production, Preview, Development)
- **Client vs Server**: 
  - `NEXT_PUBLIC_*` variables are exposed to the browser
  - Non-prefixed variables are server-only

Refer to `env.example` for a complete list of all environment variables needed for the application.

