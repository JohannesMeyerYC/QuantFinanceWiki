#!/bin/bash
set -e

PROJECT_ID="quantfinancewiki-480611"
BUCKET_NAME="static-assets-quantfinancewiki"
SERVICE_NAME="qfw-frontend"
REGION="us-central1"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

npm run build

docker buildx build --platform linux/amd64 --push -t $IMAGE_TAG -f Dockerfile.frontend .

gsutil -m rsync -r -d ./dist gs://$BUCKET_NAME

gsutil -m setmeta -h "Content-Type:font/woff2" -h "Cache-Control:public, max-age=31536000, immutable" "gs://$BUCKET_NAME/fonts/*.woff2"
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://$BUCKET_NAME/assets/*"
gsutil setmeta -h "Cache-Control:no-store, no-cache, must-revalidate" "gs://$BUCKET_NAME/index.html"

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --min-instances 1 \
  --allow-unauthenticated