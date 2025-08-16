# Next Steps for Google Cloud Migration

Now that you have the configuration files for deploying to Google Cloud Platform, here are the next steps to complete the migration:

## 1. Set Up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project
4. Enable required APIs:
   - Cloud Run API
   - Container Registry API
   - Cloud Build API
   - Secret Manager API (for secure environment variables)

## 2. Install and Configure Google Cloud SDK

1. Download and install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Initialize the SDK:
   ```bash
   gcloud init
   ```
3. Configure Docker to use Google Container Registry:
   ```bash
   gcloud auth configure-docker
   ```

## 3. Test Docker Build Locally

1. Build the Docker image locally:
   ```bash
   docker build -t soloboss-ai-platform .
   ```
2. Test the image locally:
   ```bash
   docker run -p 3000:3000 soloboss-ai-platform
   ```
3. Visit http://localhost:3000 to verify it works

## 4. Set Up Environment Variables

1. Create a file with your environment variables (do not commit this file)
2. Set these variables in Google Cloud Secret Manager or directly in Cloud Run

## 5. Deploy to Google Cloud Run

1. Tag and push your Docker image:
   ```bash
   docker tag soloboss-ai-platform gcr.io/YOUR_PROJECT_ID/soloboss-ai-platform
   docker push gcr.io/YOUR_PROJECT_ID/soloboss-ai-platform
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy soloboss-ai-platform \
     --image=gcr.io/YOUR_PROJECT_ID/soloboss-ai-platform \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated
   ```

## 6. Set Up Continuous Deployment

1. Connect your GitHub repository to Cloud Build
2. Create a build trigger using the cloudbuild.yaml file

## 7. Configure Custom Domain

1. Map your domain in Cloud Run
2. Update DNS records as outlined in the DNS migration guide
3. Wait for DNS propagation

## 8. Verify and Test

1. Test all functionality on the new deployment
2. Check that environment variables are working correctly
3. Verify SSL certificate is properly configured

## 9. Optimize and Monitor

1. Set up monitoring and logging
2. Configure alerting for errors
3. Optimize instance count and memory allocation

## 10. Decommission Netlify (After Successful Migration)

1. Remove custom domain from Netlify
2. Consider pausing or deleting the Netlify site

## Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud DNS Documentation](https://cloud.google.com/dns/docs)

Remember to follow the detailed instructions in the setup guide, environment variables guide, and DNS migration guide that have been added to your repository.
