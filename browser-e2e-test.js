// 🧪 Quick Browser Console Test for E2E Payment Flow
// Copy and paste this into the browser console on http://localhost:3000

console.log('🚀 Starting E2E Payment Flow Tests...');

// Test 1: Payment Methods API
async function testPaymentMethods() {
  console.log('\n💳 Testing Payment Methods API...');
  try {
    const response = await fetch('/api/xendit/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment Methods API working');
      console.log('📊 Data source:', data.source);
      console.log('🔢 Methods count:', data.payment_methods?.length || 0);
      
      // Show available methods
      if (data.payment_methods) {
        console.log('💰 Available methods:', data.payment_methods.map(m => m.id).join(', '));
      }
      return { success: true, data };
    } else {
      console.log('❌ Payment Methods API failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ Payment Methods test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: Create Purchase Payment (QRIS)
async function testPurchasePayment() {
  console.log('\n🛒 Testing Purchase Payment (QRIS)...');
  try {
    const response = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method_id: 'qris',
        amount: 50000,
        currency: 'IDR',
        customer: {
          given_names: 'Test User',
          email: 'test@localhost.com',
          mobile_number: '+628123456789'
        },
        description: 'Browser Test Purchase',
        external_id: `browser_purchase_${Date.now()}`,
        order: {
          customer_name: 'Test User',
          customer_email: 'test@localhost.com',
          customer_phone: '+628123456789',
          product_name: 'Test Product Purchase',
          amount: 50000,
          order_type: 'purchase'
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Purchase payment created successfully');
      console.log('🆔 Payment ID:', data.id);
      console.log('📱 Status:', data.status);
      console.log('🔗 QR Code available:', !!data.qr_string);
      
      if (data.qr_string) {
        console.log('📱 QR Code for scanning (first 50 chars):', data.qr_string.substring(0, 50) + '...');
      }
      
      return { success: true, paymentId: data.id, data };
    } else {
      console.log('❌ Purchase payment failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ Purchase payment test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Create Rental Payment (Virtual Account)
async function testRentalPayment() {
  console.log('\n🏠 Testing Rental Payment (BNI VA)...');
  try {
    const response = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method_id: 'bni',
        amount: 25000,
        currency: 'IDR',
        customer: {
          given_names: 'Test User Rental',
          email: 'test.rental@localhost.com',
          mobile_number: '+628123456789'
        },
        description: 'Browser Test Rental',
        external_id: `browser_rental_${Date.now()}`,
        order: {
          customer_name: 'Test User Rental',
          customer_email: 'test.rental@localhost.com',
          customer_phone: '+628123456789',
          product_name: 'Test Product Rental',
          amount: 25000,
          order_type: 'rental',
          rental_duration: '1 hari'
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Rental payment created successfully');
      console.log('🆔 Payment ID:', data.id);
      console.log('📱 Status:', data.status);
      console.log('🏦 Virtual Account:', data.account_number || 'N/A');
      console.log('🏪 Bank Code:', data.bank_code || 'N/A');
      
      return { success: true, paymentId: data.id, data };
    } else {
      console.log('❌ Rental payment failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ Rental payment test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 4: Test Payment Retrieval
async function testPaymentRetrieval(paymentId) {
  console.log(`\n🔍 Testing Payment Retrieval for ${paymentId}...`);
  try {
    const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment retrieval successful');
      console.log('📊 Status:', data.status);
      console.log('💳 Method:', data.payment_method);
      console.log('💰 Amount:', data.amount);
      return { success: true, data };
    } else {
      console.log('❌ Payment retrieval failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ Payment retrieval test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runQuickTests() {
  console.log('🧪 JB Alwikobra Local Development - Quick E2E Test');
  console.log('═'.repeat(60));
  
  const results = [];
  
  // Test payment methods
  const paymentMethodsResult = await testPaymentMethods();
  results.push({ test: 'Payment Methods', ...paymentMethodsResult });
  
  if (!paymentMethodsResult.success) {
    console.log('\n❌ Payment Methods API failed. Check environment variables and Xendit keys.');
    return results;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test purchase payment
  const purchaseResult = await testPurchasePayment();
  results.push({ test: 'Purchase Payment', ...purchaseResult });
  
  if (purchaseResult.success) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const retrievalResult = await testPaymentRetrieval(purchaseResult.paymentId);
    results.push({ test: 'Purchase Retrieval', ...retrievalResult });
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test rental payment
  const rentalResult = await testRentalPayment();
  results.push({ test: 'Rental Payment', ...rentalResult });
  
  if (rentalResult.success) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const rentalRetrievalResult = await testPaymentRetrieval(rentalResult.paymentId);
    results.push({ test: 'Rental Retrieval', ...rentalRetrievalResult });
  }
  
  // Summary
  console.log('\n═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.test}: ${status}`);
  });
  
  console.log('═'.repeat(60));
  console.log(`Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your development environment is ready for E2E testing.');
    console.log('\n🚀 Next steps:');
    console.log('1. Navigate through the UI to test the full user experience');
    console.log('2. Complete a test payment using Xendit test methods');
    console.log('3. Check browser console for any frontend errors');
    console.log('4. Verify payment interface pages load correctly');
  } else {
    console.log('⚠️ Some tests failed. Check the specific error messages above.');
  }
  
  // Store results globally for inspection
  window.testResults = results;
  
  return results;
}

// Auto-run or provide manual trigger
console.log('💡 Run: runQuickTests() to start all tests');
console.log('💡 Or run individual tests: testPaymentMethods(), testPurchasePayment(), etc.');

// Auto-run the tests
runQuickTests();
