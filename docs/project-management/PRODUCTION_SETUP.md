# SoloBoss AI Platform - Production Setup Guide

## 🚀 Critical Production Environment Variables

### **Required for Core Functionality**

#### 1. **Stack Auth Configuration**
These are **CRITICAL** for authentication to work:

```bash
# Stack Auth Project ID (from Stack Auth dashboard)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id

# Stack Auth Publishable Client Key (public)
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_client_key

# Stack Auth Secret Server Key (private - keep secure)
STACK_SECRET_SERVER_KEY=your_secret_server_key
```

#### 2. **Database Configuration**
Required for all data persistence:

```bash
# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Secret for authentication tokens
JWT_SECRET=your_secure_jwt_secret_key_here
```

#### 3. **AI Services**
Required for AI agent functionality:

```bash
# OpenAI API Key for AI agents and task intelligence
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### **Optional but Recommended**

#### 4. **Email Services**
For user notifications and email confirmations:

```bash
# Resend API Key for email delivery
RESEND_API_KEY=your_resend_api_key

# From email address for notifications
FROM_EMAIL=noreply@yourdomain.com
```

#### 5. **App Configuration**
For proper URL handling:

```bash
# Your production app URL
NEXT_PUBLIC_APP_URL=https://your-app.com
```

## 🔧 Setup Instructions

### **Step 1: Stack Auth Setup**

1. **Create Stack Auth Project**
   - Go to [Stack Auth Dashboard](https://stack-auth.com)
   - Create a new project
   - Copy the Project ID, Publishable Key, and Secret Key

2. **Configure Authentication**
   - Add your production domain to allowed origins
   - Configure email templates if using email authentication

### **Step 2: Neon Database Setup**

1. **Create Neon Database**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy the connection string

2. **Run Database Migrations**
   ```bash
   # Run the migration scripts
   npm run db:migrate
   ```

### **Step 3: OpenAI Setup**

1. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Create an API key
   - Ensure you have sufficient credits

### **Step 4: Environment Variables**

1. **Access Your Hosting Dashboard**
   - Go to your hosting provider's dashboard (e.g., Google Cloud Run)
   - Navigate to the environment variables section for your service.

2. **Add All Required Variables**
   - Add each environment variable listed above
   - Ensure all values are correct and secure

3. **Redeploy Application**
   - Trigger a new deployment after adding environment variables
   - Monitor the build logs for any errors

## 🧪 Testing Production Setup

### **Authentication Test**
1. Try to sign up a new user
2. Verify email confirmation works
3. Test sign-in functionality
4. Check user profile creation

### **Database Test**
1. Create a new task or goal
2. Verify data persistence
3. Check user data loading

### **AI Features Test**
1. Try chatting with an AI agent
2. Test task intelligence features
3. Verify AI responses are working

## 🚨 Troubleshooting

### **Common Issues**

1. **Authentication Not Working**
   - Check Stack Auth environment variables
   - Verify domain is added to allowed origins
   - Check browser console for errors

2. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure SSL mode is properly configured

3. **AI Features Not Working**
   - Verify OPENAI_API_KEY is valid
   - Check OpenAI account has sufficient credits
   - Monitor API usage and limits

### **Debug Steps**

1. **Check Environment Variables**
   - In your hosting environment's logs, you can log env vars (be careful with secrets)
   ```javascript
   console.log('Environment check:', {
     hasStackProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
     hasDatabaseUrl: !!process.env.DATABASE_URL,
     hasOpenAIKey: !!process.env.OPENAI_API_KEY
   })
   ```

2. **Monitor Build Logs**
   - Check your hosting provider's build logs for environment variable errors
   - Look for missing dependency errors

3. **Test Locally with Production Variables**
   - Copy production environment variables to local `.env.local`
   - Test functionality locally before deploying

## 📊 Monitoring & Maintenance

### **Regular Checks**
- Monitor OpenAI API usage and costs
- Check database performance and storage
- Review authentication logs for security issues
- Monitor application error rates

### **Backup Strategy**
- Regular database backups via Neon
- Environment variable documentation
- Configuration backup in version control

---

**Last Updated:** January 2025
**Status:** Production Ready
**Next Review:** After deployment
