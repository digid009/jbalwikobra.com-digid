const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function testRLSBypass() {
  console.log('=== TESTING RLS BYPASS METHODS ===');
  
  // Method 1: Try with service role key if available
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_KEY;
  
  if (serviceRoleKey) {
    console.log('✅ Service role key found, testing...');
    const serviceSupabase = createClient(process.env.REACT_APP_SUPABASE_URL, serviceRoleKey);
    
    const { data, error, count } = await serviceSupabase
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(5);
      
    console.log('Service role query result:');
    console.log('Count:', count);
    console.log('Data length:', data?.length);
    console.log('Error:', error?.message);
    
    if (data && data.length > 0) {
      console.log('✅ SUCCESS! Service role can access orders');
      console.log('Sample order:', data[0]);
      return true;
    }
  } else {
    console.log('❌ No service role key available');
  }
  
  // Method 2: Try to check if user has admin privileges
  console.log('\\n--- Checking current user privileges ---');
  const { data: authUser } = await supabase.auth.getUser();
  console.log('Auth user:', authUser?.user?.id);
  
  if (authUser?.user) {
    // Try to check user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
      
    console.log('User profile:', userProfile);
  }
  
  // Method 3: Test basic orders access with error details
  console.log('\\n--- Basic orders access test ---');
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, customer_name, amount, status, created_at')
    .limit(1);
    
  console.log('Basic query result:', { 
    hasData: !!ordersData && ordersData.length > 0, 
    error: ordersError 
  });
  
  return false;
}

testRLSBypass().catch(console.error);
