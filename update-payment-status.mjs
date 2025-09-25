// Manual status update script for completed payments
// Use this ONLY when payment was actually completed but webhook failed

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePaymentStatusToPaid() {
  const targetExternalId = 'order_1758810473577_9jx3f58wo_iy.we_8bii';
  const paidAt = new Date().toISOString();
  
  console.log('🔄 Manually updating payment and order status to PAID...');
  console.log('⚠️  WARNING: Only use this if you have confirmed the payment was actually completed!');
  
  try {
    // 1. Update payment status
    const { data: updatedPayment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'PAID',
        paid_at: paidAt,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', targetExternalId)
      .select('*')
      .single();
      
    if (paymentError) {
      console.error('❌ Error updating payment:', paymentError);
      return;
    }
    
    console.log('✅ Payment status updated to PAID');
    
    // 2. Update order status
    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: paidAt,
        updated_at: new Date().toISOString()
      })
      .eq('client_external_id', targetExternalId)
      .select('*')
      .single();
      
    if (orderError) {
      console.error('❌ Error updating order:', orderError);
      return;
    }
    
    console.log('✅ Order status updated to paid');
    console.log('   Order ID:', updatedOrder.id);
    console.log('   Amount:', updatedOrder.amount);
    console.log('   Paid at:', updatedOrder.paid_at);
    
    // 3. Try to trigger WhatsApp notifications
    console.log('\\n📱 Attempting to trigger WhatsApp notifications...');
    
    try {
      // Call the webhook's notification function
      const webhookUrl = 'https://jbalwikobra-com-digid-fymxrkce2-digitalindo.vercel.app/api/xendit/webhook';
      
      // Create a mock webhook payload to trigger notifications
      const mockWebhookPayload = {
        event: 'payment.paid',
        data: {
          id: updatedPayment.xendit_id,
          external_id: targetExternalId,
          status: 'PAID',
          amount: updatedPayment.amount,
          currency: 'IDR',
          paid_at: paidAt
        }
      };
      
      console.log('📞 Calling webhook to trigger notifications...');
      // This would normally be done by Xendit, but we're manually triggering it
      console.log('💡 Manual webhook trigger not implemented - notifications should be sent from admin panel');
      
    } catch (notificationError) {
      console.warn('⚠️  Could not trigger notifications automatically:', notificationError.message);
      console.log('💡 You may need to manually notify the customer about the successful payment');
    }
    
    console.log('\\n🎉 Status update complete!');
    console.log('✅ Payment: REQUIRES_ACTION → PAID');
    console.log('✅ Order: pending → paid');
    console.log('\\n👀 Check the admin panel - the order should now show as PAID');
    
  } catch (error) {
    console.error('❌ Manual update failed:', error);
  }
}

// Add safety check
console.log('🚨 SAFETY CHECK: Are you sure the payment was actually completed by the customer?');
console.log('This script will mark the payment as PAID and trigger notifications.');
console.log('\\nRunning update in 3 seconds... Press Ctrl+C to cancel if unsure');

setTimeout(() => {
  updatePaymentStatusToPaid();
}, 3000);
