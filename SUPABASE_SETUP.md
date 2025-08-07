# Supabase Setup Guide

This guide will help you set up Supabase for your SoloBoss AI Platform.

## Prerequisites

1. A Supabase account (create one at https://supabase.com)
2. Access to your hosting platform's environment variable configuration

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in:
   - **Project Name**: `soloboss-ai-platform` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this can take a few minutes)

### 2. Get Your Project Credentials

1. Once your project is ready, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (a long string)

### 3. Set Environment Variables

Add these environment variables to your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### For Netlify:
1. Go to your Netlify site dashboard
2. Click **Site settings** → **Environment variables**
3. Add both variables
4. Redeploy your application

#### For Local Development:
Create a `.env.local` file in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database Schema

Your application requires specific database tables. You'll need to create them in Supabase:

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Create the required tables by running these SQL commands:

```sql
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secure-jwt-secret-here'; -- IMPORTANT: Replace with a securely generated secret

-- Create AI Agents table
CREATE TABLE ai_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  model TEXT NOT NULL,
  temperature DECIMAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Conversations table
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Messages table
CREATE TABLE ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- AI Agents: Public read access
CREATE POLICY "AI agents are viewable by everyone" ON ai_agents
  FOR SELECT USING (true);

-- Conversations: Users can only see their own
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages: Users can only see messages from their conversations
CREATE POLICY "Users can view messages from their conversations" ON ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = ai_messages.conversation_id 
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = ai_messages.conversation_id 
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Projects: Users can only see their own
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some default AI agents
INSERT INTO ai_agents (name, description, model, system_prompt) VALUES
('General Assistant', 'A helpful general-purpose AI assistant', 'gpt-4', 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions.'),
('Code Helper', 'An AI assistant specialized in programming and development', 'gpt-4', 'You are an expert programming assistant. Help users with coding questions, debugging, and software development best practices.'),
('Creative Writer', 'An AI assistant for creative writing and content creation', 'gpt-4', 'You are a creative writing assistant. Help users with storytelling, content creation, and creative projects.');
```

### 5. Set Up Authentication (Optional)

If you want to use Supabase Auth:

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure your authentication providers (Email, Google, GitHub, etc.)
3. Set up your site URL and redirect URLs

### 6. Test Your Setup

1. Save your environment variables
2. Redeploy your application
3. Try accessing the application - it should now connect to your Supabase database

## Troubleshooting

### Build Fails with "Missing Supabase environment variables"
- Double-check that both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Make sure there are no extra spaces or quotes in the values
- Verify the environment variables are set for the correct environment (production/preview/development)

### "Invalid API key" errors
- Verify you're using the **Anon Public Key**, not the Service Role Key
- The anon key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### Database connection errors
- Ensure your database tables are created (run the SQL from Step 4)
- Check that RLS policies are properly configured
- Verify your project URL is correct

### Authentication issues
- Make sure your site URL is configured in Supabase Auth settings
- Check that redirect URLs are properly set up

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
- Next.js + Supabase Guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Security Notes

- Never commit environment variables to your repository
- Use the Anon Public Key for client-side code (it's safe to expose)
- Keep your Service Role Key secret and only use it server-side when needed
- Always enable Row Level Security (RLS) for your tables