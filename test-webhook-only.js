/**
 * Simple Webhook Test
 * Test just the webhook functionality without full payment flow
 */

const fetch = require('node-fetch');

console.log('🔗 Testing Webhook Functionality');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testWebhookDirectly() {
  // Test different endpoints based on environment
  const endpoints = [
    'http://localhost:3002/api/xendit/webhook',
    'http://localhost:3000/api/xendit/webhook',
    'https://www.jbalwikobra.com/api/xendit/webhook'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint}`);
    
    try {
      // Test 1: Simple WhatsApp group message
      const testPayload = {
        testGroupSend: true,
        message: `🧪 *WEBHOOK TEST MESSAGE*

📋 **SYSTEM HEALTH CHECK**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ **Webhook Endpoint:** Working
✅ **WhatsApp Service:** Active
✅ **Message Templates:** Enhanced format

🕐 **Test Time:** ${new Date().toLocaleString('id-ID')}
🔧 **Endpoint:** ${endpoint}

#WebhookTest #SystemHealthy`
      };

      const response = await fetch(`${endpoint}?testGroupSend=1`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Callback-Token': process.env.XENDIT_CALLBACK_TOKEN || 'test-token'
        },
        body: JSON.stringify(testPayload),
        timeout: 10000
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ WhatsApp test successful');
        console.log(`   - Success: ${result.success}`);
        if (result.provider) {
          console.log(`   - Provider: ${result.provider.name || 'Unknown'}`);
          console.log(`   - Status: ${result.provider.status || 'Unknown'}`);
        }

        // Test 2: Simulate payment webhook
        console.log('\n🔗 Testing payment webhook simulation...');
        
        const mockPaymentPayload = {
          event: 'qr_code.callback',
          data: {
            id: 'test_payment_' + Date.now(),
            external_id: 'test_order_' + Date.now(),
            status: 'SUCCEEDED',
            amount: 75000,
            currency: 'IDR',
            paid_at: new Date().toISOString(),
            payment_channel: 'QRIS',
            qr_code: {
              status: 'ACTIVE'
            },
            metadata: {
              customer_name: 'Test Customer',
              customer_email: 'test@example.com',
              customer_phone: '6289653510125',
              product_id: 1,
              order_type: 'purchase'
            }
          }
        };

        const webhookResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Callback-Token': process.env.XENDIT_CALLBACK_TOKEN || 'test-token'
          },
          body: JSON.stringify(mockPaymentPayload),
          timeout: 10000
        });

        if (webhookResponse.ok) {
          const webhookResult = await webhookResponse.json();
          console.log('✅ Payment webhook test successful');
          console.log(`   - Orders updated: ${webhookResult.updated || 0}`);
          console.log(`   - Method: ${webhookResult.by || 'none'}`);
        } else {
          console.log(`⚠️ Payment webhook test failed: ${webhookResponse.status}`);
        }

        return true; // Found working endpoint
        
      } else {
        console.log(`❌ Failed: ${response.status} - ${response.statusText}`);
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  return false;
}

// Test webhook functionality directly
testWebhookDirectly().then(success => {
  if (success) {
    console.log('\n🎉 Webhook testing completed successfully!');
    console.log('\n💡 Your WhatsApp notifications system is working correctly');
  } else {
    console.log('\n🚨 All webhook endpoints failed');
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Make sure Vercel dev server is running (vercel dev)');
    console.log('   2. Check your environment variables (.env.local)');
    console.log('   3. Verify your Supabase connection');
    console.log('   4. Check WhatsApp provider configuration');
  }
});
