const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function checkOrdersStructure() {
  console.log('=== CHECKING ORDERS TABLE STRUCTURE ===');
  
  // Try to get some sample data structure by attempting various common column names
  const commonOrderColumns = [
    'id', 'user_id', 'status', 'amount', 'total', 'total_amount', 
    'created_at', 'updated_at', 'order_date', 'items', 'products', 'order_items'
  ];
  
  for (const col of commonOrderColumns) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(col)
        .limit(1);
      
      if (!error) {
        console.log(`✅ Column '${col}' exists`);
      } else {
        console.log(`❌ Column '${col}' error: ${error.message}`);
      }
    } catch (e) {
      console.log(`❌ Column '${col}' failed: ${e.message}`);
    }
  }
  
  // Try to create a test order
  console.log('\n=== TRYING TO CREATE TEST ORDER ===');
  const { data: insertData, error: insertError } = await supabase
    .from('orders')
    .insert([{
      user_id: 'test-user-123',
      status: 'pending'
    }])
    .select();
    
  console.log('Insert attempt:', { data: insertData, error: insertError?.message });
}

checkOrdersStructure().catch(console.error);
