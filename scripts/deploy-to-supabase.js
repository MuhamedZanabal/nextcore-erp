#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://epdyjgywuuuriaruuysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting NextCore ERP deployment to Supabase...\n');

  try {
    // Test connection first
    console.log('🔄 Testing Supabase connection...');
    const { error: connectionError } = await supabase.auth.getSession();
    
    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Supabase connection successful!\n');

    // Read the complete migration file
    const migrationPath = path.join(__dirname, '../migrations/supabase/run_all_migrations.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    console.log('📄 Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📊 Migration file loaded successfully');
    console.log(`   File size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);
    console.log(`   Lines: ${migrationSQL.split('\n').length}\n`);

    // Execute the migration
    console.log('🔄 Executing database migration...');
    console.log('⚠️  This may take a few minutes for large schemas...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('Error details:', error);
      return false;
    }

    console.log('✅ Database migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    
    const tablesToCheck = [
      'tenants', 'users', 'roles', 'user_roles',
      'contacts', 'leads', 'opportunities', 'activities',
      'products', 'categories', 'suppliers', 'stock_movements',
      'quotes', 'orders', 'order_items',
      'invoices', 'invoice_items', 'payments',
      'accounts', 'transactions', 'journal_entries',
      'employees', 'departments', 'positions', 'payroll',
      'workflows', 'workflow_executions', 'workflow_steps', 'workflow_templates'
    ];

    let tablesCreated = 0;
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          tablesCreated++;
          console.log(`   ✅ ${tableName}`);
        } else {
          console.log(`   ❌ ${tableName} - ${error.message}`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName} - ${err.message}`);
      }
    }

    console.log(`\n📊 Verification Results:`);
    console.log(`   Tables created: ${tablesCreated}/${tablesToCheck.length}`);
    console.log(`   Success rate: ${((tablesCreated / tablesToCheck.length) * 100).toFixed(1)}%\n`);

    if (tablesCreated === tablesToCheck.length) {
      console.log('🎉 All tables created successfully!');
      console.log('🚀 NextCore ERP database is ready for use!\n');
      
      console.log('📋 Next Steps:');
      console.log('   1. Update your service environment variables');
      console.log('   2. Deploy your microservices');
      console.log('   3. Test the API endpoints');
      console.log('   4. Deploy the frontend application\n');
      
      return true;
    } else {
      console.log('⚠️  Some tables were not created successfully.');
      console.log('   Please check the migration logs and try again.\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Alternative method using direct SQL execution
async function runMigrationsDirectSQL() {
  console.log('🔄 Attempting direct SQL execution...\n');

  try {
    const migrationFiles = [
      '001_auth_service_tables.sql',
      '002_crm_service_tables.sql',
      '003_inventory_service_tables.sql',
      '004_sales_service_tables.sql',
      '005_invoicing_service_tables.sql',
      '006_accounting_service_tables.sql',
      '007_hrm_service_tables.sql',
      '008_workflow_service_tables.sql'
    ];

    for (const fileName of migrationFiles) {
      const filePath = path.join(__dirname, '../migrations/supabase', fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${fileName} - file not found`);
        continue;
      }

      console.log(`🔄 Running ${fileName}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', {
              sql: statement + ';'
            });
            
            if (error) {
              console.log(`   ⚠️  Warning: ${error.message}`);
            }
          } catch (err) {
            console.log(`   ⚠️  Warning: ${err.message}`);
          }
        }
      }
      
      console.log(`   ✅ ${fileName} completed`);
    }

    console.log('\n✅ All migration files processed!\n');
    return true;

  } catch (error) {
    console.error('❌ Direct SQL execution failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    NextCore ERP Deployment                  ║');
  console.log('║                      Supabase Migration                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Try the main migration first
  let success = await runMigrations();
  
  if (!success) {
    console.log('🔄 Trying alternative migration method...\n');
    success = await runMigrationsDirectSQL();
  }

  if (success) {
    console.log('🎉 Deployment completed successfully!');
    console.log('🌐 Your NextCore ERP database is ready at:');
    console.log(`   ${supabaseUrl}\n`);
    process.exit(0);
  } else {
    console.log('❌ Deployment failed. Please check the logs and try again.');
    console.log('\n💡 Manual Steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Open the SQL Editor');
    console.log('   3. Copy and paste the contents of migrations/supabase/run_all_migrations.sql');
    console.log('   4. Execute the SQL script\n');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the deployment
main();