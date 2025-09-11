// Test specific API endpoints with proper format
const fetch = require('node-fetch');

async function testApiEndpoints() {
  console.log('🔧 Testing API Endpoints with Proper Format');
  console.log('=' .repeat(50));

  const tests = [
    {
      name: 'Auth Health Check',
      method: 'GET',
      url: 'https://www.jbalwikobra.com/api/auth',
      query: '?action=health'
    },
    {
      name: 'Auth Health Check (POST)',
      method: 'POST',
      url: 'https://www.jbalwikobra.com/api/auth',
      body: { action: 'health' }
    },
    {
      name: 'Admin Get Products',
      method: 'POST', 
      url: 'https://www.jbalwikobra.com/api/admin',
      body: { action: 'get-products' }
    },
    {
      name: 'Admin Get Products (GET)',
      method: 'GET',
      url: 'https://www.jbalwikobra.com/api/admin',
      query: '?action=get-products'
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`📍 Method: ${test.method}`);
    console.log(`📍 URL: ${test.url}${test.query || ''}`);

    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
        console.log(`📦 Body: ${JSON.stringify(test.body)}`);
      }

      const response = await fetch(test.url + (test.query || ''), options);
      const status = response.status;
      const statusText = response.statusText;

      let content;
      try {
        content = await response.json();
      } catch {
        content = await response.text();
      }

      console.log(`📊 Status: ${status} ${statusText}`);
      console.log(`📄 Response:`, JSON.stringify(content, null, 2));

      if (status >= 200 && status < 400) {
        console.log('✅ Success');
      } else {
        console.log('❌ Error');
      }

    } catch (error) {
      console.log(`❌ Request Failed: ${error.message}`);
    }
  }

  console.log('\n🎯 ENDPOINT TEST COMPLETE');
}

// Run the test
if (require.main === module) {
  testApiEndpoints().catch(console.error);
}

module.exports = testApiEndpoints;
