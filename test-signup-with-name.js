const https = require('https');

// Test signup with name field
async function testSignupWithName() {
  const postData = JSON.stringify({
    type: 'signup',
    phone: '+6282242417799', // Test phone number
    password: 'testpass123',
    name: 'Test User Name'
  });

  const options = {
    hostname: 'jbalwikobra-com-digid-l2346ulb6-digitalindo.vercel.app',
    port: 443,
    path: '/api/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('✅ Signup Response:', {
            status: res.statusCode,
            data: response
          });
          resolve(response);
        } catch (error) {
          console.log('Raw response body:', body);
          console.log('Response status:', res.statusCode);
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run test
testSignupWithName()
  .then(result => {
    console.log('\n📋 Test Summary:');
    if (result.success) {
      console.log('✅ Signup successful! Name field is working correctly.');
      console.log('✅ WhatsApp import error should be fixed.');
    } else {
      console.log('⚠️ Signup response:', result);
    }
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
  });
