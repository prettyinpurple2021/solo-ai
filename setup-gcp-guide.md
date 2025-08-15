# Google Cloud Platform Setup Guide for SoloBoss AI

This guide will walk you through setting up your Next.js application on Google Cloud Platform using Cloud Run.

## Prerequisites

1. A Google Cloud Platform account with billing enabled
2. Google Cloud SDK installed on your local machine
3. Docker installed on your local machine

## Step 1: Set Up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID as you'll need it later

```bash
# Set your project ID
PROJECT_ID="your-project-id"

# Set the active project
gcloud config set project $PROJECT_ID
```

## Step 2: Enable Required APIs

Enable the necessary APIs for your project:

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

## Step 3: Set Up Authentication

```bash
# Create a service account for deployment
gcloud iam service-accounts create soloboss-deployer

# Grant the necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:soloboss-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:soloboss-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download a key file
gcloud iam service-accounts keys create soloboss-deployer-key.json \
  --iam-account=soloboss-deployer@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 4: Configure Environment Variables

Create a `.env.production` file with your production environment variables. Then set these as secrets in Cloud Run:

```bash
# Example of setting environment variables
gcloud run services update soloboss-ai-platform \
  --region=us-central1 \
  --set-env-vars="DATABASE_URL=your_database_url,JWT_SECRET=your_jwt_secret"
```

## Step 5: Manual Deployment (First Time)

For the first deployment, you can manually build and deploy:

```bash
# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/soloboss-ai-platform .

# Push the image to Container Registry
docker push gcr.io/$PROJECT_ID/soloboss-ai-platform

# Deploy to Cloud Run
gcloud run deploy soloboss-ai-platform \
  --image=gcr.io/$PROJECT_ID/soloboss-ai-platform \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1
```

## Step 6: Set Up Continuous Deployment

1. Connect your GitHub repository to Cloud Build
2. Create a trigger that uses the `cloudbuild.yaml` file in your repository
3. Configure the trigger to run on pushes to your main branch

## Step 7: Configure Custom Domain

1. Get the URL of your deployed Cloud Run service
2. Go to your domain registrar and update DNS settings:
   - Add a CNAME record pointing to `ghs.googlehosted.com`
   - Add a TXT record for domain verification

3. In the Cloud Run console:
   - Select your service
   - Go to "Domain Mappings"
   - Add your custom domain
   - Follow the verification steps

## Step 8: Monitoring and Logging

1. Set up monitoring in Google Cloud Console
2. Configure alerts for errors or high resource usage
3. Review logs regularly in the Cloud Run console

## Cost Optimization Tips

1. Set appropriate min and max instances (start with min=0)
2. Monitor usage and adjust memory/CPU allocations
3. Use Cloud Scheduler for regular warm-up requests if cold starts are an issue
4. Consider setting up budget alerts in the Billing section

## Troubleshooting

If you encounter issues:

1. Check the Cloud Run logs for error messages
2. Verify environment variables are set correctly
3. Test your Docker container locally before deployment
4. Ensure all required APIs are enabled
