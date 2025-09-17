/**
 * Test Xendit Payment Methods API directly
 */

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

async function testXenditAPI() {
  console.log('🔑 Testing Xendit Payment Methods API...');
  console.log('Key present:', !!XENDIT_SECRET_KEY);
  
  if (!XENDIT_SECRET_KEY) {
    console.error('❌ XENDIT_SECRET_KEY not set in environment');
    return;
  }

  try {
    const auth = Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64');
    
    const response = await fetch('https://api.xendit.co/payment_methods', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response Body:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Parsed JSON:', data);
        console.log('📦 Payment Methods Count:', data.data?.length || 0);
      } catch (e) {
        console.log('⚠️ Valid response but not JSON:', responseText);
      }
    } else {
      console.log('❌ API call failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testXenditAPI();
