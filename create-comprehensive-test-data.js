const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function createTestData() {
  console.log('=== CREATING COMPREHENSIVE TEST DATA ===');
  
  // Get existing users
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(3);
    
  if (!users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }
  
  console.log(`✅ Found ${users.length} users`);
  
  // Try to insert orders with different approaches
  console.log('\n--- Attempting Order Creation ---');
  
  // Method 1: Direct insert with service role simulation
  const testOrders = [
    {
      user_id: users[0].id,
      status: 'pending',
      amount: 150000,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      user_id: users[0].id,
      status: 'completed',
      amount: 250000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      user_id: users.length > 1 ? users[1].id : users[0].id,
      status: 'processing',
      amount: 320000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    }
  ];
  
  for (let i = 0; i < testOrders.length; i++) {
    const order = testOrders[i];
    console.log(`Attempting to create order ${i + 1}...`);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
      
    if (error) {
      console.log(`❌ Order ${i + 1} failed:`, error.message);
      
      // Try without explicit timestamps
      const simpleOrder = {
        user_id: order.user_id,
        status: order.status,
        amount: order.amount
      };
      
      const { data: data2, error: error2 } = await supabase
        .from('orders')
        .insert([simpleOrder])
        .select();
        
      if (error2) {
        console.log(`❌ Simple order ${i + 1} also failed:`, error2.message);
      } else {
        console.log(`✅ Simple order ${i + 1} created:`, data2[0]?.id);
      }
    } else {
      console.log(`✅ Order ${i + 1} created:`, data[0]?.id);
    }
  }
  
  // Final count check
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\n📊 Final orders count: ${count}`);
  
  // Test admin service query
  console.log('\n--- Testing Admin Service Query ---');
  const { data: adminData, error: adminError, count: adminCount } = await supabase
    .from('orders')
    .select('id, user_id, status, amount, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false });
    
  console.log('Admin query result:');
  console.log('Count:', adminCount);
  console.log('Data:', adminData);
  console.log('Error:', adminError);
}

createTestData().catch(console.error);
