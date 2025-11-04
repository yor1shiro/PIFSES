#!/bin/bash

# Initialize local development environment
set -e

echo "🚀 Initializing PIFSES Development Environment"
echo "=============================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Docker is installed"

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Gateway
PORT=8080
LOG_LEVEL=debug

# Databases
CASSANDRA_HOSTS=cassandra
CASSANDRA_PORT=9042
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092

# Services
FORECASTING_SERVICE_URL=http://forecasting-service:8081
INTEGRATION_SERVICE_URL=http://integration-service:8082
ML_SERVICE_URL=http://ml-pipeline:8000
TEMPORAL_SERVER=temporal:7233

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Shopify/Etsy (placeholder)
SHOPIFY_API_VERSION=2024-01
ETSY_API_URL=https://api.etsy.com/v3
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Start Docker services
echo "🐳 Starting Docker Compose services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Initialize Cassandra schema
echo "📊 Initializing Cassandra schema..."
docker exec pifses-cassandra cqlsh cassandra cassandra -f /docker-entrypoint-initdb.d/init.cql || echo "⚠️  Cassandra initialization may still be in progress"

# Initialize frontend
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "✅ Development environment initialized!"
echo ""
echo "📍 Service Endpoints:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Gateway: http://localhost:8080"
echo "   - Forecasting Service: http://localhost:8081"
echo "   - Integration Service: http://localhost:8082"
echo "   - ML Pipeline: http://localhost:8000"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3001"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Check service health: curl http://localhost:8080/health"
echo "3. View logs: docker-compose logs -f"
