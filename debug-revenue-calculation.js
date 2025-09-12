const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function debugRevenueCalculation() {
  console.log('=== REVENUE CALCULATION DEBUG ===');
  
  // Get all orders with status and amounts
  const { data: allOrders, error } = await supabase
    .from('orders')
    .select('id, status, amount')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  
  console.log(`\n📊 Total Orders in Database: ${allOrders.length}`);
  
  // Status breakdown
  const statusBreakdown = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 Status Breakdown:');
  Object.entries(statusBreakdown).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  // Revenue calculations
  const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  console.log(`\n💰 Total Revenue (all orders): Rp ${totalRevenue.toLocaleString()}`);
  
  const paidCompletedRevenue = allOrders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, order) => sum + (order.amount || 0), 0);
  console.log(`💰 Paid + Completed Revenue: Rp ${paidCompletedRevenue.toLocaleString()}`);
  
  const paidOnlyRevenue = allOrders
    .filter(o => o.status === 'paid')
    .reduce((sum, order) => sum + (order.amount || 0), 0);
  console.log(`💰 Paid Only Revenue: Rp ${paidOnlyRevenue.toLocaleString()}`);
  
  const completedOnlyRevenue = allOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + (order.amount || 0), 0);
  console.log(`💰 Completed Only Revenue: Rp ${completedOnlyRevenue.toLocaleString()}`);
  
  // Show top orders by amount
  console.log('\n🔥 Top 10 Orders by Amount:');
  const topOrders = allOrders
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 10);
    
  topOrders.forEach((order, index) => {
    console.log(`  ${index + 1}. ${order.status}: Rp ${(order.amount || 0).toLocaleString()}`);
  });
}

debugRevenueCalculation();
