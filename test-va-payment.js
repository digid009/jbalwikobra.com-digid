const fetch = require('node-fetch');

// Test configuration - Use production to test deployed changes
const PRODUCTION_URL = 'https://www.jbalwikobra.com';
const TEST_PAYMENT_DATA = {
  external_id: `test-payment-${Date.now()}`,
  amount: 50000,
  currency: 'IDR',
  payment_method_id: 'bri', // BRI Virtual Account (supports descriptions)
  description: 'Test VA Payment',
  customer: {
    given_names: 'Test User',
    email: 'test@example.com',
    mobile_number: '+6281234567890'
  },
  order: {
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '+6281234567890',
    product_name: 'Test Product',
    product_id: 'test-product-001',
    order_type: 'purchase',
    amount: 50000
  }
};

async function testVAPayment() {
  try {
    console.log('🧪 Testing VA Payment Creation in Production...');
    console.log('🔗 Production URL:', PRODUCTION_URL);
    console.log('💰 Test Amount:', TEST_PAYMENT_DATA.amount);
    console.log('🏦 Payment Method:', TEST_PAYMENT_DATA.payment_method_id);
    console.log('');

    const response = await fetch(`${PRODUCTION_URL}/api/xendit/create-direct-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_PAYMENT_DATA)
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Payment Creation Failed:');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      return;
    }

    const paymentData = await response.json();
    
    console.log('✅ Payment Created Successfully!');
    console.log('');
    console.log('🔍 FULL RAW RESPONSE FOR DEBUG:');
    console.log(JSON.stringify(paymentData, null, 2));
    console.log('');
    console.log('🔍 PAYMENT RESPONSE ANALYSIS:');
    console.log('================================');
    console.log('Payment ID:', paymentData.id);
    console.log('External ID:', paymentData.external_id);
    console.log('Status:', paymentData.status);
    console.log('Amount:', paymentData.amount);
    console.log('Currency:', paymentData.currency);
    console.log('Payment Method:', paymentData.payment_method);
    console.log('');
    
    console.log('🏦 VIRTUAL ACCOUNT DETAILS:');
    console.log('============================');
    console.log('VA Number (virtual_account_number):', paymentData.virtual_account_number || '❌ MISSING');
    console.log('Account Number (account_number):', paymentData.account_number || '❌ MISSING');
    console.log('Bank Code:', paymentData.bank_code || '❌ MISSING');
    console.log('Bank Name:', paymentData.bank_name || '❌ MISSING');
    console.log('Account Holder:', paymentData.account_holder_name || '❌ MISSING');
    console.log('Transfer Amount:', paymentData.transfer_amount || '❌ MISSING');
    console.log('Fixed VA ID:', paymentData.fixed_va_id || '❌ MISSING');
    console.log('');

    console.log('🔗 PAYMENT URLS:');
    console.log('================');
    console.log('Invoice URL:', paymentData.invoice_url || '❌ MISSING');
    console.log('Payment URL:', paymentData.payment_url || '❌ MISSING');
    console.log('');

    console.log('⏰ EXPIRY INFO:');
    console.log('===============');
    console.log('Expiry Date:', paymentData.expiry_date || '❌ MISSING');
    console.log('');

    // Test the payment interface URL
    if (paymentData.id) {
      const paymentInterfaceUrl = `${PRODUCTION_URL}/payment?id=${paymentData.id}&method=${TEST_PAYMENT_DATA.payment_method_id}&amount=${TEST_PAYMENT_DATA.amount}&external_id=${paymentData.external_id}&description=${encodeURIComponent(TEST_PAYMENT_DATA.description)}`;
      console.log('🖥️  PAYMENT INTERFACE URL:');
      console.log('==========================');
      console.log(paymentInterfaceUrl);
      console.log('');
    }

    // Summary
    console.log('📋 TEST SUMMARY:');
    console.log('================');
    const hasVANumber = !!(paymentData.virtual_account_number || paymentData.account_number);
    const hasBankCode = !!paymentData.bank_code;
    const hasInvoiceUrl = !!paymentData.invoice_url;
    
    console.log('✅ Payment Created:', !!paymentData.id);
    console.log(hasVANumber ? '✅' : '❌', 'VA Number Present:', hasVANumber);
    console.log(hasBankCode ? '✅' : '❌', 'Bank Code Present:', hasBankCode);
    console.log(hasInvoiceUrl ? '✅' : '❌', 'Invoice URL Present:', hasInvoiceUrl);
    
    // Debug: Show all VA-related fields
    console.log('');
    console.log('🔍 ALL VA FIELDS DEBUG:');
    console.log('virtual_account_number:', paymentData.virtual_account_number);
    console.log('account_number:', paymentData.account_number);
    console.log('bank_code:', paymentData.bank_code);
    console.log('bank_name:', paymentData.bank_name);
    console.log('');

    if (hasVANumber && hasBankCode) {
      console.log('🎉 SUCCESS: Virtual Account details are properly returned!');
      console.log('👀 You can now test the payment page to see if VA is displayed.');
    } else {
      console.log('⚠️  WARNING: Virtual Account details are missing!');
      console.log('🔧 Check the server logs for debugging information.');
    }

    // Return the payment data for further testing
    return paymentData;

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test the get-payment API as well
async function testGetPayment(paymentId) {
  try {
    console.log('');
    console.log('🔄 Testing Get Payment API...');
    console.log('🔍 Looking for payment ID:', paymentId);
    
    const response = await fetch(`${PRODUCTION_URL}/api/xendit/get-payment?id=${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get Payment Failed (Status:', response.status, '):', errorText);
      return;
    }

    const paymentData = await response.json();
    
    console.log('✅ Get Payment Success!');
    console.log('🏦 Retrieved VA Number:', paymentData.virtual_account_number || paymentData.account_number || '❌ MISSING');
    console.log('🏦 Retrieved Bank Code:', paymentData.bank_code || '❌ MISSING');
    console.log('🔍 Data source: Found in', paymentData.order_id ? 'orders table' : 'payments table');
    
    console.log('');
    console.log('🔍 GET PAYMENT API FULL RESPONSE:');
    console.log(JSON.stringify(paymentData, null, 2));
    
    return paymentData;

  } catch (error) {
    console.error('❌ Get Payment Test Error:', error.message);
  }
}

// Run the test
async function runFullTest() {
  console.log('🚀 Starting Production VA Payment Test');
  console.log('======================================');
  console.log('');

  const paymentData = await testVAPayment();
  
  if (paymentData && paymentData.id) {
    await testGetPayment(paymentData.id);
  }

  console.log('');
  console.log('🏁 Test Complete!');
}

runFullTest();