require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminSchema() {
  console.log('🔍 Checking admin-relevant database schema...\n');

  // Check key tables for admin functionality
  const tablesToCheck = [
    'users',
    'products', 
    'orders',
    'banners',
    'feed_posts',
    'reviews',
    'flash_sales',
    'notifications',
    'tiers',
    'game_titles'
  ];

  for (const table of tablesToCheck) {
    try {
      console.log(`📋 Checking '${table}' table:`);
      
      // Get table structure by fetching one record
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ Error: ${error.message}\n`);
        continue;
      }

      console.log(`✅ Table exists with ${count || 0} records`);
      
      if (data && data.length > 0) {
        console.log(`🔑 Sample fields:`, Object.keys(data[0]).join(', '));
      }
      
      console.log('');
    } catch (err) {
      console.log(`❌ Error checking ${table}:`, err.message, '\n');
    }
  }

  // Check for any admin-specific tables
  console.log('🔍 Checking for admin-specific functionality...\n');
  
  // Check if there are any admin user records
  try {
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (!error && adminUsers) {
      console.log('👤 Sample users:');
      adminUsers.forEach(user => {
        console.log(`   • ${user.email} ${user.role ? `(${user.role})` : '(no role)'}`);
      });
      console.log('');
    }
  } catch (err) {
    console.log('❌ Error checking admin users:', err.message, '\n');
  }
}

checkAdminSchema()
  .then(() => {
    console.log('✅ Schema check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
