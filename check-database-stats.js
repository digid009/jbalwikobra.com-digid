require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function checkUserStats() {
  console.log('👥 USER STATISTICS:');
  
  // Total users
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  console.log('Total Users:', totalUsers);
  
  // Admin users
  const { count: adminUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_admin', true);
  console.log('Admin Users:', adminUsers);
  
  // Verified users
  const { count: verifiedUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('phone_verified', true);
  console.log('Phone Verified Users:', verifiedUsers);
  
  // Complete profiles
  const { count: completeProfiles } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('profile_completed', true);
  console.log('Complete Profiles:', completeProfiles);

  console.log('\n📦 ORDER STATISTICS:');
  
  // Total orders
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('Total Orders:', totalOrders);
  
  // Orders by status
  const { data: orders } = await supabase.from('orders').select('status');
  const statusCount = {};
  orders?.forEach(order => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });
  console.log('Orders by Status:', statusCount);
  
  console.log('\n🛍️ PRODUCT STATISTICS:');
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('Total Products:', totalProducts);
  
  console.log('\n📱 OTHER TABLE COUNTS:');
  const tables = ['banners', 'feed_posts', 'phone_verifications', 'user_sessions', 'admin_notifications', 'reviews', 'notifications', 'flash_sales'];
  
  for (const table of tables) {
    try {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`${table}:`, count);
    } catch (e) {
      console.log(`${table}: Error -`, e.message);
    }
  }
}

checkUserStats();
