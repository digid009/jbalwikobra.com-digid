const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function getActualOrdersSchema() {
  console.log('=== ACTUAL ORDERS SCHEMA ===');
  
  // Test all visible columns from the screenshot
  const columnsToTest = [
    'id', 'product_id', 'customer_name', 'customer_email', 'customer_phone', 
    'order_type', 'created_at', 'updated_at', 'amount', 'status', 'user_id'
  ];
  
  for (const col of columnsToTest) {
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
  
  // Get actual data with the columns we know exist
  console.log('\n=== FETCHING ACTUAL ORDERS ===');
  const { data: orders, error, count } = await supabase
    .from('orders')
    .select('id, product_id, customer_name, customer_email, customer_phone, order_type', { count: 'exact' })
    .limit(5);
    
  console.log('Orders found:', count);
  console.log('Sample orders:', orders);
  console.log('Error:', error);
}

getActualOrdersSchema().catch(console.error);
