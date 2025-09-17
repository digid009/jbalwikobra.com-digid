/**
 * Test script to check direct payment API response for different payment methods
 */

async function testDirectPaymentResponse() {
  console.log('🧪 Testing Direct Payment API Responses...');
  
  const testPayload = {
    amount: 50000,
    currency: 'IDR',
    payment_method_id: 'qris', // Test with QRIS first
    customer: {
      given_names: 'Test User',
      email: 'test@example.com',
      mobile_number: '+6281234567890'
    },
    description: 'Test Payment',
    external_id: `test_${Date.now()}`,
    success_redirect_url: 'https://jbalwikobra.com/success',
    failure_redirect_url: 'https://jbalwikobra.com/failed',
    order: {
      product_id: 'test-product',
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '+6281234567890',
      order_type: 'purchase',
      amount: 50000
    }
  };

  try {
    console.log('📤 Sending request for QRIS payment...');
    const response = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Payment created successfully!');
      console.log('🔍 Analyzing response structure:');
      
      // Check what fields are available
      const availableFields = Object.keys(data);
      console.log('📋 Available Fields:', availableFields);
      
      // Check for QRIS-specific data
      if (data.qr_string) {
        console.log('📱 QRIS QR Code available:', data.qr_string.substring(0, 50) + '...');
      }
      
      if (data.payment_url) {
        console.log('🌐 Payment URL:', data.payment_url);
      }
      
      if (data.account_number) {
        console.log('🏦 Virtual Account:', data.account_number);
      }
      
      // Test with different payment methods
      await testOtherPaymentMethods();
      
    } else {
      console.error('❌ Payment creation failed:', data);
    }
    
  } catch (error) {
    console.error('💥 Error testing payment:', error);
  }
}

async function testOtherPaymentMethods() {
  const methods = ['dana', 'gopay', 'bca', 'mandiri'];
  
  for (const method of methods) {
    console.log(`\n🧪 Testing ${method.toUpperCase()}...`);
    
    const testPayload = {
      amount: 50000,
      currency: 'IDR',
      payment_method_id: method,
      customer: {
        given_names: 'Test User',
        email: 'test@example.com',
        mobile_number: '+6281234567890'
      },
      description: `Test Payment - ${method}`,
      external_id: `test_${method}_${Date.now()}`,
      success_redirect_url: 'https://jbalwikobra.com/success',
      failure_redirect_url: 'https://jbalwikobra.com/failed'
    };

    try {
      const response = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${method.toUpperCase()} - Success`);
        console.log(`   Fields: ${Object.keys(data).join(', ')}`);
        
        if (data.payment_url) {
          console.log(`   Payment URL: ${data.payment_url}`);
        }
        if (data.qr_string) {
          console.log(`   QR Code: Available`);
        }
        if (data.account_number) {
          console.log(`   Account: ${data.account_number}`);
        }
      } else {
        console.log(`❌ ${method.toUpperCase()} - Failed: ${data.error}`);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`💥 ${method.toUpperCase()} - Error: ${error.message}`);
    }
  }
}

// Run the test
testDirectPaymentResponse();
