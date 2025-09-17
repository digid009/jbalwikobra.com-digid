/**
 * Test script to check payment methods API response
 */

async function testPaymentMethodsAPI() {
  console.log('🧪 Testing Payment Methods API...');
  
  try {
    const response = await fetch('/api/xendit/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 })
    });
    
    console.log('📥 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', data);
    
    console.log('🔍 Analysis:');
    console.log('  Source:', data.source);
    console.log('  Payment Methods Count:', data.payment_methods?.length || 0);
    
    if (data.source === 'xendit_api') {
      console.log('✅ API is working - should show as online');
    } else {
      console.log('❌ API is in fallback mode - will show "Mode Offline"');
      console.log('   This means Xendit credentials may not be working');
    }
    
  } catch (error) {
    console.error('💥 Error testing API:', error);
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testPaymentMethodsAPI();
} else {
  console.log('Run this script in browser console');
}
