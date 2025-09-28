const fetch = require('node-fetch');

async function testNewVAPayment() {
  const timestamp = Date.now();
  const external_id = `debug-va-${timestamp}`;
  
  console.log('🔧 NEW VA PAYMENT TEST WITH DEBUG');
  console.log('===================================');
  console.log('External ID:', external_id);
  console.log('');

  try {
    // Create a new VA payment to see storage debugging
    console.log('1️⃣ Creating new VA payment...');
    const createResponse = await fetch('https://www.jbalwikobra.com/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: 25000,
        currency: 'IDR',
        payment_method_id: 'bri',
        description: 'Debug VA Payment Test',
        customer: {
          given_names: 'Debug User',
          email: 'debug@test.com',
          mobile_number: '+628123456789'
        }
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Payment created successfully');
      console.log('📋 Payment ID:', createData.id);
      console.log('📋 Payment Method:', createData.payment_method);
      console.log('📋 Account Number:', createData.account_number || 'MISSING');
      console.log('📋 Bank Code:', createData.bank_code || 'MISSING');
      
      // Wait a moment then check if it was stored correctly
      console.log('\n2️⃣ Waiting 3 seconds then checking storage...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const getResponse = await fetch(`https://www.jbalwikobra.com/api/xendit/get-payment?id=${createData.id}`);
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('✅ Retrieved payment data');
        console.log('📋 Retrieved Payment Method:', getData.payment_method);
        console.log('📋 Retrieved Account Number:', getData.account_number || 'MISSING');
        console.log('📋 Retrieved Bank Code:', getData.bank_code || 'MISSING');
        
        if (getData.payment_method === 'bri' && getData.account_number) {
          console.log('🎉 SUCCESS: Storage and retrieval working!');
        } else {
          console.log('❌ ISSUE: Storage or retrieval failed');
          console.log('📋 Full response:', JSON.stringify(getData, null, 2));
        }
      } else {
        console.error('❌ Failed to retrieve payment:', getResponse.status);
      }
      
    } else {
      console.error('❌ Failed to create payment:', createResponse.status);
      const errorText = await createResponse.text();
      console.error('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testNewVAPayment();