/**
 * Payment Flow Testing Script
 * Tests the complete payment flow to identify production issues
 */

const TEST_CONFIG = {
  BASE_URL: 'https://jbalwikobra.com',
  // BASE_URL: 'http://localhost:3000', // Uncomment for local testing
  TEST_AMOUNT: 25000,
  TIMEOUT: 15000
};

async function testCreateInvoice() {
  console.log('🧪 Testing Create Invoice API...');
  
  const testPayload = {
    external_id: `test_payment_${new Date().getTime()}`,
    amount: TEST_CONFIG.TEST_AMOUNT,
    payer_email: 'test@jbalwikobra.com',
    description: 'Test payment flow - Production diagnostic',
    success_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
    failure_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
    customer: {
      given_names: 'Test User Production',
      email: 'test@jbalwikobra.com',
      mobile_number: '+628123456789'
    },
    order: {
      customer_name: 'Test User Production',
      customer_email: 'test@jbalwikobra.com',
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
        'User-Agent': 'Payment-Flow-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

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
          currency: data.currency,
          expires_at: data.expiry_date
        });
        return { success: true, data };
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError.message);
        return { success: false, error: 'Invalid JSON response', raw: responseText };
      }
    } else {
      try {
        const errorData = JSON.parse(responseText);
        console.error('❌ API Error:', errorData);
        return { success: false, error: errorData, status: response.status };
      } catch (parseError) {
        console.error('❌ Raw Error Response:', responseText);
        return { success: false, error: responseText, status: response.status };
      }
    }
  } catch (error) {
    console.error('❌ Network/Request Error:', error.message);
    return { success: false, error: error.message, type: 'network' };
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing Webhook Endpoint...');
  
  // Create a mock webhook payload similar to what Xendit sends
  const mockWebhookPayload = {
    id: 'test_invoice_12345',
    external_id: `test_webhook_${new Date().getTime()}`,
    status: 'PAID',
    amount: TEST_CONFIG.TEST_AMOUNT,
    paid_at: new Date().toISOString(),
    payment_channel: 'BANK_TRANSFER',
    payer_email: 'test@jbalwikobra.com',
    currency: 'IDR',
    metadata: {
      client_external_id: `test_webhook_${new Date().getTime()}`,
      customer_name: 'Test User Webhook',
      customer_email: 'test@jbalwikobra.com',
      amount: TEST_CONFIG.TEST_AMOUNT
    }
  };

  try {
    console.log('📤 Sending webhook test to:', `${TEST_CONFIG.BASE_URL}/api/xendit/webhook`);
    console.log('📦 Mock Payload:', JSON.stringify(mockWebhookPayload, null, 2));

    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/xendit/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Token': 'test-token', // This might fail auth, but we can see the response
        'User-Agent': 'Xendit-Test/1.0'
      },
      body: JSON.stringify(mockWebhookPayload)
    });

    console.log(`📊 Webhook Response Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log('📄 Webhook Response:', responseText);

    if (response.status === 401) {
      console.log('ℹ️  401 is expected - webhook token validation working');
      return { success: true, note: 'Token validation working' };
    }

    return { success: response.ok, status: response.status, response: responseText };
  } catch (error) {
    console.error('❌ Webhook Test Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testSupabaseConnection() {
  console.log('\n🧪 Testing Database Connection...');
  
  try {
    // Test a simple endpoint that uses Supabase (like getting products)
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/products?limit=1`);
    console.log(`📊 Database Test Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Database connection working');
      return { success: true };
    } else {
      console.error('❌ Database connection issue');
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ Database Test Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runPaymentFlowTests() {
  console.log('🚀 Payment Flow Diagnostic Test Started');
  console.log('🌐 Testing Environment:', TEST_CONFIG.BASE_URL);
  console.log('💰 Test Amount: Rp', TEST_CONFIG.TEST_AMOUNT.toLocaleString('id-ID'));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('=' .repeat(60));

  const results = {
    createInvoice: null,
    webhook: null,
    database: null,
    timestamp: new Date().toISOString()
  };

  // Test 1: Database Connection
  results.database = await testSupabaseConnection();

  // Test 2: Create Invoice API
  results.createInvoice = await testCreateInvoice();

  // Test 3: Webhook Endpoint
  results.webhook = await testWebhookEndpoint();

  console.log('\n' + '=' .repeat(60));
  console.log('📊 PAYMENT FLOW TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('💾 Database Connection:', results.database?.success ? '✅ WORKING' : '❌ FAILED');
  console.log('🧾 Create Invoice API:', results.createInvoice?.success ? '✅ WORKING' : '❌ FAILED');
  console.log('🔗 Webhook Endpoint:', results.webhook?.success ? '✅ WORKING' : '❌ FAILED');

  console.log('\n🔍 DETAILED ANALYSIS:');
  
  if (!results.database?.success) {
    console.log('❌ Database connection failed - check SUPABASE_URL and keys');
  }
  
  if (!results.createInvoice?.success) {
    console.log('❌ Invoice creation failed - likely causes:');
    console.log('   • Missing XENDIT_SECRET_KEY environment variable');
    console.log('   • Invalid Xendit API key or expired key');
    console.log('   • Supabase connection issues in invoice creation');
    console.log('   • Server timeout or resource limits');
    if (results.createInvoice?.error) {
      console.log('   • Error details:', results.createInvoice.error);
    }
  }
  
  if (!results.webhook?.success && results.webhook?.status !== 401) {
    console.log('❌ Webhook endpoint issues - check XENDIT_CALLBACK_TOKEN');
  }

  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!results.createInvoice?.success) {
    console.log('1. Check Vercel environment variables are properly set');
    console.log('2. Verify XENDIT_SECRET_KEY is valid and not expired');
    console.log('3. Test with a smaller amount or different payload');
    console.log('4. Check Vercel function logs for detailed error messages');
    console.log('5. Ensure Supabase service role key has proper permissions');
  }

  if (results.createInvoice?.success) {
    console.log('✅ Payment flow appears to be working correctly!');
    if (results.createInvoice?.data?.invoice_url) {
      console.log('🔗 Test Invoice URL:', results.createInvoice.data.invoice_url);
      console.log('   You can manually test the payment by visiting this URL');
    }
  }

  return results;
}

// Run the tests
runPaymentFlowTests().catch(console.error);
