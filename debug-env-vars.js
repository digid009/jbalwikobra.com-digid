const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('=== Environment Variable Check ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('\n=== Connection Test ===');
if (!supabaseUrl) {
  console.log('❌ No Supabase URL found');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.log('❌ No service role key found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('Testing admin connection...');
    
    // Test basic table access
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });
    
    if (orderError) {
      console.log('❌ Orders table error:', orderError.message);
    } else {
      console.log('✅ Orders table accessible, count:', orders);
    }
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (userError) {
      console.log('❌ Users table error:', userError.message);
    } else {
      console.log('✅ Users table accessible, count:', users);
    }
    
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    if (productError) {
      console.log('❌ Products table error:', productError.message);
    } else {
      console.log('✅ Products table accessible, count:', products);
    }
    
    console.log('\n=== Admin API Test Complete ===');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
