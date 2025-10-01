const fetch = require('node-fetch');

async function testPermataPayment() {
  const timestamp = Date.now();
  const external_id = `test-permata-${timestamp}`;
  
  console.log('🧪 PERMATA VA TEST (Without Description)');
  console.log('=========================================');
  console.log('External ID:', external_id);
  console.log('Testing PERMATA without description field to fix API error');
  console.log('');

  try {
    // Test PERMATA VA payment (should work now without description error)
    console.log('1️⃣ Creating PERMATA VA payment...');
    const createResponse = await fetch('https://www.jbalwikobra.com/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: 75000,
        currency: 'IDR',
        payment_method_id: 'permata', // Testing PERMATA
        description: 'Test PERMATA VA Payment', // This should be filtered out for PERMATA
        customer: {
          given_names: 'Test Permata User',
          email: 'permata@test.com',
          mobile_number: '+628123456789'
        }
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ PERMATA Payment created successfully!');
      console.log('📋 Payment ID:', createData.id);
      console.log('📋 Payment Method:', createData.payment_method);
      console.log('📋 Account Number:', createData.account_number || 'MISSING');
      console.log('📋 Bank Code:', createData.bank_code || 'MISSING');
      console.log('📋 Status:', createData.status);
      
      if (createData.account_number && createData.bank_code === 'PERMATA_VIRTUAL_ACCOUNT') {
        console.log('🎉 SUCCESS: PERMATA VA created without description error!');
      } else {
        console.log('⚠️ Issue: Missing VA details');
      }
      
    } else {
      const errorText = await createResponse.text();
      console.error('❌ PERMATA Payment creation failed:', createResponse.status);
      console.error('Error details:', errorText);
      
      if (errorText.includes('DESCRIPTION_NOT_SUPPORTED_ERROR')) {
        console.error('💥 CRITICAL: Description error still present - fix not working!');
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

async function testQRISPayment() {
  const timestamp = Date.now();
  const external_id = `test-qris-${timestamp}`;
  
  console.log('\n🧪 QRIS PAYMENT TEST');
  console.log('====================');
  console.log('External ID:', external_id);
  console.log('Testing QRIS payment to ensure it works');
  console.log('');

  try {
    console.log('1️⃣ Creating QRIS payment...');
    const createResponse = await fetch('https://www.jbalwikobra.com/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: 50000,
        currency: 'IDR',
        payment_method_id: 'qris', // Testing QRIS
        description: 'Test QRIS Payment',
        customer: {
          given_names: 'Test QRIS User',
          email: 'qris@test.com',
          mobile_number: '+628123456789'
        }
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ QRIS Payment created successfully!');
      console.log('📋 Payment ID:', createData.id);
      console.log('📋 Payment Method:', createData.payment_method);
      console.log('📋 QR String:', createData.qr_string ? 'Present' : 'MISSING');
      console.log('📋 Status:', createData.status);
      
      if (createData.qr_string) {
        console.log('🎉 SUCCESS: QRIS payment with QR code!');
      } else {
        console.log('⚠️ Issue: Missing QR string');
      }
      
    } else {
      const errorText = await createResponse.text();
      console.error('❌ QRIS Payment creation failed:', createResponse.status);
      console.error('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run both tests
async function runTests() {
  await testPermataPayment();
  await testQRISPayment();
}

runTests();