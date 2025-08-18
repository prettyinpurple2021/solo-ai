#!/bin/bash

# Environment Variables Migration Script
# This script helps you migrate environment variables from Netlify to Google Cloud Secret Manager

set -e

PROJECT_ID="soloboss-ai-platform"
SERVICE_NAME="soloboss-ai-platform"
REGION="us-central1"

echo "🔐 Environment Variables Migration Script"
echo "========================================"
echo "This script will help you migrate your environment variables to Google Cloud."
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Please authenticate with Google Cloud first:"
    echo "   gcloud auth login"
    exit 1
fi

# Set the project
gcloud config set project ${PROJECT_ID}

echo "📝 Please create a file called '.env.netlify' with your Netlify environment variables"
echo "Format: KEY=value (one per line)"
echo ""
echo "Example:"
echo "DATABASE_URL=postgresql://user:pass@host:5432/db"
echo "OPENAI_API_KEY=sk-..."
echo "STACK_AUTH_KEY=..."
echo ""
echo "Press Enter when ready to continue..."
read -r

if [ ! -f ".env.netlify" ]; then
    echo "❌ .env.netlify file not found. Please create it first."
    exit 1
fi

echo "🔄 Processing environment variables..."

# Read the .env.netlify file and create secrets
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" == \#* ]] && continue
    
    # Remove any surrounding quotes from value
    value=$(echo "$value" | sed 's/^["'"'"']//;s/["'"'"']$//')
    
    echo "Creating secret for: $key"
    
    # Create secret in Google Cloud Secret Manager
    echo "$value" | gcloud secrets create "$key" --data-file=- || {
        echo "⚠️  Secret $key might already exist. Updating..."
        echo "$value" | gcloud secrets versions add "$key" --data-file=-
    }
    
done < .env.netlify

echo ""
echo "✅ All secrets created in Google Cloud Secret Manager!"
echo ""
echo "🔧 Now updating Cloud Run service to use these secrets..."

# Build the secrets mapping for Cloud Run
SECRETS_MAPPING=""
while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    
    if [ -z "$SECRETS_MAPPING" ]; then
        SECRETS_MAPPING="${key}=${key}:latest"
    else
        SECRETS_MAPPING="${SECRETS_MAPPING},${key}=${key}:latest"
    fi
done < .env.netlify

# Update the Cloud Run service with secrets
echo "Updating Cloud Run service with environment variables..."
gcloud run services update ${SERVICE_NAME} \
    --region ${REGION} \
    --set-secrets "$SECRETS_MAPPING" \
    --set-env-vars NODE_ENV=production,PORT=3000

echo ""
echo "✅ Cloud Run service updated with environment variables!"
echo ""
echo "🧹 Cleaning up..."
echo "Please delete the .env.netlify file as it contains sensitive information:"
echo "   rm .env.netlify"
echo ""
echo "🔍 To verify your secrets were created:"
echo "   gcloud secrets list"
echo ""
echo "🚀 Your environment variables are now securely stored in Google Cloud Secret Manager"
echo "   and your Cloud Run service is configured to use them!"

# Optional: List created secrets
echo ""
echo "📋 Created secrets:"
gcloud secrets list --format="table(name)"
