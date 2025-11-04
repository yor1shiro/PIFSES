#!/bin/bash

# Clean up development environment
set -e

echo "🧹 Cleaning up PIFSES development environment..."

# Stop containers
echo "Stopping Docker containers..."
docker-compose down

# Remove volumes
echo "Removing Docker volumes..."
docker-compose down -v

# Clean up node_modules
echo "Cleaning frontend dependencies..."
rm -rf frontend/node_modules frontend/.next

# Clean Go build cache
echo "Cleaning Go build artifacts..."
go clean -cache -testcache

# Clean Python cache
echo "Cleaning Python cache..."
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Remove build directories
rm -rf backend/*/dist
rm -rf ml-pipeline/__pycache__

echo "✅ Cleanup complete!"
echo ""
echo "To restart development environment, run:"
echo "  bash init-dev.sh"
