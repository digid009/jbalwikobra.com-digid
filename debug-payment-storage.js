const fetch = require('node-fetch');

// Test getting payment directly from database via API
async function debugPaymentStorage() {
  const paymentId = '68d91d8b69b0eeb88833384c'; // Latest test payment ID
  
  console.log('🔍 Debug: Checking payment storage for:', paymentId);
  console.log('');
  
  try {
    // Test the get-payment API
    console.log('1️⃣ Testing get-payment API...');
    const response = await fetch(`https://www.jbalwikobra.com/api/xendit/get-payment?id=${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const paymentData = await response.json();
    
    console.log('✅ API Response received');
    console.log('📋 Full Response:');
    console.log(JSON.stringify(paymentData, null, 2));
    
    console.log('');
    console.log('🏦 VA-specific fields check:');
    console.log('- virtual_account_number:', paymentData.virtual_account_number || 'MISSING');
    console.log('- account_number:', paymentData.account_number || 'MISSING');
    console.log('- bank_code:', paymentData.bank_code || 'MISSING');
    console.log('- bank_name:', paymentData.bank_name || 'MISSING');
    console.log('- payment_method:', paymentData.payment_method || 'MISSING');
    
    console.log('');
    console.log('📊 Database location:', paymentData.order_id ? 'orders table' : 'payments table');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugPaymentStorage();