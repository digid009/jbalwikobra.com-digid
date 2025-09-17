/**
 * Debug Payment Redirect Issue
 * Tests the scenario where payment redirect causes /products/undefined navigation
 */

const TEST_SCENARIOS = [
  {
    name: 'Payment Success Redirect',
    url: 'https://www.jbalwikobra.com/payment-status?status=success&order_id=123',
    description: 'Test success redirect from payment'
  },
  {
    name: 'Payment Failed Redirect', 
    url: 'https://www.jbalwikobra.com/payment-status?status=failed&order_id=123',
    description: 'Test failed redirect from payment'
  },
  {
    name: 'Product Detail with Undefined ID',
    url: 'https://www.jbalwikobra.com/products/undefined',
    description: 'Test the exact error scenario'
  },
  {
    name: 'Product Detail with No ID',
    url: 'https://www.jbalwikobra.com/products/',
    description: 'Test product route with no ID'
  }
];

async function testPaymentRedirectScenario() {
  console.log('🔍 Testing Payment Redirect Issues');
  console.log('⏰ Time:', new Date().toISOString());
  console.log('=' .repeat(60));

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📋 Description: ${scenario.description}`);
    console.log(`🔗 URL: ${scenario.url}`);
    
    try {
      const response = await fetch(scenario.url, {
        method: 'GET',
        redirect: 'manual' // Don't follow redirects automatically
      });
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.status >= 300 && response.status < 400) {
        console.log(`🔄 Redirect Location: ${response.headers.get('location')}`);
      }
      
      // Check if it's a successful HTML response
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.log(`✅ Returns HTML page successfully`);
        } else {
          console.log(`⚠️ Unexpected content type: ${contentType}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${scenario.name}:`, error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📋 POTENTIAL CAUSES OF /products/undefined:');
  console.log('=' .repeat(60));
  console.log('1. 🔗 React Router parameter parsing issue');
  console.log('2. 🔄 Incorrect navigation after payment completion');
  console.log('3. 📱 Frontend state corruption during payment flow');
  console.log('4. 🚪 Page refresh during payment process');
  console.log('5. 🌐 URL manipulation or deep linking issue');
  
  console.log('\n💡 SOLUTIONS TO IMPLEMENT:');
  console.log('1. ✅ Add better ID validation in useProductDetail');
  console.log('2. 🛡️ Add error boundary for invalid product routes');
  console.log('3. 🔄 Improve payment redirect flow');
  console.log('4. 📊 Add more logging to track navigation sources');
}

// Test specific payment flow that might cause the issue
async function testPaymentFlowRedirect() {
  console.log('\n🧪 Testing Payment Flow Redirect Logic...');
  
  // Simulate creating a payment and seeing what redirect URLs are generated
  const testPaymentData = {
    amount: 25000,
    currency: 'IDR',
    payment_method_id: 'qris',
    customer: {
      given_names: 'Test User',
      email: 'test@example.com',
      mobile_number: '+628123456789'
    },
    description: 'Test Payment Debug',
    external_id: `debug_${Date.now()}`,
    success_redirect_url: `https://www.jbalwikobra.com/payment-status?status=success`,
    failure_redirect_url: `https://www.jbalwikobra.com/payment-status?status=failed`
  };

  console.log('💳 Test Payment Data:', {
    success_url: testPaymentData.success_redirect_url,
    failure_url: testPaymentData.failure_redirect_url,
    external_id: testPaymentData.external_id
  });

  try {
    const response = await fetch('https://www.jbalwikobra.com/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPaymentData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment Created Successfully');
      console.log('🔗 Invoice URL:', data.invoice_url);
      console.log('📅 Expires:', data.expiry_date);
      
      // The issue might be in how Xendit handles the redirect URLs
      console.log('\n⚠️ POTENTIAL ISSUE:');
      console.log('If Xendit redirects with malformed URLs or unexpected parameters,');
      console.log('it could cause React Router to navigate to /products/undefined');
      
    } else {
      console.log('❌ Payment Creation Failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Payment Flow Error:', error.message);
  }
}

// Run the tests
testPaymentRedirectScenario()
  .then(() => testPaymentFlowRedirect())
  .catch(console.error);
