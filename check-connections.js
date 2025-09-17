require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

(async () => {
  console.log('🔍 Checking existing payments and orders...\n');
  
  const { data: payments } = await supabase
    .from('payments')
    .select('external_id, payment_method, status')
    .limit(10);
    
  console.log('💳 Payments in database:');
  payments?.forEach(p => {
    console.log(`   ${p.external_id} → ${p.payment_method} (${p.status})`);
  });
  
  console.log('\n📦 Orders with external_id:');
  const { data: orders } = await supabase
    .from('orders')
    .select('client_external_id, customer_name, amount')
    .not('client_external_id', 'is', null)
    .limit(10);
    
  orders?.forEach(o => {
    console.log(`   ${o.client_external_id} → ${o.customer_name} (${o.amount})`);
  });
  
  // Check for matches
  const paymentIds = new Set(payments?.map(p => p.external_id) || []);
  const orderIds = orders?.map(o => o.client_external_id) || [];
  const matches = orderIds.filter(id => paymentIds.has(id));
  
  console.log(`\n🔗 Matches found: ${matches.length}`);
  matches.forEach(id => console.log(`   ✅ ${id}`));
  
  if (matches.length === 0) {
    console.log('\n❗ No matches found. Let me create a test connection...');
    
    // Update one existing order to match a payment
    if (payments && payments.length > 0 && orders && orders.length > 0) {
      const testPayment = payments[0];
      const testOrder = orders[0];
      
      console.log(`\n🔧 Updating order ${testOrder.client_external_id} to match payment ${testPayment.external_id}`);
      
      const { error } = await supabase
        .from('orders')
        .update({ client_external_id: testPayment.external_id })
        .eq('client_external_id', testOrder.client_external_id);
        
      if (error) {
        console.error('❌ Update failed:', error.message);
      } else {
        console.log('✅ Test connection created! Order now links to payment.');
      }
    }
  }
})();
