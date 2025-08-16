# Environment Variables Guide for Google Cloud Deployment

When migrating from Netlify to Google Cloud Platform, you'll need to transfer your environment variables. This guide explains how to manage environment variables in Google Cloud Run.

## Required Environment Variables

Make sure to set up the following environment variables in your Cloud Run service:

```
# Database
DATABASE_URL=your_neon_postgres_url

# Authentication
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Chargebee (if used)
CHARGEBEE_API_KEY=your_chargebee_api_key
CHARGEBEE_SITE=your_chargebee_site
CHARGEBEE_WEBHOOK_SIGNING_KEY=your_chargebee_webhook_signing_key

# Email (if used)
FROM_EMAIL=your_from_email
RESEND_API_KEY=your_resend_api_key

# Public variables (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key

# Stack Auth
STACK_SECRET_SERVER_KEY=your_stack_secret_key
```

## Setting Environment Variables in Cloud Run

### Option 1: Using the Google Cloud Console

1. Go to the [Cloud Run console](https://console.cloud.google.com/run)
2. Select your service
3. Click "Edit and Deploy New Revision"
4. Scroll to "Container, Networking, Security"
5. Expand "Environment Variables"
6. Add each variable with its key and value
7. Click "Deploy"

### Option 2: Using the gcloud CLI

You can set environment variables using the gcloud command-line tool:

```bash
gcloud run services update soloboss-ai-platform \
  --region=us-central1 \
  --set-env-vars="KEY1=VALUE1,KEY2=VALUE2"
```

For many variables, use a file:

```bash
# Create a env-vars.txt file with KEY=VALUE pairs
gcloud run services update soloboss-ai-platform \
  --region=us-central1 \
  --update-env-vars-file=env-vars.txt
```

### Option 3: Using Secret Manager (Recommended for Sensitive Values)

For sensitive values, use Secret Manager:

1. Create secrets:
```bash
echo -n "your-secret-value" | gcloud secrets create my-secret --data-file=-
```

2. Grant access to your Cloud Run service:
```bash
gcloud secrets add-iam-policy-binding my-secret \
  --member=serviceAccount:YOUR-PROJECT-NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

3. Reference in Cloud Run:
```bash
gcloud run services update soloboss-ai-platform \
  --region=us-central1 \
  --set-secrets=MY_ENV_VAR=my-secret:latest
```

## Environment Variables in cloudbuild.yaml

To set environment variables during the build process, add them to your cloudbuild.yaml file:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/soloboss-ai-platform:$COMMIT_SHA', '.']
    env:
      - 'NODE_ENV=production'
      - 'NEXT_PUBLIC_APP_URL=https://your-domain.com'
```

## Testing Environment Variables

To verify your environment variables are set correctly:

1. Deploy your service
2. Add a temporary API route that returns non-sensitive environment variables
3. Check the Cloud Run logs for any environment-related errors

## Troubleshooting

If you encounter issues:

1. Check for typos in variable names
2. Verify that all required variables are set
3. Ensure proper formatting (no quotes around values in the Cloud Console)
4. Check service account permissions for Secret Manager
5. Review Cloud Run logs for specific error messages
