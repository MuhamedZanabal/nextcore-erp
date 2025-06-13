# NextCore ERP - Supabase Migration Guide

This guide walks you through migrating the NextCore ERP system from local PostgreSQL to Supabase.

## Overview

The migration includes:
- ✅ Updated environment configurations for Supabase
- ✅ Installed Supabase client libraries for all services
- ✅ Created comprehensive SQL migration scripts
- ✅ Updated service configurations with SSL support
- ✅ Created new Docker Compose configuration for Supabase

## Prerequisites

1. **Supabase Project**: You should have a Supabase project set up
2. **Database Password**: You need your Supabase database password
3. **PostgreSQL Client**: Required for running migrations (installed automatically)

## Supabase Configuration

Your Supabase project details:
- **Project URL**: `https://epdyjgywuuuriaruuysf.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ`
- **Database Host**: `db.epdyjgywuuuriaruuysf.supabase.co`

## Migration Steps

### 1. Set Database Password

First, set your Supabase database password as an environment variable:

```bash
export SUPABASE_DB_PASSWORD='your_actual_supabase_db_password'
```

### 2. Run Database Migrations

Execute the migration script to create all database tables:

```bash
./scripts/run-supabase-migrations.sh
```

This script will:
- Test the connection to Supabase
- Run the complete database migration
- Create all tables for all services
- Verify the migration was successful

### 3. Update Environment Files

The migration has created `.env.supabase` files for each service. Update the database password in these files:

```bash
# Update all service environment files
for service in auth-service crm-service inventory-service sales-service invoicing-service accounting-service hrm-service; do
  sed -i "s/DB_PASSWORD=your_supabase_db_password/DB_PASSWORD=$SUPABASE_DB_PASSWORD/" services/$service/.env.supabase
done
```

### 4. Start Services with Supabase

Use the new Docker Compose configuration:

```bash
# Start all services with Supabase
docker-compose -f docker-compose.supabase.yml up -d

# Or start specific services
docker-compose -f docker-compose.supabase.yml up auth-service crm-service
```

### 5. Verify the Migration

Check that services are connecting properly:

```bash
# Check service health
curl http://localhost:3000/health  # Auth Service
curl http://localhost:3001/health  # CRM Service
curl http://localhost:3002/health  # Inventory Service
# ... etc
```

## Database Schema

The migration creates the following tables:

### Auth Service
- `tenants` - Multi-tenant organization data
- `users` - User accounts
- `roles` - Role-based access control
- `user_roles` - User-role associations
- `user_sessions` - Active user sessions
- `auth_audit_logs` - Authentication audit logs
- `security_events` - Security event tracking
- `security_audit_logs` - Security audit logs

### CRM Service
- `contacts` - Customer contact information
- `campaigns` - Marketing campaigns
- `leads` - Sales leads
- `opportunities` - Sales opportunities
- `activities` - CRM activities and tasks

### Inventory Service
- `products` - Product catalog
- `warehouses` - Warehouse locations
- `warehouse_zones` - Warehouse zones
- `warehouse_bins` - Storage bins
- `stock_levels` - Current stock levels
- `stock_movements` - Stock movement transactions
- `stock_movement_lines` - Stock movement line items

### Sales Service
- `quotations` - Sales quotations
- `quotation_lines` - Quotation line items
- `orders` - Sales orders
- `order_lines` - Order line items

### Invoicing Service
- `invoices` - Customer invoices
- `invoice_lines` - Invoice line items
- `payments` - Customer payments
- `payment_allocations` - Payment allocations to invoices

### Accounting Service
- `accounts` - Chart of accounts
- `journal_entries` - Journal entries
- `journal_lines` - Journal entry line items

### HRM Service
- `employees` - Employee records
- `departments` - Company departments
- `positions` - Job positions
- `time_entries` - Time tracking
- `leave_requests` - Leave requests

## Configuration Changes

### SSL Support
All services now support SSL connections to Supabase with these new environment variables:
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=false`

### Supabase Client Integration
Each service now includes the Supabase JavaScript client for additional functionality:
- Real-time subscriptions
- Row Level Security (RLS)
- Built-in authentication helpers

### Environment Files
New environment files for Supabase configuration:
- `.env.supabase` - Global Supabase configuration
- `services/*/env.supabase` - Service-specific configurations

## Troubleshooting

### Connection Issues
If you encounter connection issues:

1. **Check your database password**:
   ```bash
   echo $SUPABASE_DB_PASSWORD
   ```

2. **Test direct connection**:
   ```bash
   PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h db.epdyjgywuuuriaruuysf.supabase.co -p 5432 -U postgres -d postgres -c "SELECT version();"
   ```

3. **Check Supabase project status** in the Supabase dashboard

### Migration Issues
If the migration fails:

1. **Check if tables already exist**:
   ```bash
   PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h db.epdyjgywuuuriaruuysf.supabase.co -p 5432 -U postgres -d postgres -c "\dt"
   ```

2. **Run individual migration files** if needed:
   ```bash
   PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h db.epdyjgywuuuriaruuysf.supabase.co -p 5432 -U postgres -d postgres -f migrations/supabase/001_auth_service_tables.sql
   ```

### Service Issues
If services fail to start:

1. **Check logs**:
   ```bash
   docker-compose -f docker-compose.supabase.yml logs auth-service
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose -f docker-compose.supabase.yml exec auth-service env | grep DB_
   ```

## Security Considerations

1. **Database Password**: Store your Supabase database password securely
2. **API Keys**: The provided API key is the anonymous key - consider using service role keys for backend services
3. **Row Level Security**: Consider implementing RLS policies in Supabase for additional security
4. **SSL**: All connections use SSL encryption

## Next Steps

After successful migration:

1. **Set up Row Level Security (RLS)** policies in Supabase
2. **Configure real-time subscriptions** for live updates
3. **Set up database backups** in Supabase
4. **Monitor performance** using Supabase analytics
5. **Update CI/CD pipelines** to use the new configuration

## Support

For issues with this migration:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check service logs for specific error messages

## Files Created/Modified

### New Files
- `docker-compose.supabase.yml` - Supabase Docker configuration
- `migrations/supabase/` - All migration scripts
- `services/*/env.supabase` - Service environment files
- `scripts/run-supabase-migrations.sh` - Migration script

### Modified Files
- `services/auth-service/src/app.module.ts` - Added SSL support
- `services/auth-service/package.json` - Added Supabase client
- All service `package.json` files - Added Supabase client

The migration is now complete and ready for testing!