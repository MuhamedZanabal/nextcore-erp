#!/bin/bash

# NextCore ERP - Stop Local Development Services
# This script stops all running services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 NextCore ERP - Stopping Local Development Environment${NC}"
echo "=========================================================="

# Function to stop a service
stop_service() {
    local service_name=$1
    
    if [ -f "logs/$service_name.pid" ]; then
        local pid=$(cat logs/$service_name.pid)
        echo -e "${YELLOW}🔄 Stopping $service_name (PID: $pid)...${NC}"
        
        if kill $pid 2>/dev/null; then
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service_name (process may have already exited)${NC}"
        fi
        
        rm -f logs/$service_name.pid
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Stop all services
SERVICES=(
    "auth-service"
    "crm-service"
    "inventory-service"
    "sales-service"
    "invoicing-service"
    "accounting-service"
    "hrm-service"
)

for service in "${SERVICES[@]}"; do
    stop_service $service
done

# Kill any remaining Node.js processes related to NextCore
echo -e "${YELLOW}🧹 Cleaning up any remaining processes...${NC}"
pkill -f "nextcore" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All NextCore ERP services have been stopped${NC}"
echo -e "${BLUE}📋 Log files are preserved in the logs/ directory${NC}"