#!/bin/bash

# Build and push Docker images to registry
# Usage: ./build-and-push.sh [registry] [version]

REGISTRY="${1:-pifses}"
VERSION="${2:-latest}"

echo "Building PIFSES Docker images..."
echo "Registry: $REGISTRY, Version: $VERSION"

# Build API Gateway
echo "Building API Gateway..."
docker build -t $REGISTRY/api-gateway:$VERSION ./backend/api-gateway

# Build Forecasting Service
echo "Building Forecasting Service..."
docker build -t $REGISTRY/forecasting-service:$VERSION ./backend/forecasting-service

# Build Integration Service
echo "Building Integration Service..."
docker build -t $REGISTRY/integration-service:$VERSION ./backend/integration-service

# Build ML Pipeline
echo "Building ML Pipeline..."
docker build -t $REGISTRY/ml-pipeline:$VERSION ./ml-pipeline

# Build Frontend
echo "Building Frontend..."
docker build -t $REGISTRY/frontend:$VERSION ./frontend

echo "All images built successfully!"

# Optional: Push to registry
if [ "$3" == "push" ]; then
    echo "Pushing images to registry..."
    docker push $REGISTRY/api-gateway:$VERSION
    docker push $REGISTRY/forecasting-service:$VERSION
    docker push $REGISTRY/integration-service:$VERSION
    docker push $REGISTRY/ml-pipeline:$VERSION
    docker push $REGISTRY/frontend:$VERSION
    echo "Push complete!"
fi
