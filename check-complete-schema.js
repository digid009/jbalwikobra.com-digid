require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

console.log('🔍 Getting complete database schema...');

async function checkSchema() {
  console.log('\n📊 Checking key tables individually...');
  
  const tables = [
    'users', 'orders', 'products', 'banners', 'feed_posts', 
    'phone_verifications', 'user_sessions', 'admin_notifications',
    'reviews', 'notifications', 'categories', 'flash_sales'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Found (${data ? data.length : 0} sample records)`);
        if (data && data.length > 0) {
          console.log(`   Sample columns: ${Object.keys(data[0]).slice(0, 5).join(', ')}`);
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }
  
  console.log('\n🔍 Checking users table structure in detail...');
  try {
    const { data, error } = await supabase.from('users').select('*').limit(3);
    if (data && data.length > 0) {
      console.log('Users table columns:', Object.keys(data[0]));
      console.log('Sample user:', {
        id: data[0].id,
        phone: data[0].phone,
        email: data[0].email,
        name: data[0].name,
        is_admin: data[0].is_admin,
        created_at: data[0].created_at
      });
    }
  } catch (e) {
    console.log('Error checking users:', e.message);
  }

  console.log('\n🔍 Checking orders table structure in detail...');
  try {
    const { data, error } = await supabase.from('orders').select('*').limit(3);
    if (data && data.length > 0) {
      console.log('Orders table columns:', Object.keys(data[0]));
      console.log('Sample order:', {
        id: data[0].id,
        customer_name: data[0].customer_name,
        amount: data[0].amount,
        status: data[0].status,
        created_at: data[0].created_at
      });
    }
  } catch (e) {
    console.log('Error checking orders:', e.message);
  }

  console.log('\n✅ Schema check complete');
}

checkSchema();
