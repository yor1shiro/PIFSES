# Initialize local development environment for Windows
# Usage: .\init-dev.ps1

param(
    [switch]$SkipDocker = $false
)

Write-Host "Starting PIFSES Development Environment" -ForegroundColor Green
Write-Host "=========================================="

# Check Docker
Write-Host "`nChecking prerequisites..."
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker is installed: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "[WARN] Node.js not found in PATH" -ForegroundColor Yellow
    Write-Host "Install from: https://nodejs.org/" -ForegroundColor Yellow
}

# Create .env file if not exists
Write-Host "`nSetting up environment variables..."
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file..."
    $envContent = @"
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
SHOPIFY_API_KEY=your_shopify_key_here
SHOPIFY_API_SECRET=your_shopify_secret_here
ETSY_API_KEY=your_etsy_key_here

# Database
DB_PASSWORD=pifses-dev-pass
CASSANDRA_USER=cassandra
CASSANDRA_PASSWORD=cassandra

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
"@
    
    Set-Content -Path $envPath -Value $envContent
    Write-Host "[OK] .env file created" -ForegroundColor Green
}
else {
    Write-Host "[OK] .env file already exists" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..."
Push-Location "frontend"
if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules already exists" -ForegroundColor Green
}
else {
    Write-Host "Running npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] npm install completed with warnings" -ForegroundColor Yellow
    }
    else {
        Write-Host "[OK] npm install completed" -ForegroundColor Green
    }
}
Pop-Location

# Start Docker services
if (-not $SkipDocker) {
    Write-Host "`nStarting Docker services..."
    Write-Host "This may take 2-3 minutes on first run..." -ForegroundColor Yellow
    
    docker-compose up -d
    
    Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    docker-compose ps
}

# Print next steps
Write-Host "`nSetup complete! Here is what to do next:" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "1. Start the frontend development server:"
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. In another terminal, check backend services:"
Write-Host "   docker-compose ps" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f api-gateway" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Access your dashboard:"
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor Cyan
Write-Host "   Grafana: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
