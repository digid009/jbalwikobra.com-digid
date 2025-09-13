const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getPaidOrders() {
  try {
    console.log('🔍 Fetching paid orders...\n');
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, product_id, user_id, customer_name, customer_email, amount, created_at, status')
      .in('status', ['paid', 'completed'])
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    console.log('=== PAID ORDERS FOUND ===');
    console.log('Total paid orders:', orders.length);
    console.log();
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
      console.log(`   Product ID: ${order.product_id}`);
      console.log(`   User ID: ${order.user_id || 'NULL'}`);
      console.log(`   Amount: IDR ${order.amount?.toLocaleString('id-ID') || 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString('id-ID')}`);
      console.log();
    });
    
    return orders;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

getPaidOrders();
