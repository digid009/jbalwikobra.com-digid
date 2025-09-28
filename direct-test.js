const fetch = require('node-fetch');

// Direct test of the specific payment that was just created
const paymentId = '68d92299278fb8951416dabf';
const externalId = 'test-payment-1759060590371';

async function testDirectFixes() {
  console.log('🎯 DIRECT PAYMENT TEST');
  console.log('======================');
  console.log('Payment ID:', paymentId);
  console.log('External ID:', externalId);
  console.log('Expected Account Number: 13282301899730536');
  console.log('');

  try {
    // Test get-payment API
    console.log('1️⃣ Testing get-payment API...');
    const response = await fetch(`https://www.jbalwikobra.com/api/xendit/get-payment?id=${paymentId}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response received');
      console.log('📋 Payment Method:', data.payment_method);
      console.log('📋 Account Number:', data.account_number || 'MISSING');
      console.log('📋 Bank Code:', data.bank_code || 'MISSING');
      console.log('📋 Full Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ API Error:', response.status);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testDirectFixes();