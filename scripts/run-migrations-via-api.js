#!/usr/bin/env node

// Run Supabase migrations via REST API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://epdyjgywuuuriaruuysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ';

async function runMigrations() {
  console.log('🚀 Starting Supabase migrations via API...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read the complete migration file
    const migrationFile = path.join(__dirname, '../migrations/supabase/run_all_migrations.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('📄 Migration file loaded, size:', migrationSQL.length, 'characters');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log('📝 Found', statements.length, 'SQL statements to execute');
    
    // Execute statements one by one
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }
      
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      console.log('📋 Statement preview:', statement.substring(0, 100) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
          
          // Continue with next statement for non-critical errors
          if (!error.message.includes('already exists')) {
            console.log('⚠️  Continuing with next statement...');
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📝 Total statements: ${statements.length}`);
    
    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    await verifyTables(supabase);
    
    return errorCount === 0;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function verifyTables(supabase) {
  try {
    // Try to query some of the tables we created
    const tablesToCheck = [
      'tenants',
      'users', 
      'contacts',
      'products',
      'orders',
      'invoices',
      'accounts',
      'employees'
    ];
    
    console.log('🔍 Checking if tables were created...');
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Table verification failed:', error.message);
  }
}

// Run the migrations
runMigrations()
  .then(success => {
    if (success) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Check your Supabase dashboard to verify tables');
      console.log('   2. Test the application services');
      console.log('   3. Set up Row Level Security if needed');
    } else {
      console.log('\n⚠️  Migration completed with some errors');
      console.log('📋 Please check the Supabase dashboard and logs');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Migration execution failed:', error);
    process.exit(1);
  });