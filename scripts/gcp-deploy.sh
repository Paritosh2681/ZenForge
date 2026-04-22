#!/bin/bash

# ZenForge Google Cloud Deployment Script
# This script deploys ZenForge to Google Cloud Run with an Ollama sidecar.

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
REPO_NAME="zenforge"
BACKEND_SERVICE="zenforge-backend"
FRONTEND_SERVICE="zenforge-frontend"

echo "🚀 Starting Deployment to Google Cloud Project: $PROJECT_ID"

# 1. Create Artifact Registry if it doesn't exist
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="ZenForge Container Repository" || echo "Repository already exists"

# 2. Build and Push Images using Cloud Build
echo "📦 Building and pushing images..."
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_AR_REGION=$REGION,_AR_REPO=$REPO_NAME

# 3. Deploy Backend to Cloud Run with Ollama Sidecar
echo "☁️ Deploying Backend with Ollama sidecar..."

# Create a YAML configuration for Cloud Run with sidecar
cat <<EOF > service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: $BACKEND_SERVICE
  annotations:
    run.googleapis.com/launch-stage: BETA
spec:
  template:
    spec:
      containers:
      - image: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/zenforge-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OLLAMA_BASE_URL
          value: "http://localhost:11434"
        - name: OLLAMA_MODEL
          value: "gemma:2b"
      - image: ollama/ollama:latest
        env:
        - name: OLLAMA_HOST
          value: "0.0.0.0"
        # We'll need a startup command to pull the model if not pre-baked
        # Alternatively, use a custom image with the model pre-loaded
EOF

gcloud run services replace service.yaml --region $REGION

# 4. Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# 5. Deploy Frontend
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
echo "NOTE: You may need to manually pull the gemma:2b model into the sidecar or use a custom Ollama image."
