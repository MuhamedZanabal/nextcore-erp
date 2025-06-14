# 🚀 Create NextCore ERP Tables in Supabase

## Quick Instructions

Since we can't connect directly to your Supabase database from this environment, please follow these simple steps to create all the tables:

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard
2. Select your project: `epdyjgywuuuriaruuysf`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Copy the SQL Script
1. Open the file: `migrations/supabase/COPY_PASTE_TO_SUPABASE.sql`
2. Copy the entire contents (Ctrl+A, then Ctrl+C)

### Step 3: Execute the Script
1. In the Supabase SQL Editor, paste the entire script
2. Click the "Run" button (or press Ctrl+Enter)
3. Wait for the execution to complete

### Step 4: Verify Tables Created
After running the script, you should see:
- ✅ **32 tables** created across all services
- ✅ **Indexes** for performance optimization
- ✅ **Triggers** for automatic timestamp updates
- ✅ **Foreign key relationships** properly set up

### Expected Tables:

#### Auth Service (5 tables)
- `tenants` - Organization data
- `users` - User accounts  
- `roles` - User roles
- `user_roles` - User-role associations
- `user_sessions` - Active sessions

#### CRM Service (5 tables)
- `contacts` - Customer contacts
- `campaigns` - Marketing campaigns
- `leads` - Sales leads
- `opportunities` - Sales opportunities
- `activities` - CRM activities

#### Inventory Service (7 tables)
- `products` - Product catalog
- `warehouses` - Warehouse locations
- `warehouse_zones` - Warehouse zones
- `warehouse_bins` - Storage bins
- `stock_levels` - Current stock
- `stock_movements` - Stock transactions
- `stock_movement_lines` - Movement details

#### Sales Service (4 tables)
- `quotations` - Sales quotes
- `quotation_lines` - Quote line items
- `orders` - Sales orders
- `order_lines` - Order line items

#### Invoicing Service (4 tables)
- `invoices` - Customer invoices
- `invoice_lines` - Invoice line items
- `payments` - Customer payments
- `payment_allocations` - Payment allocations

#### Accounting Service (3 tables)
- `accounts` - Chart of accounts
- `journal_entries` - Journal entries
- `journal_lines` - Journal line items

#### HRM Service (5 tables)
- `employees` - Employee records
- `departments` - Company departments
- `positions` - Job positions
- `time_entries` - Time tracking
- `leave_requests` - Leave requests

## After Creating Tables

Once the tables are created, you can:

1. **Start the services** using:
   ```bash
   docker-compose -f docker-compose.supabase.yml up -d
   ```

2. **Test the connection** by checking service health:
   ```bash
   curl http://localhost:3000/health  # Auth Service
   curl http://localhost:3001/health  # CRM Service
   # ... etc
   ```

3. **View your data** in the Supabase dashboard under "Table Editor"

## Troubleshooting

If you encounter any issues:

1. **Check the SQL Editor output** for any error messages
2. **Verify your database password** is correct: `Hacker@321`
3. **Check table creation** in the Table Editor tab
4. **Review the logs** if services fail to start

## Next Steps

After tables are created:
- ✅ Database schema is ready
- ✅ Services can connect to Supabase
- ✅ Ready for application testing
- 🔄 Consider setting up Row Level Security (RLS)
- 🔄 Configure real-time subscriptions if needed

---

**Need help?** Check the `SUPABASE_MIGRATION_GUIDE.md` for detailed troubleshooting.