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

  // Test 2: Create Invoice API
  console.log('\n2️⃣ Testing Create Invoice API...');
  try {
    const testData = {
      amount: 25000,
      currency: 'IDR',
      payment_method_id: 'qris',
      customer: {
        given_names: 'Test User Production',
        email: 'test@production.com',
        mobile_number: '+628123456789'
      },
      description: 'Test Purchase Production',
      external_id: `test_prod_${Date.now()}`,
      success_redirect_url: `${PRODUCTION_URL}/payment-success`,
      failure_redirect_url: `${PRODUCTION_URL}/payment-failed`
    };

    const response = await fetch(`${PRODUCTION_URL}/api/xendit/create-direct-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Create Invoice API - Status:', response.status);
      console.log('🧾 Invoice ID:', data.id);
      console.log('💰 Amount:', data.amount);
      console.log('🔗 Payment URL:', data.invoice_url ? 'Available' : 'Not provided');
      console.log('📅 Expires:', data.expiry_date || 'Not specified');
    } else {
      const errorData = await response.text();
      console.log('❌ Create Invoice API failed:', response.status);
      console.log('📄 Error details:', errorData);
    }
  } catch (error) {
    console.log('❌ Create Invoice API error:', error.message);
  }

  // Test 3: Frontend Health Check
  console.log('\n3️⃣ Testing Frontend Health...');
  try {
    const response = await fetch(PRODUCTION_URL);
    if (response.ok) {
      console.log('✅ Frontend - Status:', response.status);
      console.log('📋 Content-Type:', response.headers.get('content-type'));
      console.log('🔄 Cache-Control:', response.headers.get('cache-control') || 'No cache headers');
    } else {
      console.log('❌ Frontend failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend error:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📋 PRODUCTION TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log('🌐 Website: https://www.jbalwikobra.com');
  console.log('⏰ Tested at:', new Date().toLocaleString());
  console.log('💡 Next steps:');
  console.log('   1. Open website in incognito/private browser');
  console.log('   2. Try purchasing a product');
  console.log('   3. Check if "Mode Offline" still appears');
  console.log('   4. If still appears, try hard refresh (Ctrl+F5)');
}

testProductionAPIs().catch(console.error);* Production Purchase Flow Test
 * Tests the complete purchase flow on www.jbalwikobra.com
 */

const PRODUCTION_URL = 'https://www.jbalwikobra.com';
const TEST_AMOUNT = 25000;

async function testProductionPurchaseFlow() {
  console.log('🚀 Production Purchase Flow Test');
  console.log('🌐 Testing URL:', PRODUCTION_URL);
  console.log('💰 Test Amount: Rp', TEST_AMOUNT.toLocaleString('id-ID'));
  console.log('=' .repeat(60));

  const results = {
    paymentMethods: null,
    createInvoice: null,
    products: null,
    timestamp: new Date().toISOString()
  };

  // Test 1: Payment Methods API (should show xendit_api source, not fallback)
  console.log('\n💳 Testing Payment Methods API...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/xendit/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: TEST_AMOUNT })
    });

    console.log(`📊 Payment Methods Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      results.paymentMethods = { success: true, data };
      
      console.log('✅ Payment Methods API working');
      console.log('📡 Source:', data.source);
      console.log('🎯 Methods Count:', data.payment_methods?.length || 0);
      
      // Check for specific methods
      const methods = data.payment_methods || [];
      const qris = methods.find(m => m.id === 'qris');
      const ovo = methods.find(m => m.id === 'ovo');
      const bca = methods.find(m => m.id === 'bca');
      
      console.log('📱 QRIS Available:', !!qris);
      console.log('💰 OVO Available:', !!ovo);
      console.log('🏦 BCA VA Available:', !!bca);
      
      if (data.source === 'xendit_api') {
        console.log('🎉 SUCCESS: No more "Mode Offline" - showing as online!');
      } else {
        console.log('⚠️  WARNING: Still showing as offline mode');
      }
    } else {
      console.error('❌ Payment Methods API failed');
      results.paymentMethods = { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ Payment Methods Error:', error.message);
    results.paymentMethods = { success: false, error: error.message };
  }

  // Test 2: Create Payment Invoice
  console.log('\n🧾 Testing Create Invoice API...');
  try {
    const invoiceResponse = await fetch(`${PRODUCTION_URL}/api/xendit/create-direct-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: TEST_AMOUNT,
        currency: 'IDR',
        payment_method_id: 'qris',
        customer: {
          given_names: 'Test User Production',
          email: 'test@jbalwikobra.com',
          mobile_number: '+628123456789'
        },
        description: 'Production Test Purchase',
        external_id: `test-prod-${Date.now()}`,
        success_redirect_url: `${PRODUCTION_URL}/payment-success`,
        failure_redirect_url: `${PRODUCTION_URL}/payment-failed`
      })
    });

    console.log(`📊 Create Invoice Status: ${invoiceResponse.status}`);
    
    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      results.createInvoice = { success: true, data: invoiceData };
      
      console.log('✅ Invoice Created Successfully! 🎯');
      console.log('🆔 Invoice ID:', invoiceData.id);
      console.log('💵 Amount:', invoiceData.amount);
      console.log('🔗 Payment URL:', invoiceData.invoice_url?.substring(0, 50) + '...');
      console.log('⏰ Status:', invoiceData.status);
    } else {
      const errorData = await invoiceResponse.text();
      console.error('❌ Create Invoice failed:', errorData);
      results.createInvoice = { success: false, status: invoiceResponse.status, error: errorData };
    }
  } catch (error) {
    console.error('❌ Create Invoice Error:', error.message);
    results.createInvoice = { success: false, error: error.message };
  }

  // Test 3: Products API
  console.log('\n📦 Testing Products API...');
  try {
    const productsResponse = await fetch(`${PRODUCTION_URL}/api/products?limit=3`);
    console.log(`📊 Products Status: ${productsResponse.status}`);
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      results.products = { success: true, count: productsData.length };
      console.log('✅ Products API working - found', productsData.length, 'products');
      
      if (productsData.length > 0) {
        const sample = productsData[0];
        console.log('📦 Sample Product:', {
          id: sample.id,
          name: sample.name,
          price: sample.price,
          tier: sample.tier
        });
      }
    } else {
      console.error('❌ Products API failed');
      results.products = { success: false, status: productsResponse.status };
    }
  } catch (error) {
    console.error('❌ Products Error:', error.message);
    results.products = { success: false, error: error.message };
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 PRODUCTION PURCHASE FLOW TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('💳 Payment Methods:', results.paymentMethods?.success ? '✅ WORKING' : '❌ FAILED');
  console.log('🧾 Create Invoice:', results.createInvoice?.success ? '✅ WORKING' : '❌ FAILED');
  console.log('📦 Products API:', results.products?.success ? '✅ WORKING' : '❌ FAILED');
  
  const allWorking = results.paymentMethods?.success && 
                    results.createInvoice?.success && 
                    results.products?.success;
  
  console.log('\n🎯 Overall Status:', allWorking ? '✅ ALL SYSTEMS GO!' : '⚠️ SOME ISSUES DETECTED');
  
  if (allWorking) {
    console.log('🎉 Production purchase flow is fully operational!');
    console.log('🌐 Users can successfully make purchases on www.jbalwikobra.com');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. 🖥️ Test frontend UI manually on www.jbalwikobra.com');
  console.log('2. 🛒 Try opening checkout modal to verify no "Mode Offline"');
  console.log('3. 📱 Test different payment methods (QRIS, Virtual Account, E-wallet)');
  console.log('4. 💰 Test with different product amounts');

  return results;
}

// Run the production test
testProductionPurchaseFlow().catch(console.error);
