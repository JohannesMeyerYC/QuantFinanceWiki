#!/bin/bash

set -e

PROJECT_ID="quantfinancewiki-480611"
IMAGE_NAME="qfw-backend"
REGION="us-central1"
IMAGE_URL="gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest"

docker buildx build -t $IMAGE_URL -f Dockerfile.backend .

docker push $IMAGE_URL

gcloud run deploy $IMAGE_NAME \
  --image $IMAGE_URL \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 5000