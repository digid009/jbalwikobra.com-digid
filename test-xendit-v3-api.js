// Test script for Xendit V3 API implementation
// Run with: node test-xendit-v3-api.js

const fetch = require('cross-fetch');

async function testXenditV3API() {
  const SITE_URL = 'http://localhost:3000'; // Change this to your development URL
  
  const testPayload = {
    amount: 50000,
    currency: 'IDR',
    payment_method_id: 'qris',
    external_id: `test-${Date.now()}`,
    description: 'Test V3 API Payment',
    success_redirect_url: `${SITE_URL}/success`,
    failure_redirect_url: `${SITE_URL}/failed`,
    order: {
      product_id: 'test-product',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '6289123456789',
      order_type: 'purchase',
      amount: 50000,
      product_name: 'Test Product'
    }
  };

  try {
    console.log('🚀 Testing Xendit V3 Payment API...');
    console.log('📋 Test Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(`${SITE_URL}/api/xendit/create-direct-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseData = await response.json();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Xendit V3 API working correctly!');
      if (responseData.payment_url) {
        console.log('💳 Payment URL:', responseData.payment_url);
      }
      if (responseData.payment_request_id) {
        console.log('🆔 Payment Request ID:', responseData.payment_request_id);
      }
    } else {
      console.log('\n❌ ERROR: Payment API returned error');
      console.log('🔍 Debug Info:', responseData.debug_info);
    }
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error('🔍 Stack:', error.stack);
  }
}

// Run the test
testXenditV3API().catch(console.error);
