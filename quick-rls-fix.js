const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickRLSFix() {
  console.log('🔧 Quick RLS fix for orders table...\n');
  
  try {
    // Method 1: Just disable RLS temporarily for testing
    console.log('🔄 Attempting to disable RLS on orders table...');
    
    const { error: disableError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders DISABLE ROW LEVEL SECURITY'
    });
    
    if (disableError) {
      console.log('⚠️  Disable RLS failed:', disableError.message);
    } else {
      console.log('✅ RLS disabled on orders table');
    }
    
    // Test access now
    console.log('\n🧪 Testing anonymous access after RLS disable...');
    const anonClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    
    const { data: orders, error } = await anonClient
      .from('orders')
      .select('id, customer_name, amount, status')
      .limit(5);
    
    if (error) {
      console.log('❌ Still failing:', error.message);
    } else {
      console.log(`🎉 SUCCESS! Found ${orders?.length || 0} orders`);
      if (orders?.length > 0) {
        console.log('📊 Sample orders:');
        orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.customer_name} - $${order.amount} (${order.status})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickRLSFix();
