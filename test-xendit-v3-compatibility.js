/**
 * Xendit V3 API Support Investigation
 * This script tests which payment methods actually support V3 Payment Requests API
 */

const testPaymentMethods = [
  // QRIS - Known to work with V3
  { id: 'qris', channel_code: 'QRIS', type: 'QRIS', expected_v3: true },
  
  // E-Wallets - Likely V3 supported
  { id: 'astrapay', channel_code: 'ASTRAPAY', type: 'EWALLET', expected_v3: true },
  { id: 'ovo', channel_code: 'ID_OVO', type: 'EWALLET', expected_v3: true },
  { id: 'dana', channel_code: 'ID_DANA', type: 'EWALLET', expected_v3: true },
  { id: 'shopeepay', channel_code: 'ID_SHOPEEPAY', type: 'EWALLET', expected_v3: true },
  { id: 'linkaja', channel_code: 'ID_LINKAJA', type: 'EWALLET', expected_v3: true },
  { id: 'gopay', channel_code: 'GOPAY', type: 'EWALLET', expected_v3: true },
  
  // Virtual Accounts - Known to have issues with V3
  { id: 'bri', channel_code: 'BRI', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'bni', channel_code: 'BNI', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'mandiri', channel_code: 'MANDIRI', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'bsi', channel_code: 'BSI', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'permata', channel_code: 'PERMATA', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'bca', channel_code: 'BCA', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'cimb', channel_code: 'CIMB', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  { id: 'bjb', channel_code: 'BJB', type: 'VIRTUAL_ACCOUNT', expected_v3: false },
  
  // Over-the-Counter - Likely requires V2
  { id: 'indomaret', channel_code: 'INDOMARET', type: 'OVER_THE_COUNTER', expected_v3: false },
  { id: 'alfamart', channel_code: 'ALFAMART', type: 'OVER_THE_COUNTER', expected_v3: false },
  
  // Credit Card - Uncertain
  { id: 'credit_card', channel_code: 'CREDIT_CARD', type: 'CREDIT_CARD', expected_v3: null }
];

async function testV3ApiSupport() {
  console.log('🔍 Testing Xendit V3 API Support for Payment Methods\n');
  console.log('This test will help determine the best migration strategy.\n');
  
  const results = {
    v3_supported: [],
    v3_not_supported: [],
    errors: []
  };
  
  for (const method of testPaymentMethods) {
    console.log(`🧪 Testing ${method.id} (${method.channel_code})...`);
    
    try {
      // Test payload for V3 API
      const v3Payload = {
        reference_id: `test_v3_${method.id}_${Date.now()}`,
        type: "PAY",
        country: "ID",
        currency: "IDR",
        request_amount: 100000, // 100k IDR test amount
        capture_method: "AUTOMATIC",
        channel_code: method.channel_code,
        channel_properties: {
          success_return_url: "https://www.jbalwikobra.com/payment-status?status=success",
          failure_return_url: "https://www.jbalwikobra.com/payment-status?status=failed"
        },
        description: `V3 API Test for ${method.id}`,
        metadata: {
          test_purpose: "v3_api_compatibility_check",
          payment_method: method.id,
          channel_type: method.type
        }
      };
      
      // Make test request to your API
      const response = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100000,
          payment_method_id: method.id,
          external_id: `test_v3_${method.id}_${Date.now()}`,
          description: `V3 API Test for ${method.id}`,
          order: {
            customer_name: "V3 Test Customer",
            customer_email: "test@jbalwikobra.com",
            customer_phone: "6281234567890",
            product_name: "V3 API Test Product",
            order_type: "purchase"
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`  ✅ ${method.id}: SUCCESS`);
        console.log(`  📊 Status: ${data.status}`);
        console.log(`  🔗 API Used: ${data.debug_info?.api_endpoint || 'Unknown'}`);
        console.log(`  📝 Version: ${data.debug_info?.api_version || 'Unknown'}`);
        
        // Determine which API was actually used
        const apiEndpoint = data.debug_info?.api_endpoint || '';
        const isV3 = apiEndpoint.includes('/v3/');
        const isV2 = apiEndpoint.includes('/v2/');
        
        results.v3_supported.push({
          ...method,
          actual_api: isV3 ? 'V3' : (isV2 ? 'V2' : 'Unknown'),
          matches_expectation: isV3 === method.expected_v3,
          response_summary: {
            status: data.status,
            has_actions: !!data.actions,
            has_payment_url: !!data.payment_url,
            has_account_number: !!data.account_number
          }
        });
        
      } else {
        console.log(`  ❌ ${method.id}: FAILED`);
        console.log(`  💥 Error: ${data.error}`);
        console.log(`  🔍 Details: ${JSON.stringify(data.details, null, 2)}`);
        
        // Check if error indicates V3 incompatibility
        const errorMsg = (data.error || '').toLowerCase();
        const isV3Error = errorMsg.includes('not supported') || errorMsg.includes('channel code');
        
        results.v3_not_supported.push({
          ...method,
          error: data.error,
          likely_v3_issue: isV3Error,
          needs_v2: isV3Error && method.type === 'VIRTUAL_ACCOUNT'
        });
      }
      
    } catch (error) {
      console.log(`  💥 ${method.id}: EXCEPTION - ${error.message}`);
      results.errors.push({
        ...method,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate final report
  console.log('\n📋 === V3 API COMPATIBILITY REPORT ===\n');
  
  console.log('✅ **CONFIRMED V3 SUPPORTED:**');
  const actualV3Supported = results.v3_supported.filter(r => r.actual_api === 'V3');
  if (actualV3Supported.length === 0) {
    console.log('   None confirmed');
  } else {
    actualV3Supported.forEach(method => {
      console.log(`   • ${method.id} (${method.channel_code}) - ${method.type}`);
    });
  }
  
  console.log('\n📋 **REQUIRES V2 API:**');
  const needsV2 = results.v3_supported.filter(r => r.actual_api === 'V2');
  if (needsV2.length === 0) {
    console.log('   None identified');
  } else {
    needsV2.forEach(method => {
      console.log(`   • ${method.id} (${method.channel_code}) - ${method.type}`);
    });
  }
  
  console.log('\n❌ **FAILED METHODS:**');
  if (results.v3_not_supported.length === 0) {
    console.log('   None failed');
  } else {
    results.v3_not_supported.forEach(method => {
      console.log(`   • ${method.id} (${method.channel_code}) - ${method.error}`);
    });
  }
  
  console.log('\n🎯 **MIGRATION RECOMMENDATIONS:**');
  
  if (actualV3Supported.length > 0) {
    console.log('✅ Safe to migrate to V3:');
    actualV3Supported.forEach(method => {
      console.log(`   - ${method.id} (${method.type})`);
    });
  }
  
  if (needsV2.length > 0) {
    console.log('⚠️  Keep on V2 API:');
    needsV2.forEach(method => {
      console.log(`   - ${method.id} (${method.type})`);
    });
  }
  
  const failedVAMethods = results.v3_not_supported.filter(m => m.type === 'VIRTUAL_ACCOUNT');
  if (failedVAMethods.length > 0) {
    console.log('🚨 Virtual Accounts confirmed to need V2 API');
  }
  
  console.log('\n💡 **RECOMMENDED STRATEGY:**');
  console.log('   Use smart hybrid approach - V3 for supported methods, V2 for legacy methods');
  
  return results;
}

// Auto-run the test if in browser
if (typeof window !== 'undefined') {
  console.log('🎯 V3 API Compatibility Test Starting...\n');
  testV3ApiSupport()
    .then((results) => {
      console.log('\n✨ V3 compatibility test completed!');
      console.log('📊 Results available in browser console.');
      
      // Store results globally for inspection
      window.xenditV3TestResults = results;
      console.log('📝 Access detailed results via: window.xenditV3TestResults');
    })
    .catch((error) => {
      console.error('\n💥 V3 compatibility test failed:', error);
    });
}

export default testV3ApiSupport;
