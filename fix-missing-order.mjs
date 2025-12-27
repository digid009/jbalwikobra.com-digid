// Recovery script to create missing order from payment data
// This fixes the specific case where payment exists but order was not created

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingOrderFromPayment() {
  const targetExternalId = 'order_1758810473577_9jx3f58wo_iy.we_8bii';
  
  console.log('🔧 Creating missing order from payment data...');
  
  try {
    // 1. Get payment data
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', targetExternalId)
      .single();
      
    if (!payment) {
      console.error('❌ Payment not found!');
      return;
    }
    
    console.log('✅ Found payment:');
    console.log('   External ID:', payment.external_id);
    console.log('   Amount:', payment.amount);
    console.log('   Status:', payment.status);
    console.log('   Created:', payment.created_at);
    
    // 2. Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('client_external_id', targetExternalId)
      .single();
      
    if (existingOrder) {
      console.log('✅ Order already exists with ID:', existingOrder.id);
      return;
    }
    
    // 3. Create order from payment data
    const orderData = {
      client_external_id: payment.external_id,
      product_id: null, // Will need to be filled manually if needed
      customer_name: 'Customer', // Default name, can be updated later
      customer_email: 'recovery@jbalwikobra.com', // Default email for recovered orders
      customer_phone: '6200000000000', // Default phone for recovered orders
      order_type: 'purchase',
      amount: payment.amount,
      payment_method: 'xendit',
      rental_duration: null,
      user_id: null,
      status: payment.status === 'PAID' ? 'paid' : 'pending',
      currency: payment.currency || 'IDR',
      created_at: payment.created_at,
      updated_at: new Date().toISOString(),
      // Copy relevant payment info
      xendit_invoice_id: payment.xendit_id,
      payment_channel: payment.payment_method
    };
    
    console.log('\\n🔄 Creating order with data:');
    console.log('   External ID:', orderData.client_external_id);
    console.log('   Amount:', orderData.amount);
    console.log('   Status:', orderData.status);
    
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();
      
    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return;
    }
    
    console.log('\\n✅ Order created successfully!');
    console.log('   Order ID:', newOrder.id);
    console.log('   Status:', newOrder.status);
    
    // 4. If payment is already PAID, update payment status to match
    if (payment.status === 'REQUIRES_ACTION') {
      console.log('\\n🔄 Payment status is still REQUIRES_ACTION. Consider updating to PAID if payment was actually completed.');
    }
    
    console.log('\\n🎉 Recovery complete! The payment-order connection is now established.');
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
  }
}

createMissingOrderFromPayment();
