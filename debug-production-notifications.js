// Debug script to test notification creation directly on production
const fetch = require('node-fetch');

async function debugNotificationCreation() {
  console.log('🐛 Debugging notification creation on production...');
  
  try {
    // Create a test order to trigger notification
    const testOrder = {
      external_id: `debug-order-${Date.now()}`,
      amount: 25000,
      payer_email: 'debug@test.com',
      description: 'Debug test order for notification system',
      success_redirect_url: 'https://jbalwikobra.com/success',
      failure_redirect_url: 'https://jbalwikobra.com/failure',
      customer: {
        name: 'Debug Customer',
        phone: '+628999000111'
      },
      order: {
        product_name: 'ML Diamond Debug Test',
        customer_name: 'Debug Customer',
        amount: 25000,
        customer_phone: '+628999000111'
      }
    };

    console.log('📤 Creating test order on production...');
    
    const response = await fetch('https://jbalwikobra.com/api/xendit/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    console.log('📋 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Order created successfully:', result.external_id);
    console.log('📋 Full response:', JSON.stringify(result, null, 2));

    console.log('\n🔍 Next steps to debug:');
    console.log('1. Check Vercel function logs for any errors during notification creation');
    console.log('2. Verify SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables');
    console.log('3. Check admin_notifications table for new rows');
    console.log('4. Look for console.log messages from createOrderNotification function');

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Run the debug test
debugNotificationCreation().then(() => {
  console.log('\n✨ Debug test completed');
}).catch(err => {
  console.error('❌ Debug test crashed:', err);
});
