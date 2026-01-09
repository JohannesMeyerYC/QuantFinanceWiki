#!/bin/bash
set -e

PROJECT_ID="quantfinancewiki-480611"
SERVICE_NAME="qfw-frontend"
REGION="us-central1"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🔨 Building Docker image..."
docker buildx build --platform linux/amd64 --push -t $IMAGE_TAG -f Dockerfile.frontend .

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --min-instances 1 \
  --allow-unauthenticated \
  --update-env-vars "VITE_API_URL=https://qfw-backend-442397816710.us-central1.run.app"

echo "✅ Deployment complete!"