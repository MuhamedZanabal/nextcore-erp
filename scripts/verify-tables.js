#!/usr/bin/env node

// Verify that all NextCore ERP tables were created in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://epdyjgywuuuriaruuysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected tables organized by service
const expectedTables = {
  'Auth Service': [
    'tenants', 'users', 'roles', 'user_roles', 'user_sessions'
  ],
  'CRM Service': [
    'contacts', 'campaigns', 'leads', 'opportunities', 'activities'
  ],
  'Inventory Service': [
    'products', 'warehouses', 'warehouse_zones', 'warehouse_bins',
    'stock_levels', 'stock_movements', 'stock_movement_lines'
  ],
  'Sales Service': [
    'quotations', 'quotation_lines', 'orders', 'order_lines'
  ],
  'Invoicing Service': [
    'invoices', 'invoice_lines', 'payments', 'payment_allocations'
  ],
  'Accounting Service': [
    'accounts', 'journal_entries', 'journal_lines'
  ],
  'HRM Service': [
    'employees', 'departments', 'positions', 'time_entries', 'leave_requests'
  ]
};

async function verifyTables() {
  console.log('🔍 NextCore ERP - Table Verification');
  console.log('=====================================');
  
  let totalTables = 0;
  let verifiedTables = 0;
  let failedTables = [];
  
  for (const [serviceName, tables] of Object.entries(expectedTables)) {
    console.log(`\n📋 ${serviceName}:`);
    
    for (const tableName of tables) {
      totalTables++;
      process.stdout.write(`   ${tableName}... `);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error: ${error.message}`);
          failedTables.push(`${serviceName}: ${tableName}`);
        } else {
          console.log('✅ OK');
          verifiedTables++;
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
        failedTables.push(`${serviceName}: ${tableName}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n📊 Verification Summary:');
  console.log('========================');
  console.log(`✅ Verified tables: ${verifiedTables}/${totalTables}`);
  console.log(`❌ Failed tables: ${failedTables.length}`);
  
  if (failedTables.length > 0) {
    console.log('\n❌ Failed Tables:');
    failedTables.forEach(table => console.log(`   - ${table}`));
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if you ran the SQL script in Supabase');
    console.log('   2. Verify there were no errors in the SQL execution');
    console.log('   3. Check the Table Editor in Supabase dashboard');
  } else {
    console.log('\n🎉 All tables verified successfully!');
    console.log('✅ NextCore ERP database is ready for use');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the services: docker-compose -f docker-compose.supabase.yml up -d');
    console.log('   2. Test the application endpoints');
    console.log('   3. Set up Row Level Security if needed');
  }
  
  return failedTables.length === 0;
}

// Test basic connection first
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
    return false;
  }
}

// Run verification
async function main() {
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without a valid connection');
    process.exit(1);
  }
  
  const success = await verifyTables();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});