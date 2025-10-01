const fetch = require('node-fetch');

// All activated payment methods from Xendit dashboard
const ACTIVATED_PAYMENT_METHODS = [
  { id: 'astrapay', name: 'AstraPay', type: 'EWALLET' },
  { id: 'qris', name: 'QRIS', type: 'QRIS' },
  { id: 'bjb', name: 'BJB Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'bni', name: 'BNI Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'bri', name: 'BRI Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'bsi', name: 'BSI Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'cimb', name: 'CIMB Niaga Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'permata', name: 'Permata Virtual Account', type: 'VIRTUAL_ACCOUNT' },
  { id: 'indomaret', name: 'Indomaret', type: 'OVER_THE_COUNTER' },
  { id: 'akulaku', name: 'Akulaku', type: 'PAYLATER' }
];

async function testPaymentMethod(method) {
  const timestamp = Date.now();
  const external_id = `test-${method.id}-${timestamp}`;
  
  console.log(`\n🧪 Testing ${method.name} (${method.id})`);
  console.log('='.repeat(50));
  console.log('External ID:', external_id);
  console.log('Payment Type:', method.type);
  
  try {
    const createResponse = await fetch('https://www.jbalwikobra.com/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: 50000,
        currency: 'IDR',
        payment_method_id: method.id,
        description: `Test ${method.name} Payment`,
        customer: {
          given_names: 'Test Customer',
          email: `${method.id}@test.com`,
          mobile_number: '+628123456789'
        }
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Payment Created Successfully!');
      console.log('📋 Payment ID:', createData.id);
      console.log('📋 Payment Method:', createData.payment_method);
      console.log('📋 Status:', createData.status);
      
      // Type-specific validations
      if (method.type === 'VIRTUAL_ACCOUNT') {
        const hasVA = !!(createData.account_number || createData.virtual_account_number);
        const hasBankCode = !!createData.bank_code;
        console.log('📋 VA Number:', hasVA ? 'Present' : '❌ MISSING');
        console.log('📋 Bank Code:', hasBankCode ? createData.bank_code : '❌ MISSING');
        
        if (hasVA && hasBankCode) {
          console.log('🎉 SUCCESS: VA payment with all details!');
          return { success: true, method: method.id, details: 'VA created successfully' };
        } else {
          console.log('⚠️ ISSUE: Missing VA details');
          return { success: false, method: method.id, error: 'Missing VA details' };
        }
      } 
      else if (method.type === 'QRIS') {
        const hasQR = !!createData.qr_string;
        console.log('📋 QR String:', hasQR ? 'Present' : '❌ MISSING');
        
        if (hasQR) {
          console.log('🎉 SUCCESS: QRIS payment with QR code!');
          return { success: true, method: method.id, details: 'QR code generated' };
        } else {
          console.log('⚠️ ISSUE: Missing QR string');
          return { success: false, method: method.id, error: 'Missing QR string' };
        }
      }
      else if (method.type === 'EWALLET') {
        const hasPaymentUrl = !!createData.payment_url;
        console.log('📋 Payment URL:', hasPaymentUrl ? 'Present' : '❌ MISSING');
        
        if (hasPaymentUrl) {
          console.log('🎉 SUCCESS: E-wallet payment with redirect URL!');
          return { success: true, method: method.id, details: 'Payment URL available' };
        } else {
          console.log('⚠️ ISSUE: Missing payment URL');
          return { success: false, method: method.id, error: 'Missing payment URL' };
        }
      }
      else {
        // Generic success for other types
        console.log('🎉 SUCCESS: Payment created!');
        return { success: true, method: method.id, details: 'Payment created successfully' };
      }
      
    } else {
      const errorText = await createResponse.text();
      console.error('❌ Payment Creation Failed:', createResponse.status);
      console.error('Error details:', errorText);
      
      // Check for specific error types
      if (errorText.includes('DESCRIPTION_NOT_SUPPORTED_ERROR')) {
        console.error('💥 CRITICAL: Description field error - fix needed!');
        return { success: false, method: method.id, error: 'Description not supported' };
      } else if (errorText.includes('CHANNEL_CODE_NOT_SUPPORTED')) {
        console.error('💥 CRITICAL: Channel not activated on account!');
        return { success: false, method: method.id, error: 'Channel not activated' };
      } else {
        return { success: false, method: method.id, error: errorText.substring(0, 100) };
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    return { success: false, method: method.id, error: error.message };
  }
}

async function testAllPaymentMethods() {
  console.log('🚀 COMPREHENSIVE PAYMENT METHOD TEST');
  console.log('=====================================');
  console.log('Testing all 11 activated payment methods from Xendit dashboard');
  console.log('');
  
  const results = [];
  
  // Test each payment method
  for (const method of ACTIVATED_PAYMENT_METHODS) {
    const result = await testPaymentMethod(method);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log('');
  
  if (successful.length > 0) {
    console.log('✅ WORKING PAYMENT METHODS:');
    successful.forEach(r => {
      console.log(`   • ${r.method} - ${r.details}`);
    });
    console.log('');
  }
  
  if (failed.length > 0) {
    console.log('❌ FAILED PAYMENT METHODS:');
    failed.forEach(r => {
      console.log(`   • ${r.method} - ${r.error}`);
    });
    console.log('');
  }
  
  if (successful.length === results.length) {
    console.log('🎉 ALL PAYMENT METHODS WORKING CORRECTLY!');
  } else {
    console.log('⚠️ Some payment methods need attention.');
  }
}

// Run the comprehensive test
testAllPaymentMethods();