# DNS Migration Guide: Netlify to Google Cloud

This guide will help you migrate your domain from Netlify to Google Cloud Platform.

## Prerequisites

1. Access to your domain registrar account
2. Owner/admin access to your Google Cloud project
3. Your domain currently configured in Netlify

## Step 1: Prepare Your Cloud Run Service

Before changing DNS settings, make sure your Cloud Run service is deployed and working:

```bash
# Deploy your service if not already deployed
gcloud run deploy soloboss-ai-platform \
  --image=gcr.io/YOUR_PROJECT_ID/soloboss-ai-platform \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

Test your service using the default Cloud Run URL before proceeding.

## Step 2: Map Your Custom Domain in Cloud Run

1. Go to the [Cloud Run console](https://console.cloud.google.com/run)
2. Select your service
3. Go to the "Domain Mappings" tab
4. Click "Add Mapping"
5. Enter your domain name (e.g., solobossai.fun or www.solobossai.fun)
6. Follow the verification process if prompted

## Step 3: Verify Domain Ownership

Google Cloud will provide you with verification records to add to your DNS:

1. Add the provided TXT record to your domain's DNS settings
2. Wait for verification to complete (can take up to 24-48 hours)

## Step 4: Get SSL Certificate

After verification:

1. Google Cloud will automatically provision an SSL certificate
2. This process may take some time (usually less than an hour)

## Step 5: Update DNS Records

### Option A: If using Google Domains or Cloud DNS

If your domain is managed by Google Domains or Cloud DNS, follow the prompts in the Cloud Console to update your records automatically.

### Option B: If using another domain registrar

1. Log in to your domain registrar
2. Find the DNS management section
3. Remove any existing A or CNAME records pointing to Netlify
4. Add a new CNAME record:
   - Name: www (or @ for root domain)
   - Value: ghs.googlehosted.com
   - TTL: 3600 (or 1 hour)

If you need to map the root domain (solobossai.fun), you may need to use your registrar's domain forwarding feature or set up an A record as directed by Google Cloud.

## Step 6: Wait for DNS Propagation

DNS changes can take 24-48 hours to fully propagate. During this time:

1. Some users might still be directed to Netlify
2. Others will see the new Google Cloud hosted version
3. Use [dnschecker.org](https://dnschecker.org) to monitor propagation

## Step 7: Test Your Domain

After DNS propagation:

1. Visit your domain in a browser
2. Verify HTTPS is working correctly
3. Test key functionality

## Step 8: Clean Up Netlify Configuration

Once the migration is complete:

1. Log in to your Netlify account
2. Go to your site settings
3. Remove the custom domain from your Netlify site
4. Consider pausing or deleting the Netlify site if no longer needed

## Troubleshooting

### SSL Certificate Issues

If your SSL certificate isn't working:
1. Verify DNS records are correct
2. Check the status in Google Cloud Console
3. You may need to request a new certificate if there were issues

### Domain Not Resolving

If your domain isn't resolving to Google Cloud:
1. Verify DNS records are correct and propagated
2. Check Cloud Run domain mapping status
3. Ensure your Cloud Run service is deployed and public

### Mixed Content Warnings

If you see mixed content warnings:
1. Update any hardcoded HTTP URLs in your code
2. Check for resources loaded from other domains without HTTPS

## Maintaining Both Temporarily

If you want to maintain both services during migration:
1. Set up a subdomain for testing (e.g., gcp.solobossai.fun)
2. Point only that subdomain to Google Cloud
3. Test thoroughly before migrating the main domain
