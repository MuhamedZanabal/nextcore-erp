#!/bin/bash

# NextCore ERP - Supabase Migration Script
# This script runs all SQL migrations on Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Supabase connection details
SUPABASE_HOST="db.epdyjgywuuuriaruuysf.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"

echo -e "${YELLOW}NextCore ERP - Supabase Migration Script${NC}"
echo "=========================================="

# Check if password is provided
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}Error: SUPABASE_DB_PASSWORD environment variable is not set${NC}"
    echo "Please set your Supabase database password:"
    echo "export SUPABASE_DB_PASSWORD='your_password_here'"
    exit 1
fi

# Test connection
echo -e "${YELLOW}Testing connection to Supabase...${NC}"
if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Please check your Supabase credentials and network connection"
    exit 1
fi

# Run the complete migration
echo -e "${YELLOW}Running complete database migration...${NC}"
MIGRATION_FILE="./migrations/supabase/run_all_migrations.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo "Executing migration file: $MIGRATION_FILE"
if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -f "$MIGRATION_FILE"; then
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi

# Verify tables were created
echo -e "${YELLOW}Verifying table creation...${NC}"
TABLES_QUERY="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"

echo "Tables created:"
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -c "$TABLES_QUERY"

echo -e "${GREEN}✓ Supabase migration completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env files with the correct SUPABASE_DB_PASSWORD"
echo "2. Test the services with: docker-compose -f docker-compose.supabase.yml up"
echo "3. Verify the application is working correctly"