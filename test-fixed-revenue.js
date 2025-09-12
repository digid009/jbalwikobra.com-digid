const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedRevenue() {
  console.log('🔧 Testing Fixed Revenue Calculation...\n');

  try {
    // Get orders with status to calculate revenue correctly
    const { data: ordersWithStatus, error } = await supabase
      .from('orders')
      .select('amount, status')
      .in('status', ['paid', 'completed']);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    const totalRevenue = ordersWithStatus?.reduce((sum, order) => 
      sum + (Number(order.amount) || 0), 0) || 0;

    const paidOrders = ordersWithStatus?.filter(o => o.status === 'paid')?.length || 0;
    const completedOrders = ordersWithStatus?.filter(o => o.status === 'completed')?.length || 0;

    console.log('✅ Fixed Revenue Calculation:');
    console.log(`  Paid orders: ${paidOrders}`);
    console.log(`  Completed orders: ${completedOrders}`);
    console.log(`  Total revenue-generating orders: ${paidOrders + completedOrders}`);
    console.log(`  Correct Total Revenue: Rp ${totalRevenue.toLocaleString()}`);

    // Compare with all orders total
    const { data: allOrders } = await supabase
      .from('orders')
      .select('amount');

    const allOrdersRevenue = allOrders?.reduce((sum, order) => 
      sum + (Number(order.amount) || 0), 0) || 0;

    console.log('\n📊 Comparison:');
    console.log(`  All orders revenue (WRONG): Rp ${allOrdersRevenue.toLocaleString()}`);
    console.log(`  Paid+Completed revenue (CORRECT): Rp ${totalRevenue.toLocaleString()}`);
    console.log(`  Difference: Rp ${(allOrdersRevenue - totalRevenue).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error in test script:', error);
  }
}

testFixedRevenue();
