const fetch = require('node-fetch');

async function testLocalApi() {
  const endpoints = [
    { name: 'Banners', url: 'http://localhost:3000/api/banner' },
    { name: 'Posts', url: 'http://localhost:3000/api/posts' },
    { name: 'Flash Sales', url: 'http://localhost:3000/api/flash-sales' },
    { name: 'Auth Check', url: 'http://localhost:3000/api/auth/check' }
  ];

  console.log('--- Verifying Local API Endpoints ---');
  let allTestsPassed = true;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        headers: { 'Accept': 'application/json' }
      });
      
      const contentType = response.headers.get('content-type');
      
      if (response.status === 200 && contentType && contentType.includes('application/json')) {
        console.log(`✅ ${endpoint.name}: OK (Status: ${response.status}, Type: JSON)`);
        // Try to parse to be sure
        await response.json();
      } else {
        allTestsPassed = false;
        console.error(`❌ ${endpoint.name}: FAILED`);
        console.error(`  - Status: ${response.status}`);
        console.error(`  - Content-Type: ${contentType}`);
        if (contentType && contentType.includes('text/html')) {
            console.error('  - Received HTML instead of JSON. The API proxy may not be working.');
            console.error('  - The development server needs to be restarted for the proxy setting in package.json to take effect.');
        } else {
            const text = await response.text();
            console.error(`  - Response: ${text.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      allTestsPassed = false;
      console.error(`❌ ${endpoint.name}: FAILED with error`);
      console.error(`  - ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
          console.error('  - Connection refused. Is the dev server running on port 3000?');
      }
    }
    console.log('---------------------------------');
  }

  if (allTestsPassed) {
    console.log('\n🎉 All API endpoints responded correctly with JSON.');
  } else {
    console.log('\n⚠️ Some API endpoint checks failed.');
  }
}

testLocalApi();
