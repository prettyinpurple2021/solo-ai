# Google Cloud Platform Migration Guide

This guide will help you migrate your SoloBoss AI Platform from Netlify to Google Cloud Run using your AI Startup Program credits.

## 🏁 Prerequisites

1. **Google Cloud Account** with AI Startup Program credits applied
2. **Google Cloud CLI** installed on your machine
3. **Docker** installed and running
4. **Git repository** with your code

## 📋 Step 1: Set Up Google Cloud Project

### 1.1 Install Google Cloud CLI
```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
# Or use package managers:

# On macOS
brew install google-cloud-sdk

# On Windows (via chocolatey)
choco install gcloudsdk

# On Ubuntu/Debian
sudo apt-get install google-cloud-cli
```

### 1.2 Authenticate and Create Project
```bash
# Authenticate with Google Cloud
gcloud auth login

# Create a new project (or use existing one)
gcloud projects create soloboss-ai-platform --name="SoloBoss AI Platform"

# Set as default project
gcloud config set project soloboss-ai-platform

# Enable billing (apply your startup credits here)
# Go to: https://console.cloud.google.com/billing
```

### 1.3 Enable Required APIs
```bash
# Enable necessary services
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable compute.googleapis.com
```

## 🔐 Step 2: Set Up Environment Variables

### 2.1 Export Your Netlify Environment Variables
1. Go to your Netlify dashboard → Site settings → Environment variables
2. Copy all your environment variables

### 2.2 Create Secrets in Google Cloud Secret Manager
```bash
# Create secrets for sensitive data
gcloud secrets create DATABASE_URL --data-file=- <<< "your-database-url"
gcloud secrets create NEXTAUTH_SECRET --data-file=- <<< "your-nextauth-secret"
gcloud secrets create STACK_AUTH_KEY --data-file=- <<< "your-stack-auth-key"

# Add more secrets as needed for your API keys
gcloud secrets create OPENAI_API_KEY --data-file=- <<< "your-openai-key"
gcloud secrets create ANTHROPIC_API_KEY --data-file=- <<< "your-anthropic-key"
```

## 🚀 Step 3: Deploy to Google Cloud Run

### Option A: Quick Deploy (Recommended for first time)
```bash
# Make the deploy script executable
chmod +x deploy-gcp.sh

# Run the deployment script
./deploy-gcp.sh
```

### Option B: Manual Deployment
```bash
# Build the Docker image
docker build -t gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest .

# Configure Docker for GCP
gcloud auth configure-docker

# Push the image
docker push gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest

# Deploy to Cloud Run
gcloud run deploy soloboss-ai-platform \
  --image gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300
```

## 🔧 Step 4: Configure Environment Variables for Cloud Run

### 4.1 Set Environment Variables
```bash
# Set basic environment variables
gcloud run services update soloboss-ai-platform \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,PORT=3000

# Set secrets from Secret Manager
gcloud run services update soloboss-ai-platform \
  --region us-central1 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest
```

### 4.2 Update Service with All Environment Variables
Create a `.env.gcp` file with all your variables, then:
```bash
gcloud run services update soloboss-ai-platform \
  --region us-central1 \
  --env-vars-file .env.gcp
```

## 🌐 Step 5: Set Up Custom Domain (Optional)

### 5.1 Map Custom Domain
```bash
# Map your domain to Cloud Run
gcloud run domain-mappings create \
  --service soloboss-ai-platform \
  --domain your-domain.com \
  --region us-central1
```

### 5.2 Update DNS Records
The command above will provide DNS records to add to your domain registrar.

## 📊 Step 6: Set Up Monitoring

### 6.1 Enable Cloud Monitoring
```bash
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

### 6.2 Set Up Alerts (Optional)
Go to Cloud Console → Monitoring → Alerting to set up alerts for:
- High CPU usage
- Memory usage
- Error rates
- Request latency

## 🔄 Step 7: Set Up CI/CD with GitHub Actions

### 7.1 Create Service Account for GitHub Actions
```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name "GitHub Actions"

# Grant necessary roles
gcloud projects add-iam-policy-binding soloboss-ai-platform \
  --member serviceAccount:github-actions@soloboss-ai-platform.iam.gserviceaccount.com \
  --role roles/run.admin

gcloud projects add-iam-policy-binding soloboss-ai-platform \
  --member serviceAccount:github-actions@soloboss-ai-platform.iam.gserviceaccount.com \
  --role roles/storage.admin

gcloud projects add-iam-policy-binding soloboss-ai-platform \
  --member serviceAccount:github-actions@soloboss-ai-platform.iam.gserviceaccount.com \
  --role roles/iam.serviceAccountUser

# Create and download service account key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account github-actions@soloboss-ai-platform.iam.gserviceaccount.com
```

### 7.2 Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions:

1. Add `GCP_SERVICE_ACCOUNT_KEY`: Content of `github-actions-key.json`
2. Add any other environment variables as secrets

### 7.3 Push to Trigger Deployment
The GitHub Actions workflow (`.github/workflows/deploy-gcp.yml`) will automatically deploy when you push to main/master.

## 🧪 Step 8: Test Your Deployment

### 8.1 Health Check
```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe soloboss-ai-platform \
  --region us-central1 \
  --format 'value(status.url)')

# Test health endpoint
curl ${SERVICE_URL}/api/health
```

### 8.2 Test Application Features
1. Visit your application URL
2. Test authentication
3. Test AI features
4. Test database connections
5. Check all major functionality

## 💰 Step 9: Cost Optimization

### 9.1 Set Up Budget Alerts
```bash
# Create budget alert (replace with your billing account ID)
gcloud billing budgets create \
  --billing-account BILLING_ACCOUNT_ID \
  --display-name "SoloBoss AI Platform Budget" \
  --budget-amount 100USD \
  --threshold-rule threshold-percent=0.9,spend-basis=current-spend
```

### 9.2 Optimize Resource Usage
- Cloud Run automatically scales to zero when not in use
- Monitor usage in Cloud Console → Cloud Run → Metrics
- Adjust CPU and memory limits based on actual usage

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Docker build locally first
2. **Environment Variables**: Verify all secrets are properly set
3. **Database Connection**: Ensure Neon DB allows connections from GCP
4. **Port Issues**: Make sure your app listens on the PORT environment variable
5. **Authentication Issues**: Check that all auth-related environment variables are set

### Debug Commands:
```bash
# View service logs
gcloud logs read --service soloboss-ai-platform

# Describe service configuration
gcloud run services describe soloboss-ai-platform --region us-central1

# List revisions
gcloud run revisions list --service soloboss-ai-platform --region us-central1
```

## 📚 Next Steps

After successful migration:
1. Update any external services pointing to your old Netlify URL
2. Set up monitoring and alerting
3. Configure backup strategies
4. Consider setting up staging environment
5. Implement proper logging and monitoring

## 🆘 Support

If you encounter issues:
1. Check the Cloud Run logs: `gcloud logs read --service soloboss-ai-platform`
2. Review the GitHub Actions workflow logs
3. Test locally with Docker first
4. Check Google Cloud Status page for any outages

---

**Congratulations! Your SoloBoss AI Platform is now running on Google Cloud Platform!** 🎉

Your application will benefit from:
- Automatic scaling
- Global edge locations
- Built-in monitoring
- Cost-effective pay-per-use pricing
- Enterprise-grade security

Remember to monitor your usage to make the most of your AI Startup Program credits!
