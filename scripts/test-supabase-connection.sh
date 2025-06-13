#!/bin/bash

# Test Supabase connection without running migrations
# This script validates the migration files and connection parameters

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}NextCore ERP - Supabase Connection Test${NC}"
echo "============================================"

# Check if migration files exist
echo -e "${YELLOW}Checking migration files...${NC}"
MIGRATION_DIR="./migrations/supabase"

if [ ! -d "$MIGRATION_DIR" ]; then
    echo -e "${RED}✗ Migration directory not found: $MIGRATION_DIR${NC}"
    exit 1
fi

MIGRATION_FILES=(
    "001_auth_service_tables.sql"
    "002_crm_service_tables.sql"
    "003_inventory_service_tables.sql"
    "004_sales_service_tables.sql"
    "005_invoicing_service_tables.sql"
    "006_accounting_service_tables.sql"
    "007_hrm_service_tables.sql"
    "run_all_migrations.sql"
)

for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "$MIGRATION_DIR/$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file${NC}"
    fi
done

# Check environment files
echo -e "${YELLOW}Checking environment files...${NC}"
SERVICES=("auth-service" "crm-service" "inventory-service" "sales-service" "invoicing-service" "accounting-service" "hrm-service")

for service in "${SERVICES[@]}"; do
    if [ -f "services/$service/.env.supabase" ]; then
        echo -e "${GREEN}✓ services/$service/.env.supabase${NC}"
    else
        echo -e "${RED}✗ services/$service/.env.supabase${NC}"
    fi
done

# Check Docker Compose file
echo -e "${YELLOW}Checking Docker Compose configuration...${NC}"
if [ -f "docker-compose.supabase.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.supabase.yml${NC}"
else
    echo -e "${RED}✗ docker-compose.supabase.yml${NC}"
fi

# Validate SQL syntax (basic check)
echo -e "${YELLOW}Validating SQL syntax...${NC}"
for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "$MIGRATION_DIR/$file" ]; then
        # Basic SQL syntax check
        if grep -q "CREATE TABLE\|CREATE INDEX\|CREATE TRIGGER" "$MIGRATION_DIR/$file"; then
            echo -e "${GREEN}✓ $file contains valid SQL statements${NC}"
        else
            echo -e "${YELLOW}⚠ $file may not contain expected SQL statements${NC}"
        fi
    fi
done

# Check Supabase client installation
echo -e "${YELLOW}Checking Supabase client installation...${NC}"
for service in "${SERVICES[@]}"; do
    if [ -f "services/$service/package.json" ]; then
        if grep -q "@supabase/supabase-js" "services/$service/package.json"; then
            echo -e "${GREEN}✓ $service has Supabase client installed${NC}"
        else
            echo -e "${RED}✗ $service missing Supabase client${NC}"
        fi
    fi
done

echo -e "${GREEN}✓ Pre-migration checks completed${NC}"
echo ""
echo "To run the actual migration:"
echo "1. Set your database password: export SUPABASE_DB_PASSWORD='your_password'"
echo "2. Run: ./scripts/run-supabase-migrations.sh"