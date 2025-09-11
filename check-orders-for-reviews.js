const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xxtgaviggkbrdgxfkwcz.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dGdhdmlnZ2ticmRneGZrd2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzQ5MzEsImV4cCI6MjA0NzE1MDkzMX0.aKQ1BDjE9fHp-B1TXhSWzfzQPCIr3c2UovfhB0T3gY8';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('=== CHECKING ORDERS TABLE ===');
  
  // Get sample orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .limit(3);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  
  console.log('Sample orders:', JSON.stringify(orders, null, 2));
  
  // Get paid/completed orders for reviews
  console.log('\n=== PAID/COMPLETED ORDERS FOR REVIEWS ===');
  const { data: paidOrders, error: paidError } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email, product_name, status, total_amount, created_at')
    .in('status', ['paid', 'completed', 'delivered'])
    .limit(20);
    
  if (paidError) {
    console.error('Paid orders error:', paidError);
    return;
  }
  
  console.log('Total paid orders found:', paidOrders?.length || 0);
  console.log('Paid orders sample:', JSON.stringify(paidOrders, null, 2));
  
  // Check existing reviews
  console.log('\n=== EXISTING REVIEWS ===');
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .limit(5);
    
  if (reviewsError) {
    console.error('Reviews error:', reviewsError);
  } else {
    console.log('Existing reviews:', JSON.stringify(reviews, null, 2));
  }
})();
