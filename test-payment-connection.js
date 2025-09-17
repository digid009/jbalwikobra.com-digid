// Test script to verify orders and payments connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function testPaymentConnection() {
  try {
    console.log('🔍 Testing Orders and Payments Connection...\n');

    // 1. Get recent orders
    console.log('📋 Fetching recent orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_name, amount, status, client_external_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Orders query error:', ordersError);
      return;
    }

    console.log(`✅ Found ${orders?.length || 0} recent orders`);

    // 2. Check for orders with external IDs
    const ordersWithExternalId = orders?.filter(o => o.client_external_id) || [];
    console.log(`📎 Orders with external_id: ${ordersWithExternalId.length}`);

    if (ordersWithExternalId.length === 0) {
      console.log('\n⚠️  No orders with external_id found. This is normal if no payments were made through the new system.');
      return;
    }

    // 3. Get corresponding payments
    console.log('\n💳 Fetching corresponding payments...');
    const externalIds = ordersWithExternalId.map(o => o.client_external_id);
    
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('external_id, xendit_id, payment_method, status, amount, payment_data, created_at')
      .in('external_id', externalIds);

    if (paymentsError) {
      console.error('❌ Payments query error:', paymentsError);
      return;
    }

    console.log(`✅ Found ${payments?.length || 0} matching payments`);

    // 4. Show connection results
    console.log('\n🔗 Orders ↔ Payments Connection:');
    console.log('=' .repeat(80));

    ordersWithExternalId.forEach(order => {
      const payment = payments?.find(p => p.external_id === order.client_external_id);
      
      console.log(`\n📦 Order: ${order.id.slice(0, 8)}...`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(`   Amount: IDR ${order.amount?.toLocaleString('id-ID')}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   External ID: ${order.client_external_id}`);
      
      if (payment) {
        console.log(`   💳 Payment Found:`);
        console.log(`      Xendit ID: ${payment.xendit_id}`);
        console.log(`      Method: ${payment.payment_method}`);
        console.log(`      Status: ${payment.status}`);
        console.log(`      Amount: IDR ${payment.amount?.toLocaleString('id-ID')}`);
        
        if (payment.payment_data?.qr_url) {
          console.log(`      QR Available: Yes`);
        }
        if (payment.payment_data?.account_number) {
          console.log(`      VA Number: ${payment.payment_data.account_number}`);
        }
        console.log(`   ✅ Connection: LINKED`);
      } else {
        console.log(`   ❌ Connection: NO PAYMENT FOUND`);
      }
    });

    // 5. Summary
    const connectedCount = ordersWithExternalId.filter(order => 
      payments?.some(p => p.external_id === order.client_external_id)
    ).length;

    console.log('\n📊 Summary:');
    console.log(`   Total orders: ${orders?.length || 0}`);
    console.log(`   Orders with external_id: ${ordersWithExternalId.length}`);
    console.log(`   Connected payments: ${connectedCount}`);
    console.log(`   Connection rate: ${ordersWithExternalId.length > 0 ? Math.round((connectedCount / ordersWithExternalId.length) * 100) : 0}%`);

    if (connectedCount > 0) {
      console.log('\n✅ Payment connection is working! Admin panel will show enhanced payment data.');
    } else {
      console.log('\n⚠️  No connected payments found. This might be normal if using older payment methods.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPaymentConnection().then(() => {
  console.log('\n🏁 Test completed.');
  process.exit(0);
});
