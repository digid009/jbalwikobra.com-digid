const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const serviceRoleClient = createClient(supabaseUrl, supabaseServiceKey);

async function testOrdersAccess() {
  console.log('🧪 Testing Orders Access with Service Role...\n');
  
  try {
    // Test direct orders access
    console.log('📋 Testing direct orders access...');
    const { data: orders, error, count } = await serviceRoleClient
      .from('orders')
      .select('id, customer_name, customer_email, amount, status, created_at', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log(`✅ Found ${orders?.length || 0} orders (total: ${count})`);
      
      if (orders?.length > 0) {
        console.log('\n📊 Sample orders:');
        orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.customer_name} - $${(order.amount/1000).toFixed(1)}k (${order.status})`);
        });
      }
    }
    
    // Test stats calculation
    console.log('\n💰 Testing stats calculation...');
    const { data: allOrders, error: statsError } = await serviceRoleClient
      .from('orders')
      .select('status, amount');
    
    if (statsError) {
      console.log('❌ Stats error:', statsError.message);
    } else if (allOrders) {
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
      const completedOrders = allOrders.filter(order => order.status === 'completed').length;
      
      console.log(`✅ Stats calculated:`);
      console.log(`   - Total Orders: ${totalOrders}`);
      console.log(`   - Total Revenue: $${(totalRevenue/1000).toFixed(1)}k`);
      console.log(`   - Pending: ${pendingOrders}`);
      console.log(`   - Completed: ${completedOrders}`);
      console.log(`   - Cancelled: ${allOrders.filter(o => o.status === 'cancelled').length}`);
      console.log(`   - Paid: ${allOrders.filter(o => o.status === 'paid').length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrdersAccess();
