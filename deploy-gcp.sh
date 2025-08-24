#!/bin/bash

# Google Cloud Run Deployment Script
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration
PROJECT_ID="soloboss-ai-v3"
SERVICE_NAME="soloboss-ai-platform"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting deployment to Google Cloud Run..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Please authenticate with Google Cloud first:"
    echo "   gcloud auth login"
    exit 1
fi

# Set the project
echo "📋 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Enable required services
echo "🔧 Enabling required Google Cloud services..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build the Docker image
echo "🏗️ Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Push the image to Google Container Registry
echo "📦 Pushing image to Google Container Registry..."
gcloud auth configure-docker
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --min-instances 0 \
  --concurrency 80 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production,PORT=3000

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region ${REGION} \
  --format 'value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is available at: ${SERVICE_URL}"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables using Google Secret Manager"
echo "2. Configure your domain (if needed)"
echo "3. Set up monitoring and logging"

# Optional: Open the application in browser
if command -v xdg-open > /dev/null; then
    echo "🔍 Opening application in browser..."
    xdg-open ${SERVICE_URL}
elif command -v open > /dev/null; then
    echo "🔍 Opening application in browser..."
    open ${SERVICE_URL}
fi
