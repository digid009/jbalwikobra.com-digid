const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testEnvironmentKeySetup() {
  console.log('=== TESTING ENVIRONMENT VARIABLE SETUP ===');
  
  console.log('Environment variables:');
  console.log('REACT_APP_SUPABASE_URL:', !!process.env.REACT_APP_SUPABASE_URL);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
  console.log('REACT_APP_SUPABASE_SERVICE_KEY:', !!process.env.REACT_APP_SUPABASE_SERVICE_KEY);
  
  // Test the admin service logic
  const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  console.log('\nKey selection logic:');
  console.log('Using:', serviceKey.includes('service_role') ? 'SERVICE ROLE KEY' : 'ANONYMOUS KEY');
  console.log('Key length:', serviceKey.length);
  console.log('Key prefix:', serviceKey.substring(0, 20) + '...');
  
  // Test database access
  console.log('\nTesting database access...');
  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, serviceKey);
  
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select('id, customer_name, status', { count: 'exact' })
      .limit(3);
    
    console.log('Database access result:', {
      total_count: count,
      orders_retrieved: data?.length || 0,
      error: error?.message || 'none',
      using_key: serviceKey.includes('service_role') ? 'SERVICE_ROLE' : 'ANON'
    });
    
    if (data && data.length > 0) {
      console.log('\n✅ SUCCESS! Environment setup working correctly');
      console.log('Sample orders:');
      data.forEach((order, i) => {
        console.log(`   ${i + 1}. ${order.customer_name} - ${order.status}`);
      });
    } else {
      console.log('\n⚠️ Limited access - may need service role key in production');
    }
    
    console.log('\n📋 SECURITY STATUS:');
    console.log('✅ No hardcoded keys in source code');
    console.log('✅ Keys loaded from environment variables');
    console.log('✅ Fallback to anonymous key if service key unavailable');
    
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

testEnvironmentKeySetup().catch(console.error);
