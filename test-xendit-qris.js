// Simple test to see what Xendit returns for QRIS payments
const testXenditQRIS = async () => {
  console.log('🧪 TESTING XENDIT QRIS API DIRECTLY');
  console.log('=====================================');

  const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
  if (!XENDIT_SECRET_KEY) {
    console.error('❌ XENDIT_SECRET_KEY not found');
    return;
  }

  const testPayload = {
    reference_id: `test-qris-${Date.now()}`,
    type: "PAY",
    country: "ID", 
    currency: "IDR",
    request_amount: 50000,
    capture_method: "AUTOMATIC",
    channel_code: "QRIS",
    channel_properties: {
      success_return_url: "https://jbalwikobra.com/success",
      failure_return_url: "https://jbalwikobra.com/failed"
    },
    description: "Test QRIS Payment",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    console.log('📤 Sending request to Xendit V3 API...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('https://api.xendit.co/v3/payment_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Response status:', response.status);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Xendit responded with:');
      console.log('Payment ID:', result.id);
      console.log('Status:', result.status);
      console.log('Actions:', result.actions ? result.actions.length : 0);
      
      if (result.actions && result.actions.length > 0) {
        console.log('\n🎯 ACTIONS DETAILS:');
        result.actions.forEach((action, index) => {
          console.log(`Action ${index + 1}:`, {
            type: action.type,
            has_value: !!action.value,
            value_length: action.value ? action.value.length : 0,
            value_preview: action.value ? action.value.substring(0, 100) + '...' : 'NO VALUE'
          });
        });
        
        const presentAction = result.actions.find(a => a.type === 'PRESENT_TO_CUSTOMER');
        if (presentAction) {
          console.log('\n✅ PRESENT_TO_CUSTOMER action found!');
          console.log('QR String length:', presentAction.value ? presentAction.value.length : 0);
          console.log('QR String starts with:', presentAction.value ? presentAction.value.substring(0, 50) : 'NO VALUE');
        } else {
          console.log('\n❌ No PRESENT_TO_CUSTOMER action found');
        }
      } else {
        console.log('❌ No actions in response');
      }
      
      console.log('\n📋 FULL RESPONSE:');
      console.log(JSON.stringify(result, null, 2));
      
    } else {
      console.log('❌ ERROR! Xendit responded with error:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Run the test
testXenditQRIS();