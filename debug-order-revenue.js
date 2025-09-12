const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrderData() {
  console.log('🔍 Debugging Order Revenue Data...\n');

  try {
    // Get all orders with their amounts and statuses
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer_name, amount, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    console.log(`📊 Total orders in database: ${orders?.length || 0}\n`);

    if (!orders || orders.length === 0) {
      console.log('⚠️  No orders found in database');
      return;
    }

    // Group orders by status
    const statusGroups = orders.reduce((acc, order) => {
      if (!acc[order.status]) acc[order.status] = [];
      acc[order.status].push(order);
      return acc;
    }, {});

    console.log('📈 Orders by Status:');
    Object.keys(statusGroups).forEach(status => {
      const ordersInStatus = statusGroups[status];
      const totalAmount = ordersInStatus.reduce((sum, order) => sum + (order.amount || 0), 0);
      console.log(`  ${status.toUpperCase()}: ${ordersInStatus.length} orders, Total: Rp ${totalAmount.toLocaleString()}`);
    });

    console.log('\n💰 Revenue Calculation:');
    const paidOrders = orders.filter(o => o.status === 'paid');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const revenueOrders = [...paidOrders, ...completedOrders];
    
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    console.log(`  Paid orders: ${paidOrders.length}`);
    console.log(`  Completed orders: ${completedOrders.length}`);
    console.log(`  Revenue-generating orders: ${revenueOrders.length}`);
    console.log(`  Total Revenue: Rp ${totalRevenue.toLocaleString()}`);

    console.log('\n🏆 Top 10 Highest Value Orders:');
    const sortedOrders = [...orders].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 10);
    
    sortedOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.customer_name || 'Unknown'} - Rp ${(order.amount || 0).toLocaleString()} (${order.status}) - ${new Date(order.created_at).toLocaleDateString()}`);
    });

    // Check for suspicious high-value orders
    const suspiciousOrders = orders.filter(o => o.amount > 10000000); // > 10 million
    if (suspiciousOrders.length > 0) {
      console.log('\n⚠️  Suspicious High-Value Orders (> Rp 10,000,000):');
      suspiciousOrders.forEach(order => {
        console.log(`  ID: ${order.id}, Customer: ${order.customer_name}, Amount: Rp ${order.amount.toLocaleString()}, Status: ${order.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugOrderData();
