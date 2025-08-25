# 🚀 Quick Start: Deploy to Google Cloud

This is your **immediate action plan** to deploy your SoloBoss AI Platform to Google Cloud.

## ⚡ Prerequisites (5 minutes)

1. **Google Cloud SDK installed** ([Download here](https://cloud.google.com/sdk/docs/install))
2. **Docker installed** and running
3. **Your AI Startup Program credits** applied to your Google account

## 🏃‍♂️ Step-by-Step Deployment (30 minutes)

### 1. Set Up Google Cloud (5 minutes)

```bash
# Authenticate with Google Cloud
gcloud auth login

# Create your project
gcloud projects create soloboss-ai-platform --name="SoloBoss AI Platform"
gcloud config set project soloboss-ai-platform

# Enable required services (this takes 2-3 minutes)
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

### 2. Quick Deploy (10 minutes)

The fastest way to get your app running:

```bash
# Navigate to your project directory
cd "path/to/your/v0-solo-boss-ai-platform"

# Make deployment script executable (if on Linux/Mac)
chmod +x deploy-gcp.sh

# Deploy (this will build, push, and deploy automatically)
./deploy-gcp.sh
```

**For Windows users:** Run the commands from `deploy-gcp.sh` manually:

```powershell
# Build Docker image
docker build -t gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest .

# Configure Docker for GCP
gcloud auth configure-docker

# Push image
docker push gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest

# Deploy to Cloud Run
gcloud run deploy soloboss-ai-platform --image gcr.io/soloboss-ai-platform/soloboss-ai-platform:latest --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --cpu 2 --max-instances 10 --concurrency 80 --timeout 300
```

### 3. Set Up Environment Variables (10 minutes)

Create a `.env` file in your project root with all your environment variables.

Example `.env`:
```env
DATABASE_URL=postgresql://your-neon-connection-string
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
STACK_SECRET_SERVER_KEY=your-stack-secret
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
RESEND_API_KEY=re_your-resend-key
# ... add all your other env vars
```

3. **Run a script to create secrets in Google Cloud Secret Manager and configure your Cloud Run service to use them.**

### 4. Test Your Deployment (5 minutes)

```bash
# Get your new app URL
SERVICE_URL=$(gcloud run services describe soloboss-ai-platform --region us-central1 --format 'value(status.url)')
echo "Your app is live at: $SERVICE_URL"

# Test the health endpoint
curl $SERVICE_URL/api/health

# Open in browser
echo "Visit: $SERVICE_URL"
```

## ✅ What This Deployment Gives You

### 💰 **Cost Savings**
- **Google Cloud Run scales to zero** - you only pay for requests
- **Your AI Startup credits** cover significant usage

### 🚀 **Performance Benefits**
- **Fast cold starts**
- **2GB memory, 2 CPU** allocation
- **Global edge network** with Google's infrastructure

### 🔧 **Better Developer Experience**
- **Real Docker container** deployment
- **Better logging and monitoring** with Google Cloud Console
- **More control** over the runtime environment

## 🔄 Setting Up Continuous Deployment

After your initial deployment works, set up GitHub Actions:

1. **Create a service account:**
```bash
gcloud iam service-accounts create github-actions --display-name "GitHub Actions"
gcloud projects add-iam-policy-binding soloboss-ai-platform --member serviceAccount:github-actions@soloboss-ai-platform.iam.gserviceaccount.com --role roles/run.admin
gcloud projects add-iam-policy-binding soloboss-ai-platform --member serviceAccount:github-actions@soloboss-ai-platform.iam.gserviceaccount.com --role roles/storage.admin
gcloud iam service-accounts keys create github-actions-key.json --iam-account github-actions@soloboss-ai-platform.iam.gserviceaccount.com
```

2. **Add to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add `GCP_SERVICE_ACCOUNT_KEY` with the contents of `github-actions-key.json`

3. **Push to deploy:**
   - The workflow in `.github/workflows/deploy-gcp.yml` will automatically deploy on push to main

## 🆘 Troubleshooting

### If the build fails:
```bash
# Test Docker build locally first
docker build -t test-build .

# Check the build logs
gcloud builds list
gcloud builds log [BUILD_ID]
```

### If environment variables don't work:
```bash
# List your secrets
gcloud secrets list

# Check Cloud Run service configuration
gcloud run services describe soloboss-ai-platform --region us-central1
```

### If your database doesn't connect:
- Verify your `DATABASE_URL` is correct
- Neon DB should work from Google Cloud without additional configuration
- Check the logs: `gcloud logs read --service soloboss-ai-platform`

## 🎉 Success Checklist

- [ ] ✅ Google Cloud project created and billing enabled
- [ ] ✅ Docker image built and pushed to GCR
- [ ] ✅ Cloud Run service deployed and running
- [ ] ✅ Environment variables migrated to Secret Manager
- [ ] ✅ Health check endpoint responding: `/api/health`
- [ ] ✅ Application loads in browser
- [ ] ✅ Authentication works (if Stack Auth is configured)
- [ ] ✅ Database connections work
- [ ] ✅ AI features work (if API keys are configured)

## 🌟 Next Steps

1. **Custom Domain:** Point your domain to the Cloud Run URL
2. **Monitoring:** Set up alerting for errors and performance
3. **Scaling:** Adjust CPU/memory based on actual usage
4. **Optimization:** Monitor costs and adjust scaling parameters

---

**Your SoloBoss AI Platform is now running on Google Cloud!** 🎉

This deployment will give you a robust, scalable application.

Need help? Check the full `GCP-MIGRATION-GUIDE.md` for detailed instructions.
