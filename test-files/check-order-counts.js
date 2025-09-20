const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Try multiple environment file names
try {
  require('dotenv').config({ path: '.env.local' });
} catch {}

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderCounts() {
  try {
    console.log('🔍 Checking order counts by status...\n');
    
    // Get all orders with their statuses
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('id, status, amount, customer_name, created_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    console.log(`📊 Total orders found: ${allOrders.length}\n`);
    
    // Count by status
    const statusCounts = {};
    allOrders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('📋 Orders by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Show paid + completed orders
    const paidOrders = allOrders.filter(o => o.status === 'paid');
    const completedOrders = allOrders.filter(o => o.status === 'completed');
    const combinedCompleted = allOrders.filter(o => o.status === 'paid' || o.status === 'completed');
    
    console.log(`\n✅ Business logic "completed" orders:`);
    console.log(`   Paid orders: ${paidOrders.length}`);
    console.log(`   Completed orders: ${completedOrders.length}`);
    console.log(`   Total "completed" (paid + completed): ${combinedCompleted.length}`);
    
    // Show recent paid/completed orders
    console.log(`\n📋 Recent paid/completed orders (last 10):`);
    combinedCompleted.slice(0, 10).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.customer_name} - ${order.status} - Rp ${Number(order.amount).toLocaleString('id-ID')} (${new Date(order.created_at).toLocaleDateString('id-ID')})`);
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkOrderCounts();
