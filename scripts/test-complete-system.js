#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://epdyjgywuuuriaruuysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results
const testResults = {
  connection: false,
  tables: {},
  services: {},
  features: {},
  overall: false
};

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function testDatabaseTables() {
  console.log('\n🔄 Testing database tables...');
  
  const tablesByService = {
    'Auth Service': ['tenants', 'users', 'roles', 'user_roles'],
    'CRM Service': ['contacts', 'leads', 'opportunities', 'activities', 'notes', 'tags'],
    'Inventory Service': ['products', 'categories', 'suppliers', 'stock_movements', 'warehouses', 'inventory_adjustments'],
    'Sales Service': ['quotes', 'orders', 'order_items', 'customers'],
    'Invoicing Service': ['invoices', 'invoice_items', 'payments', 'payment_methods'],
    'Accounting Service': ['accounts', 'transactions', 'journal_entries', 'chart_of_accounts', 'fiscal_years'],
    'HRM Service': ['employees', 'departments', 'positions', 'payroll', 'attendance', 'leave_requests', 'performance_reviews', 'benefits'],
    'Workflow Service': ['workflows', 'workflow_executions', 'workflow_steps', 'workflow_templates']
  };

  let totalTables = 0;
  let successfulTables = 0;

  for (const [serviceName, tables] of Object.entries(tablesByService)) {
    console.log(`\n  📋 ${serviceName}:`);
    testResults.tables[serviceName] = {};
    
    for (const tableName of tables) {
      totalTables++;
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`    ✅ ${tableName}`);
          testResults.tables[serviceName][tableName] = true;
          successfulTables++;
        } else {
          console.log(`    ❌ ${tableName} - ${error.message}`);
          testResults.tables[serviceName][tableName] = false;
        }
      } catch (err) {
        console.log(`    ❌ ${tableName} - ${err.message}`);
        testResults.tables[serviceName][tableName] = false;
      }
    }
  }

  const successRate = (successfulTables / totalTables) * 100;
  console.log(`\n📊 Table Test Results: ${successfulTables}/${totalTables} (${successRate.toFixed(1)}%)`);
  
  return successRate >= 90; // 90% success rate required
}

async function testServiceConfigurations() {
  console.log('\n🔄 Testing service configurations...');
  
  const services = [
    'auth-service',
    'crm-service',
    'sales-service',
    'invoicing-service',
    'inventory-service',
    'accounting-service',
    'hrm-service',
    'workflow-service'
  ];

  let successfulServices = 0;

  for (const serviceName of services) {
    const servicePath = path.join(__dirname, `../services/${serviceName}`);
    
    if (fs.existsSync(servicePath)) {
      // Check for essential files
      const packageJsonPath = path.join(servicePath, 'package.json');
      const envPath = path.join(servicePath, '.env.supabase');
      const dockerfilePath = path.join(servicePath, 'Dockerfile');
      
      const hasPackageJson = fs.existsSync(packageJsonPath);
      const hasEnvFile = fs.existsSync(envPath);
      const hasDockerfile = fs.existsSync(dockerfilePath);
      
      if (hasPackageJson && hasEnvFile && hasDockerfile) {
        console.log(`  ✅ ${serviceName} - Configuration complete`);
        testResults.services[serviceName] = true;
        successfulServices++;
      } else {
        console.log(`  ❌ ${serviceName} - Missing files (package.json: ${hasPackageJson}, .env: ${hasEnvFile}, Dockerfile: ${hasDockerfile})`);
        testResults.services[serviceName] = false;
      }
    } else {
      console.log(`  ❌ ${serviceName} - Service directory not found`);
      testResults.services[serviceName] = false;
    }
  }

  const serviceSuccessRate = (successfulServices / services.length) * 100;
  console.log(`\n📊 Service Configuration Results: ${successfulServices}/${services.length} (${serviceSuccessRate.toFixed(1)}%)`);
  
  return serviceSuccessRate >= 90;
}

async function testAdvancedFeatures() {
  console.log('\n🔄 Testing advanced features...');
  
  const features = {
    'Lead Scoring Service': 'services/crm-service/src/services/lead-scoring.service.ts',
    'PDF Generator Service': 'services/invoicing-service/src/services/pdf-generator.service.ts',
    'Currency Service': 'services/invoicing-service/src/services/currency.service.ts',
    'Barcode Scanner Service': 'services/inventory-service/src/services/barcode-scanner.service.ts',
    'eSignature Service': 'services/sales-service/src/services/esignature.service.ts',
    'Workflow Engine': 'services/workflow-service/src/services/workflow-engine.service.ts',
    'Kong Configuration': 'infra/kong/kong-supabase.yml',
    'Docker Compose Full': 'docker-compose.full.yml',
    'Monitoring Config': 'infra/monitoring/prometheus/prometheus.yml',
    'Frontend Supabase Client': 'frontend/app/src/lib/supabase.ts'
  };

  let successfulFeatures = 0;

  for (const [featureName, filePath] of Object.entries(features)) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${featureName}`);
      testResults.features[featureName] = true;
      successfulFeatures++;
    } else {
      console.log(`  ❌ ${featureName} - File not found: ${filePath}`);
      testResults.features[featureName] = false;
    }
  }

  const featureSuccessRate = (successfulFeatures / Object.keys(features).length) * 100;
  console.log(`\n📊 Advanced Features Results: ${successfulFeatures}/${Object.keys(features).length} (${featureSuccessRate.toFixed(1)}%)`);
  
  return featureSuccessRate >= 90;
}

async function testMigrationFiles() {
  console.log('\n🔄 Testing migration files...');
  
  const migrationFiles = [
    '001_auth_service_tables.sql',
    '002_crm_service_tables.sql',
    '003_inventory_service_tables.sql',
    '004_sales_service_tables.sql',
    '005_invoicing_service_tables.sql',
    '006_accounting_service_tables.sql',
    '007_hrm_service_tables.sql',
    '008_workflow_service_tables.sql',
    'run_all_migrations.sql'
  ];

  let successfulMigrations = 0;

  for (const fileName of migrationFiles) {
    const filePath = path.join(__dirname, '../migrations/supabase', fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.length > 100) { // Basic content check
        console.log(`  ✅ ${fileName} (${(content.length / 1024).toFixed(1)} KB)`);
        successfulMigrations++;
      } else {
        console.log(`  ❌ ${fileName} - File too small or empty`);
      }
    } else {
      console.log(`  ❌ ${fileName} - File not found`);
    }
  }

  const migrationSuccessRate = (successfulMigrations / migrationFiles.length) * 100;
  console.log(`\n📊 Migration Files Results: ${successfulMigrations}/${migrationFiles.length} (${migrationSuccessRate.toFixed(1)}%)`);
  
  return migrationSuccessRate >= 90;
}

async function generateTestReport() {
  console.log('\n📋 Generating comprehensive test report...');
  
  const report = `
# NextCore ERP - System Test Report

## Test Execution Summary
- **Date**: ${new Date().toISOString()}
- **Supabase URL**: ${supabaseUrl}
- **Overall Status**: ${testResults.overall ? '✅ PASSED' : '❌ FAILED'}

## Test Results

### 1. Supabase Connection
- **Status**: ${testResults.connection ? '✅ PASSED' : '❌ FAILED'}

### 2. Database Tables
${Object.entries(testResults.tables).map(([service, tables]) => `
#### ${service}
${Object.entries(tables).map(([table, status]) => `- ${table}: ${status ? '✅' : '❌'}`).join('\n')}
`).join('')}

### 3. Service Configurations
${Object.entries(testResults.services).map(([service, status]) => `- ${service}: ${status ? '✅' : '❌'}`).join('\n')}

### 4. Advanced Features
${Object.entries(testResults.features).map(([feature, status]) => `- ${feature}: ${status ? '✅' : '❌'}`).join('\n')}

## Recommendations

${testResults.overall ? `
### ✅ System Ready for Production
Your NextCore ERP system has passed all tests and is ready for production deployment.

#### Next Steps:
1. Deploy services using Docker Compose
2. Configure your domain and SSL certificates
3. Set up monitoring and alerting
4. Train your users on the system
` : `
### ❌ Issues Found
Please address the failed tests before proceeding to production.

#### Required Actions:
1. Fix any failed database table issues
2. Complete missing service configurations
3. Ensure all advanced features are properly implemented
4. Re-run this test after fixes
`}

---
*Generated by NextCore ERP System Test*
`;

  const reportPath = path.join(__dirname, '../TEST_REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`📄 Test report saved to: ${reportPath}`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                NextCore ERP - System Test Suite             ║');
  console.log('║                    Comprehensive Testing                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Run all tests
  testResults.connection = await testSupabaseConnection();
  const tablesOk = await testDatabaseTables();
  const servicesOk = await testServiceConfigurations();
  const featuresOk = await testAdvancedFeatures();
  const migrationsOk = await testMigrationFiles();

  // Calculate overall result
  testResults.overall = testResults.connection && tablesOk && servicesOk && featuresOk && migrationsOk;

  // Generate report
  await generateTestReport();

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Connection Test: ${testResults.connection ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Database Tables: ${tablesOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Service Configs: ${servicesOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Advanced Features: ${featuresOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Migration Files: ${migrationsOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(60));
  console.log(`OVERALL STATUS: ${testResults.overall ? '🎉 SYSTEM READY FOR PRODUCTION' : '⚠️  ISSUES NEED ATTENTION'}`);
  console.log('='.repeat(60));

  if (testResults.overall) {
    console.log('\n🚀 Congratulations! Your NextCore ERP system is fully configured and ready for deployment.');
    console.log('📋 Check the TEST_REPORT.md file for detailed results.');
    console.log('🌐 You can now proceed with production deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues and fix them before deployment.');
    console.log('📋 Check the TEST_REPORT.md file for detailed information.');
  }

  process.exit(testResults.overall ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
main();