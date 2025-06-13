#!/usr/bin/env node

// Test Supabase client connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://epdyjgywuuuriaruuysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHlqZ3l3dXV1cmlhcnV1eXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDk5MTEsImV4cCI6MjA2NTQyNTkxMX0.EH_Scpym9uo-OPG-m47E6bwnAGPEDt-f7-hV3r8hdgQ';

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase client connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection by trying to access the auth endpoint
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase client connection successful!');
    console.log('📊 Connection details:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Status: Connected`);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase client test failed:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });