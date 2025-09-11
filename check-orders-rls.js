const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Environment Check:');
console.log('  REACT_APP_SUPABASE_URL:', !!supabaseUrl);
console.log('  REACT_APP_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function checkOrdersRLS() {
  console.log('\n🔍 Checking orders table access...');
  
  try {
    // Test with anon client
    console.log('\n📊 Testing with anonymous client:');
    const { count: anonCount, error: anonError } = await anonClient
      .from('orders')
      .select('*', { count: 'exact', head: true });
      
    console.log('  Count:', anonCount);
    console.log('  Error:', anonError?.message || 'None');
    
    // Test with service client if available
    if (serviceClient) {
      console.log('\n🔧 Testing with service role client:');
      const { count: serviceCount, error: serviceError } = await serviceClient
        .from('orders')
        .select('*', { count: 'exact', head: true });
        
      console.log('  Count:', serviceCount);
      console.log('  Error:', serviceError?.message || 'None');
      
      // Try to get sample data with service role
      const { data: serviceData, error: serviceDataError } = await serviceClient
        .from('orders')
        .select('id, status, amount, customer_name, created_at')
        .limit(3);
        
      console.log('  Sample data:', serviceData?.length || 0, 'records');
      if (serviceData?.length) {
        console.log('  First record:', {
          id: serviceData[0].id?.substring(0, 8) + '...',
          status: serviceData[0].status,
          amount: serviceData[0].amount,
          customer: serviceData[0].customer_name || 'No name'
        });
      }
      console.log('  Data Error:', serviceDataError?.message || 'None');
    }
    
    // Test if we can get RLS policies info
    if (serviceClient) {
      console.log('\n🔐 Checking RLS policies:');
      const { data: policies, error: policiesError } = await serviceClient
        .rpc('get_policies', { table_name: 'orders' })
        .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
        
      if (policies) {
        console.log('  Policies found:', policies.length);
      } else {
        console.log('  Cannot fetch policies:', policiesError?.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Check failed:', error.message);
  }
}

async function checkCurrentUser() {
  console.log('\n👤 Checking current user context...');
  
  try {
    const { data: { user }, error } = await anonClient.auth.getUser();
    console.log('  User:', user ? `${user.id.substring(0, 8)}... (${user.email})` : 'None');
    console.log('  Error:', error?.message || 'None');
    
    if (user) {
      console.log('  User role/metadata:', user.user_metadata);
      console.log('  App metadata:', user.app_metadata);
    }
  } catch (error) {
    console.log('  Auth check failed:', error.message);
  }
}

checkCurrentUser().then(() => checkOrdersRLS());
