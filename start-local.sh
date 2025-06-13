#!/bin/bash

# NextCore ERP - Local Development Startup Script
# This script starts all services for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NextCore ERP - Starting Local Development Environment${NC}"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the NextCore ERP root directory${NC}"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    
    echo -e "${YELLOW}📦 Starting $service_name on port $port...${NC}"
    
    cd services/$service_name
    
    # Copy environment file
    cp .env.supabase .env.development
    
    # Build the service
    npm run build
    
    # Start the service in background
    NODE_ENV=development PORT=$port npm run start:prod > ../../logs/$service_name.log 2>&1 &
    
    # Store the PID
    echo $! > ../../logs/$service_name.pid
    
    cd ../..
    
    echo -e "${GREEN}✅ $service_name started (PID: $(cat logs/$service_name.pid))${NC}"
}

# Start all services
echo -e "${YELLOW}🔧 Building and starting microservices...${NC}"

start_service "auth-service" 3000
sleep 2
start_service "crm-service" 3001
sleep 2
start_service "inventory-service" 3002
sleep 2
start_service "sales-service" 3003
sleep 2
start_service "invoicing-service" 3004
sleep 2
start_service "accounting-service" 3005
sleep 2
start_service "hrm-service" 3006

echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"

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
    
    echo -n "   $service (port $port)... "
    
    if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        echo -e "      Check logs: tail -f logs/$service.log"
    fi
done

echo ""
echo -e "${BLUE}📊 NextCore ERP Services Status${NC}"
echo "================================"
echo -e "${GREEN}✅ Auth Service:       http://localhost:3000${NC}"
echo -e "${GREEN}✅ CRM Service:        http://localhost:3001${NC}"
echo -e "${GREEN}✅ Inventory Service:  http://localhost:3002${NC}"
echo -e "${GREEN}✅ Sales Service:      http://localhost:3003${NC}"
echo -e "${GREEN}✅ Invoicing Service:  http://localhost:3004${NC}"
echo -e "${GREEN}✅ Accounting Service: http://localhost:3005${NC}"
echo -e "${GREEN}✅ HRM Service:        http://localhost:3006${NC}"
echo ""
echo -e "${YELLOW}📋 Available Commands:${NC}"
echo "   • View logs:     tail -f logs/[service-name].log"
echo "   • Stop services: ./stop-local.sh"
echo "   • Restart:       ./stop-local.sh && ./start-local.sh"
echo ""
echo -e "${YELLOW}🌐 API Documentation:${NC}"
echo "   • Auth API:      http://localhost:3000/api"
echo "   • CRM API:       http://localhost:3001/api"
echo "   • Inventory API: http://localhost:3002/api"
echo "   • Sales API:     http://localhost:3003/api"
echo "   • Invoicing API: http://localhost:3004/api"
echo "   • Accounting API:http://localhost:3005/api"
echo "   • HRM API:       http://localhost:3006/api"
echo ""
echo -e "${GREEN}🎉 NextCore ERP is now running!${NC}"