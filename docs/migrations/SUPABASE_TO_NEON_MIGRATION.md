# Supabase to Neon Migration Guide

This document outlines the migration from Supabase to Neon as the database provider for the SoloBoss AI platform.

## Overview

The migration replaces Supabase's PostgreSQL database, authentication, and storage with:
- **Neon PostgreSQL** for the database
- **Custom JWT authentication** for user management
- **Database-based file storage** for images and files

## Changes Made

### 1. Database Client
- **Before**: `lib/supabase/client.ts` and `lib/supabase/server.ts`
- **After**: `lib/neon/client.ts` and `lib/neon/server.ts`
- **Change**: Replaced Supabase client with PostgreSQL connection pool

### 2. Authentication System
- **Before**: Supabase Auth with built-in user management
- **After**: Custom JWT-based authentication with bcrypt password hashing
- **New Files**:
  - `app/api/auth/signin/route.ts`
  - `app/api/auth/signup/route.ts`
  - `app/api/auth/user/route.ts`
  - `lib/auth-utils.ts` (updated)

### 3. Authentication Components
- **Before**: `components/auth/supabase-auth.tsx`
- **After**: `components/auth/neon-auth.tsx`
- **Change**: Updated to work with custom authentication API

### 4. Database Schema
- **New Migration**: `supabase/migrations/007_neon_migration.sql`
- **Tables Created**:
  - `users` - User accounts with password authentication
  - `user_images` - Image storage in database (base64)
  - `ai_agents` - AI agent configurations
  - `achievements` - Gamification achievements
  - `template_categories` - Template categories
  - `templates` - Template content
  - `projects` - User projects

### 5. File Storage
- **Before**: Supabase Storage
- **After**: Database storage with base64 encoding
- **File**: `lib/image-upload.ts` (updated)

### 6. Environment Variables
- **Removed**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Added**:
  - `DATABASE_URL` - Neon database connection string
  - `JWT_SECRET` - Secret for JWT token signing

### 7. Dependencies
- **Removed**:
  - `@supabase/ssr`
  - `@supabase/supabase-js`
- **Added**:
  - `pg` - PostgreSQL client
  - `@types/pg` - TypeScript types for PostgreSQL
  - `bcryptjs` - Password hashing
  - `@types/bcryptjs` - TypeScript types for bcrypt
  - `jsonwebtoken` - JWT token handling
  - `@types/jsonwebtoken` - TypeScript types for JWT
  - `uuid` - UUID generation
  - `@types/uuid` - TypeScript types for UUID

## Setup Instructions

### 1. Environment Variables
Update your `.env.local` file:

```env
# Remove Supabase variables
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# Add Neon variables
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key-here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Migration
```bash
# Apply the new migration to your Neon database
psql $DATABASE_URL -f supabase/migrations/007_neon_migration.sql
```

### 4. Setup Database
```bash
npm run setup-db
```

### 5. Start Development Server
```bash
npm run dev
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Images Table
```sql
CREATE TABLE user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  pathname VARCHAR(500) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  data TEXT NOT NULL, -- Base64 encoded image data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Authentication Flow

### Sign Up
1. User submits registration form
2. Password is hashed with bcrypt
3. User record is created in database
4. JWT token is generated and returned
5. Token is stored in localStorage and httpOnly cookie

### Sign In
1. User submits login form
2. Password is verified against hash in database
3. JWT token is generated and returned
4. Token is stored in localStorage and httpOnly cookie

### Authentication Middleware
1. API routes check for JWT token in cookies
2. Token is verified and decoded
3. User data is fetched from database
4. Request proceeds with authenticated user context

## File Storage

Images are now stored as base64 strings in the database instead of using Supabase Storage. This approach:

- **Pros**: Simpler setup, no external storage dependencies
- **Cons**: Larger database size, slower retrieval for large files

For production, consider migrating to a dedicated file storage service like AWS S3 or Cloudinary.

## Migration Notes

1. **Existing Users**: Users will need to create new accounts as the authentication system has changed
2. **File Storage**: Existing files in Supabase Storage will need to be migrated if needed
3. **Data Migration**: Any existing data in Supabase will need to be exported and imported to Neon

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` is correct
   - Check SSL settings for production

2. **Authentication Errors**
   - Ensure `JWT_SECRET` is set
   - Check token expiration settings

3. **File Upload Issues**
   - Verify database has enough storage for base64 data
   - Check file size limits

### Support

For issues related to this migration, check:
- Neon documentation: https://neon.tech/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
- JWT documentation: https://jwt.io/
