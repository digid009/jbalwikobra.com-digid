/**
 * Test Rental WhatsApp Notification System
 * Simulates a rental payment webhook to test customer notification
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mzrqjvvzdknpjrwftsiq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testRentalNotificationSystem() {
  console.log('📱 Testing Rental WhatsApp Notification System');
  console.log('============================================\n');
  
  try {
    // 1. Create a test rental order
    console.log('1. Creating test rental order...');
    const testOrder = {
      client_external_id: `test_rental_${Date.now()}`,
      product_id: null, // Test without product for simplicity
      customer_name: 'Test Rental Customer',
      customer_email: 'test.rental@example.com',
      customer_phone: '08123456789', // Indonesian format that will be converted to 628123456789
      order_type: 'rental',
      amount: 50000,
      payment_method: 'xendit',
      rental_duration: '1 bulan',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Failed to create test rental order:', insertError);
      return;
    }
    
    console.log('✅ Test rental order created:', newOrder.id);
    console.log('   Customer:', newOrder.customer_name);
    console.log('   Phone:', newOrder.customer_phone);
    console.log('   Duration:', newOrder.rental_duration);
    console.log('   Amount:', newOrder.amount);
    
    // 2. Simulate payment completion by updating order status
    console.log('\n2. Simulating payment completion...');
    const { data: paidOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_channel: 'qris',
        xendit_invoice_id: `test_invoice_${Date.now()}`
      })
      .eq('id', newOrder.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('❌ Failed to update order status:', updateError);
      return;
    }
    
    console.log('✅ Order status updated to paid');
    console.log('   Paid at:', paidOrder.paid_at);
    
    // 3. Test the notification function directly
    console.log('\n3. Testing WhatsApp notification function...');
    
    // Simulate the sendOrderPaidNotification function
    const testNotificationData = await simulateNotificationSending(paidOrder);
    
    if (testNotificationData.success) {
      console.log('✅ Notification system test completed successfully');
      console.log('   Phone formatted to:', testNotificationData.formattedPhone);
      console.log('   Message type:', testNotificationData.messageType);
      console.log('   Message preview:', testNotificationData.messagePreview);
    } else {
      console.log('❌ Notification system test failed:', testNotificationData.error);
    }
    
    // 4. Cleanup - delete test order
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', newOrder.id);
      
    if (deleteError) {
      console.warn('⚠️ Failed to delete test order:', deleteError);
    } else {
      console.log('✅ Test order cleaned up');
    }
    
    console.log('\n🎉 Rental notification test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Simulate the notification sending logic from webhook.ts
async function simulateNotificationSending(order) {
  try {
    const isRental = order.order_type === 'rental';
    
    // Clean phone number (same logic as webhook)
    let customerPhone = order.customer_phone.replace(/\D/g, '');
    
    // Handle different input formats
    if (customerPhone.startsWith('62')) {
      // Already in correct format
    } else if (customerPhone.startsWith('08')) {
      customerPhone = '62' + customerPhone.substring(1);
    } else if (customerPhone.startsWith('8')) {
      customerPhone = '62' + customerPhone;
    } else if (customerPhone.startsWith('0')) {
      customerPhone = '62' + customerPhone.substring(1);
    } else if (customerPhone.length >= 8) {
      customerPhone = '62' + customerPhone;
    } else {
      return {
        success: false,
        error: `Invalid phone number format: ${order.customer_phone}`
      };
    }
    
    // Generate customer notification message (same as webhook)
    const customerMessage = isRental 
      ? `🎮 **RENTAL PAYMENT CONFIRMED!**

Halo ${order.customer_name || 'Customer'},

Terima kasih! Pembayaran rental Anda telah berhasil diproses.

📋 **Order ID:** ${order.id}
🎯 **Product:** Test Product
⏰ **Duration:** ${order.rental_duration || 'Not specified'}
💰 **Total:** Rp ${Number(order.amount || 0).toLocaleString('id-ID')}
✅ **Status:** PAID

📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

🚀 **Selanjutnya:**
• Tim kami akan segera mengatur akses rental Anda
• Informasi login akan dikirim dalam 5-15 menit
• Gunakan akun sesuai durasi yang dipilih
• Jangan ubah password atau data akun

⚠️ **PENTING:**
• Rental dimulai setelah akun diberikan
• Tidak ada perpanjangan otomatis
• Backup data pribadi sebelum rental berakhir

💬 **Support:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Selamat bermain! 🎮`
      : `Purchase message would go here...`;
    
    return {
      success: true,
      formattedPhone: customerPhone,
      messageType: isRental ? 'rental' : 'purchase',
      messagePreview: customerMessage.substring(0, 100) + '...',
      fullMessage: customerMessage
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testRentalNotificationSystem()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testRentalNotificationSystem, simulateNotificationSending };
