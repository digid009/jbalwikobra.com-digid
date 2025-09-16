/**
 * Local Payment Flow Testing Script
 * Tests the payment flow on localhost:3003
 */

const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3003',
  TEST_AMOUNT: 25000,
  TIMEOUT: 15000
};

async function testCreateInvoice() {
  console.log('🧪 Testing Create Invoice API on localhost...');
  
  const testPayload = {
    external_id: `test_payment_local_${new Date().getTime()}`,
    amount: TEST_CONFIG.TEST_AMOUNT,
    payer_email: 'test@localhost.com',
    description: 'Local test payment flow',
    success_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
    failure_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
    customer: {
      given_names: 'Local Test User',
      email: 'test@localhost.com',
      mobile_number: '+628123456789'
    },
    order: {
      customer_name: 'Local Test User',
      customer_email: 'test@localhost.com',
      customer_phone: '+628123456789',
      order_type: 'purchase',
      amount: TEST_CONFIG.TEST_AMOUNT,
      rental_duration: null
    }
  };

  try {
    console.log('📤 Sending request to:', `${TEST_CONFIG.BASE_URL}/api/xendit/create-invoice`);
    console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/xendit/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Local-Payment-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Invoice Created Successfully!');
        console.log('🎯 Invoice Data:', {
          id: data.id,
          invoice_url: data.invoice_url,
          status: data.status,
          amount: data.amount,
          currency: data.currency
        });
        return { success: true, data };
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError.message);
        return { success: false, error: 'Invalid JSON response', raw: responseText };
      }
    } else {
      console.error('❌ API Error - Status:', response.status);
      console.error('❌ Response:', responseText);
      return { success: false, error: responseText, status: response.status };
    }
  } catch (error) {
    console.error('❌ Network/Request Error:', error.message);
    return { success: false, error: error.message, type: 'network' };
  }
}

async function testProducts() {
  console.log('\n🧪 Testing Products API...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/products?limit=3`);
    console.log(`📊 Products API Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Products API working - found', data.length, 'products');
      if (data.length > 0) {
        console.log('📦 Sample product:', {
          id: data[0].id,
          name: data[0].name,
          price: data[0].price,
          tier: data[0].tier
        });
      }
      return { success: true, data };
    } else {
      console.error('❌ Products API failed');
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ Products API Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runLocalPaymentTests() {
  console.log('🚀 Local Payment Flow Test Started');
  console.log('🌐 Testing Environment:', TEST_CONFIG.BASE_URL);
  console.log('💰 Test Amount: Rp', TEST_CONFIG.TEST_AMOUNT.toLocaleString('id-ID'));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('=' .repeat(60));

  const results = {
    products: null,
    createInvoice: null,
    timestamp: new Date().toISOString()
  };

  // Test 1: Products API (Supabase connection)
  results.products = await testProducts();

  // Test 2: Create Invoice API
  results.createInvoice = await testCreateInvoice();

  console.log('\n' + '=' .repeat(60));
  console.log('📊 LOCAL PAYMENT FLOW TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('📦 Products API:', results.products?.success ? '✅ WORKING' : '❌ FAILED');
  console.log('🧾 Create Invoice API:', results.createInvoice?.success ? '✅ WORKING' : '❌ FAILED');

  console.log('\n🔍 ANALYSIS:');
  
  if (results.products?.success) {
    console.log('✅ Database connection and products API working');
  } else {
    console.log('❌ Database connection failed - check .env file');
  }
  
  if (results.createInvoice?.success) {
    console.log('✅ Payment creation API working!');
    if (results.createInvoice?.data?.invoice_url) {
      console.log('🔗 Test Invoice URL:', results.createInvoice.data.invoice_url);
    }
  } else {
    console.log('❌ Payment creation failed');
    console.log('💡 Note: This might be normal for localhost testing');
    console.log('   - Xendit API might not be fully configured for localhost');
    console.log('   - API routes might not exist in CRA dev server');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Test the frontend checkout modal manually');
  console.log('2. Try purchasing a product through the UI');
  console.log('3. Check browser console for any JavaScript errors');
  console.log('4. Test flash sale products vs regular products');

  return results;
}

// Run the tests
runLocalPaymentTests().catch(console.error);
