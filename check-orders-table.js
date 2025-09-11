require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking orders table structure and admin_notifications...');

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n🗄️ Checking orders table...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Orders table error:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ Orders table exists!');
      console.log('Sample data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Orders table exception:', err.message);
  }

  console.log('\n🔔 Checking admin_notifications table...');
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ admin_notifications table error:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ admin_notifications table exists!');
      console.log('Sample data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ admin_notifications table exception:', err.message);
  }

  console.log('\n📊 Checking what tables do exist...');
  try {
    // Try to find existing tables
    const tables = ['users', 'products', 'banners', 'feed_posts', 'reviews', 'flash_sales', 'user_sessions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ ${table} table exists`);
        } else {
          console.log(`❌ ${table} table: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${table} table exception: ${err.message}`);
      }
    }
  } catch (err) {
    console.log('Error checking tables:', err.message);
  }

  // Check if we can get orders with different approaches
  console.log('\n🔍 Trying alternative orders queries...');
  
  // Try simple count
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Orders count error:', error.message);
    } else {
      console.log('✅ Orders table count:', count);
    }
  } catch (err) {
    console.log('❌ Orders count exception:', err.message);
  }

  // Try with specific columns
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_amount')
      .limit(3);
    
    if (error) {
      console.log('❌ Orders specific columns error:', error.message);
    } else {
      console.log('✅ Orders specific columns:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Orders specific columns exception:', err.message);
  }
}

checkTables().catch(console.error);
