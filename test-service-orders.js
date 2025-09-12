const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testOrdersAccess() {
  console.log('=== TESTING ORDERS ACCESS WITH SERVICE KEY ===');
  
  // Use the service key directly
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';
  
  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, serviceKey);
  
  try {
    console.log('Fetching orders with pagination...');
    const { data, error, count } = await supabase
      .from('orders')
      .select('id, customer_name, customer_email, customer_phone, order_type, amount, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 9); // First 10 orders
    
    console.log('Query result:', {
      total_count: count,
      returned_orders: data?.length || 0,
      error: error?.message
    });
    
    if (data && data.length > 0) {
      console.log('\n✅ SUCCESS! Orders retrieved successfully:');
      console.log('First 5 orders:');
      data.slice(0, 5).forEach((order, index) => {
        console.log(`${index + 1}. ${order.customer_name} - ${order.status} - $${order.amount} - ${order.created_at?.split('T')[0]}`);
      });
      
      // Test search functionality
      console.log('\nTesting search...');
      const { data: searchData, error: searchError } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, status, amount')
        .ilike('customer_name', '%ridwan%')
        .limit(5);
        
      console.log('Search results:', {
        found: searchData?.length || 0,
        error: searchError?.message
      });
      
      if (searchData && searchData.length > 0) {
        console.log('Search matches:', searchData);
      }
      
    } else {
      console.log('❌ No orders found or access denied');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOrdersAccess().catch(console.error);
