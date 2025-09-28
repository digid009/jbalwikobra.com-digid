const fetch = require('node-fetch');

async function testWithCacheBust() {
  const timestamp = Date.now();
  const paymentId = '68d92299278fb8951416dabf';
  
  console.log('🎯 CACHE-BUSTED TEST');
  console.log('====================');
  console.log('Timestamp:', timestamp);
  
  try {
    const response = await fetch(`https://www.jbalwikobra.com/api/xendit/get-payment?id=${paymentId}&_t=${timestamp}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response received');
      console.log('📋 Payment Method:', data.payment_method);
      console.log('📋 Account Number:', data.account_number || 'MISSING');
      console.log('📋 Bank Code:', data.bank_code || 'MISSING');
      
      if (data.account_number === '13282301899730536') {
        console.log('🎉 SUCCESS: VA data is now visible!');
      } else {
        console.log('❌ HOTFIX not working yet');
      }
    } else {
      console.error('❌ API Error:', response.status);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testWithCacheBust();