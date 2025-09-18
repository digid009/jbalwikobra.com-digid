/**
 * Quick Production API Test for www.jbalwikobra.com
 * Run this in browser console to test API endpoints
 */

async function quickProductionAPITest() {
  console.log('🚀 QUICK PRODUCTION API TEST');
  console.log('=' .repeat(50));
  
  const baseUrl = 'https://www.jbalwikobra.com';
  
  // Test 1: Payment Methods API
  console.log('\n1️⃣ Testing Payment Methods API...');
  try {
    const response = await fetch('/api/xendit/payment-methods');
    const data = await response.json();
    
    console.log(`Status: ${response.ok ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Methods count: ${data.methods?.length || 0}`);
    console.log(`Source: ${data.source || 'unknown'}`);
    console.log(`Is online: ${data.source !== 'fallback' ? 'YES' : 'NO'}`);
    
    if (data.source === 'fallback') {
      console.log('⚠️ WARNING: Using fallback data (offline mode)');
    }
    
  } catch (error) {
    console.log('❌ Payment Methods API Error:', error.message);
  }
  
  // Test 2: Create Test Payment (minimal)
  console.log('\n2️⃣ Testing Payment Creation...');
  try {
    const testPayload = {
      amount: 10000,
      currency: 'IDR',
      payment_method_id: 'qris',
      customer: {
        given_names: 'Debug Test',
        email: 'debug@jbalwikobra.com',
        mobile_number: '+6281234567890'
      },
      description: 'Debug Test Payment',
      external_id: `debug_${Date.now()}`,
      success_redirect_url: `${baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${baseUrl}/payment-status?status=failed`
    };
    
    const response = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment creation: OK');
      console.log(`Payment ID: ${data.id || 'N/A'}`);
      console.log(`Has QR data: ${data.qr_string ? 'YES' : 'NO'}`);
      console.log(`Has payment URL: ${data.invoice_url ? 'YES' : 'NO'}`);
    } else {
      const errorData = await response.json();
      console.log('❌ Payment creation failed:', errorData.error);
    }
    
  } catch (error) {
    console.log('❌ Payment Creation Error:', error.message);
  }
  
  // Test 3: Check Page Elements
  console.log('\n3️⃣ Testing Page Elements...');
  
  const elements = {
    'React Root': document.getElementById('root')?.children.length > 0,
    'Navigation': !!document.querySelector('nav, [role="navigation"]'),
    'Product Links': document.querySelectorAll('a[href*="/product"]').length,
    'Buy Buttons': [...document.querySelectorAll('button')].filter(b => b.textContent?.includes('Beli')).length,
    'Checkout Modal': !!document.querySelector('.fixed.inset-0')
  };
  
  Object.entries(elements).forEach(([name, status]) => {
    const icon = typeof status === 'boolean' ? (status ? '✅' : '❌') : '📊';
    console.log(`${icon} ${name}: ${status}`);
  });
  
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!elements['React Root']) {
    console.log('⚠️ React app may not be loading properly');
  }
  
  if (elements['Product Links'] === 0) {
    console.log('⚠️ No product links found - check if on correct page');
  }
  
  console.log('\n🧪 MANUAL TEST STEPS:');
  console.log('1. Go to Products page');
  console.log('2. Click on any product');
  console.log('3. Click "Beli Sekarang"');
  console.log('4. Fill customer form and test payment');
  
  console.log('\n✅ Quick test completed!');
}

// Auto-run
quickProductionAPITest();

// Make available globally
window.quickProductionAPITest = quickProductionAPITest;
