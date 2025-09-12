const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function createTestOrders() {
  console.log('=== CREATING TEST ORDERS ===');
  
  // Get a valid user_id from the users table
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(1);
    
  if (!users || users.length === 0) {
    console.log('❌ No users found, cannot create test orders');
    return;
  }
  
  const userId = users[0].id;
  console.log('✅ Using user ID:', userId);
  
  // Create test orders with correct structure
  const testOrders = [
    {
      user_id: userId,
      status: 'pending',
      amount: 150000,  // Using amount instead of total_amount
      created_at: new Date().toISOString()
    },
    {
      user_id: userId,
      status: 'completed',
      amount: 250000,
      created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
      user_id: userId,
      status: 'cancelled',
      amount: 75000,
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ];
  
  for (const order of testOrders) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
      
    if (error) {
      console.log(`❌ Failed to create order:`, error.message);
    } else {
      console.log(`✅ Created order:`, data[0]);
    }
  }
  
  // Check final count
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\n📊 Total orders in database: ${count}`);
}

createTestOrders().catch(console.error);
