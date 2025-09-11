const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
  try {
    console.log('Testing dashboard data access...');
    
    // Test orders
    const { data: orders, error: ordersError, count: ordersCount } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true });
      
    if (ordersError) {
      console.error('Orders error:', ordersError);
    } else {
      console.log('✅ Orders count:', ordersCount);
    }
    
    // Test users
    const { data: users, error: usersError, count: usersCount } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (usersError) {
      console.error('Users error:', usersError);
    } else {
      console.log('✅ Users count:', usersCount);
    }
    
    // Test products  
    const { data: products, error: productsError, count: productsCount } = await adminClient
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log('✅ Products count:', productsCount);
    }
    
    // Test actual orders data with amounts
    const { data: orderData, error: orderDataError } = await adminClient
      .from('orders')
      .select('status, amount')
      .limit(5);
      
    if (orderDataError) {
      console.error('Order data error:', orderDataError);
    } else {
      console.log('✅ Sample order data:', orderData);
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.amount || 0), 0);
      console.log('✅ Total revenue from sample:', totalRevenue);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardData();
