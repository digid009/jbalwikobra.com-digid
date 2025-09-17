/**
 * Production Purchase Flow Test
 * Tests the purchase flow on www.jbalwikobra.com
 */

const PRODUCTION_URL = 'https://www.jbalwikobra.com';

async function testProductionAPIs() {
  console.log('🌐 Testing Production Purchase Flow');
  console.log('🔗 URL:', PRODUCTION_URL);
  console.log('⏰ Time:', new Date().toISOString());
  console.log('=' .repeat(60));

  // Test 1: Payment Methods API
  console.log('\n1️⃣ Testing Payment Methods API...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/xendit/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 25000 })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment Methods API - Status:', response.status);
      console.log('📊 Source:', data.source);
      console.log('💳 Methods Available:', data.payment_methods?.length);
      console.log('🏆 Popular Methods:', data.payment_methods?.filter(m => m.popular)?.map(m => m.name));
      
      if (data.source === 'xendit_api') {
        console.log('🎉 SUCCESS: "Mode Offline" should NOT appear!');
      } else {
        console.log('⚠️ WARNING: "Mode Offline" will still appear');
      }
    } else {
      console.log('❌ Payment Methods API failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Payment Methods API error:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📋 PRODUCTION TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log('🌐 Website: https://www.jbalwikobra.com');
  console.log('⏰ Tested at:', new Date().toLocaleString());
  console.log('💡 If "Mode Offline" still appears:');
  console.log('   1. Clear browser cache (Ctrl+Shift+Delete)');
  console.log('   2. Try incognito/private browser');
  console.log('   3. Hard refresh (Ctrl+F5)');
  console.log('   4. Check browser dev tools for errors');
}

testProductionAPIs().catch(console.error);
