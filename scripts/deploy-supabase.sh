#!/bin/bash

# NextCore ERP - Complete Supabase Deployment Script
# This script handles the complete migration and deployment to Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NextCore ERP - Supabase Deployment${NC}"
echo "====================================="

# Step 1: Pre-deployment checks
echo -e "${YELLOW}📋 Step 1: Running pre-deployment checks...${NC}"
./scripts/test-supabase-connection.sh

# Step 2: Test Supabase client
echo -e "${YELLOW}🔌 Step 2: Testing Supabase client connection...${NC}"
node scripts/test-supabase-client.js

# Step 3: Check for database password
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}❌ SUPABASE_DB_PASSWORD environment variable is not set${NC}"
    echo "Please set your Supabase database password:"
    echo "export SUPABASE_DB_PASSWORD='your_password_here'"
    exit 1
fi

# Step 4: Run database migrations
echo -e "${YELLOW}🗄️ Step 3: Running database migrations...${NC}"
./scripts/run-supabase-migrations.sh

# Step 5: Update environment files with password
echo -e "${YELLOW}⚙️ Step 4: Updating service environment files...${NC}"
for service in auth-service crm-service inventory-service sales-service invoicing-service accounting-service hrm-service; do
    if [ -f "services/$service/.env.supabase" ]; then
        sed -i "s/DB_PASSWORD=your_supabase_db_password/DB_PASSWORD=$SUPABASE_DB_PASSWORD/" "services/$service/.env.supabase"
        echo -e "${GREEN}✓ Updated services/$service/.env.supabase${NC}"
    fi
done

# Step 6: Build and start services
echo -e "${YELLOW}🐳 Step 5: Building and starting services...${NC}"
echo "Building Docker images..."
docker-compose -f docker-compose.supabase.yml build

echo "Starting services..."
docker-compose -f docker-compose.supabase.yml up -d

# Step 7: Wait for services to be ready
echo -e "${YELLOW}⏳ Step 6: Waiting for services to be ready...${NC}"
sleep 30

# Step 8: Health checks
echo -e "${YELLOW}🏥 Step 7: Running health checks...${NC}"
SERVICES=(
    "auth-service:3000"
    "crm-service:3001"
    "inventory-service:3002"
    "sales-service:3003"
    "invoicing-service:3004"
    "accounting-service:3005"
    "hrm-service:3006"
)

for service_port in "${SERVICES[@]}"; do
    service=$(echo $service_port | cut -d: -f1)
    port=$(echo $service_port | cut -d: -f2)
    
    echo -n "Checking $service on port $port... "
    if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        echo "Check logs with: docker-compose -f docker-compose.supabase.yml logs $service"
    fi
done

# Step 9: Display deployment summary
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "===================="
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo -e "${GREEN}✅ Services configured for Supabase${NC}"
echo -e "${GREEN}✅ Docker containers started${NC}"
echo ""
echo "🌐 Service URLs:"
echo "   • API Gateway: http://localhost:8000"
echo "   • Auth Service: http://localhost:3000"
echo "   • CRM Service: http://localhost:3001"
echo "   • Inventory Service: http://localhost:3002"
echo "   • Sales Service: http://localhost:3003"
echo "   • Invoicing Service: http://localhost:3004"
echo "   • Accounting Service: http://localhost:3005"
echo "   • HRM Service: http://localhost:3006"
echo "   • Frontend: http://localhost:8080"
echo ""
echo "📋 Next Steps:"
echo "   1. Test the application functionality"
echo "   2. Set up Row Level Security (RLS) in Supabase"
echo "   3. Configure real-time subscriptions if needed"
echo "   4. Set up monitoring and alerts"
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"