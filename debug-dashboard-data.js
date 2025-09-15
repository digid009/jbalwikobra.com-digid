// Debug script to check actual dashboard data vs displayed data
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Checking environment variables...');
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDashboardData() {
  console.log('🔍 DEBUGGING DASHBOARD DATA...\n');
  
  try {
    console.log('📊 FETCHING RAW DATA:');
    console.log('=====================');
    
    // Get all stats in parallel - same queries as the service
    const [
      { count: totalUsers, error: usersError },
      { count: totalProducts, error: productsError },
      { count: totalOrders, error: ordersError },
      { count: pendingOrders, error: pendingError },
      { count: completedOrders, error: completedError },
      { count: paidOrders, error: paidError },
      { data: ordersWithRevenue, error: revenueError }
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
      supabase.from('orders').select('amount, status').in('status', ['paid', 'completed'])
    ]);

    // Check for errors
    if (usersError) console.error('❌ Users error:', usersError);
    if (productsError) console.error('❌ Products error:', productsError);
    if (ordersError) console.error('❌ Orders error:', ordersError);
    if (pendingError) console.error('❌ Pending orders error:', pendingError);
    if (completedError) console.error('❌ Completed orders error:', completedError);
    if (paidError) console.error('❌ Paid orders error:', paidError);
    if (revenueError) console.error('❌ Revenue error:', revenueError);

    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📦 Total Active Products: ${totalProducts}`);
    console.log(`📋 Total Orders: ${totalOrders}`);
    console.log(`⏳ Pending Orders: ${pendingOrders}`);
    console.log(`✅ Completed Orders: ${completedOrders}`);
    console.log(`💰 Paid Orders: ${paidOrders}`);
    
    // Calculate total revenue
    let totalRevenue = 0;
    if (ordersWithRevenue) {
      totalRevenue = ordersWithRevenue.reduce((sum, order) => 
        sum + (Number(order.amount) || 0), 0);
      
      console.log(`\n💵 REVENUE CALCULATION:`);
      console.log(`Orders with revenue count: ${ordersWithRevenue.length}`);
      ordersWithRevenue.forEach((order, index) => {
        console.log(`  Order ${index + 1}: Status=${order.status}, Amount=${order.amount} (${typeof order.amount})`);
      });
    }
    
    console.log(`💰 Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    
    // Get unique order statuses
    const { data: allOrders } = await supabase.from('orders').select('status');
    if (allOrders) {
      const statuses = [...new Set(allOrders.map(o => o.status))];
      console.log(`\n📊 UNIQUE ORDER STATUSES: ${statuses.join(', ')}`);
    }
    
    // Final calculated stats (same as service)
    const finalStats = {
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      pendingOrders: pendingOrders || 0,
      completedOrders: paidOrders || 0, // Completed orders = Paid orders only
    };
    
    console.log(`\n🎯 FINAL CALCULATED STATS:`);
    console.log('===========================');
    console.log(`Total Orders: ${finalStats.totalOrders}`);
    console.log(`Total Users: ${finalStats.totalUsers}`);
    console.log(`Total Products: ${finalStats.totalProducts}`);
    console.log(`Pending Orders: ${finalStats.pendingOrders}`);
    console.log(`Completed Orders (= Paid Orders): ${finalStats.completedOrders}`);
    console.log(`Total Revenue: Rp ${finalStats.totalRevenue.toLocaleString('id-ID')}`);
    
    console.log(`\n✨ These should match your dashboard display!`);
    
  } catch (error) {
    console.error('❌ Error debugging dashboard data:', error);
  }
}

debugDashboardData();
