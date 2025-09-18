/**
 * Production Purchase Flow Test
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
