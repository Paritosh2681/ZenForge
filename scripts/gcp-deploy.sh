#!/bin/bash

# ZenForge Google Cloud Deployment Script
# This script deploys ZenForge to Google Cloud Run with an Ollama sidecar.

PROJECT_ID="gurucortex"
REGION="us-central1"
REPO_NAME="zenforge"
BACKEND_SERVICE="zenforge-backend"
FRONTEND_SERVICE="zenforge-frontend"

echo "🚀 Starting Deployment to Google Cloud Project: $PROJECT_ID"

# 0. Set Project
gcloud config set project $PROJECT_ID

# 1. Create Artifact Registry if it doesn't exist
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="ZenForge Container Repository" || echo "Repository already exists"

# 2. Build and Push Images using Cloud Build
echo "📦 Building and pushing images (including custom Ollama with pre-pulled models)..."
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_AR_REGION=$REGION,_AR_REPO=$REPO_NAME

# 3. Deploy Backend to Cloud Run with Ollama Sidecar using backend-service.yaml
echo "☁️ Deploying Backend with Ollama sidecar..."
gcloud run services replace backend-service.yaml --region $REGION

# 4. Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# 5. Deploy Frontend
# Since Next.js bakes in NEXT_PUBLIC_ variables at build time, 
# we might need to rebuild or ensure the frontend uses it dynamically.
# For now, we'll deploy and set the env var.
echo "☁️ Deploying Frontend..."
gcloud run deploy $FRONTEND_SERVICE \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/zenforge-frontend:latest \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format='value(status.url)')

echo "🎉 Deployment Complete!"
echo "--------------------------------"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "--------------------------------"
echo "NOTE: GCS Fuse is enabled for persistent storage in gs://zenforge-data-gurucortex"
