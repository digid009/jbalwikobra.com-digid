// Advanced debug script to check notification creation flow
const fetch = require('node-fetch');

async function advancedDebugTest() {
  console.log('🔍 Advanced debugging - checking notification creation flow...');
  
  try {
    // Test with specific order data that should trigger notification
    const debugOrder = {
      external_id: `advanced-debug-${Date.now()}`,
      amount: 15000,
      payer_email: 'advanced-debug@test.com',
      description: 'Advanced debug test for notifications',
      success_redirect_url: 'https://jbalwikobra.com/success',
      failure_redirect_url: 'https://jbalwikobra.com/failure',
      customer: {
        name: 'Advanced Debug Customer',
        phone: '+628111222333'
      },
      order: {
        product_name: 'Debug ML Diamonds',
        customer_name: 'Advanced Debug Customer',
        amount: 15000,
        customer_phone: '+628111222333'
      }
    };

    console.log('📤 Creating order with full notification data...');
    
    const response = await fetch('https://jbalwikobra.com/api/xendit/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script/1.0'
      },
      body: JSON.stringify(debugOrder)
    });

    console.log('📋 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Order created:', result.external_id);
    
    // Give some time for notification to be processed
    console.log('\n⏳ Waiting 3 seconds for notification processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🔍 DEBUGGING CHECKLIST:');
    console.log('1. ✅ SUPABASE_SERVICE_ROLE_KEY is set in Vercel');
    console.log('2. ✅ Order creation API is working');
    console.log('3. ❓ Check if createOrderNotification function is being called');
    console.log('4. ❓ Check if there are any errors in Vercel function logs');
    console.log('5. ❓ Verify admin_notifications table structure');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check Vercel function logs at: https://vercel.com/dashboard → Functions');
    console.log('2. Look for console.log messages from createOrderNotification');
    console.log('3. Check for any errors in the logs');
    console.log('4. Verify the admin_notifications table exists in Supabase');
    
    console.log('\n💡 POSSIBLE ISSUES:');
    console.log('- RLS policies blocking insertion (need to run SQL fix)');
    console.log('- admin_notifications table missing columns');
    console.log('- createOrderNotification function throwing errors');
    console.log('- Database connection issues');

  } catch (error) {
    console.error('❌ Advanced debug failed:', error);
  }
}

advancedDebugTest();
