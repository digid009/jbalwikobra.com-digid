const fetch = require('node-fetch');

async function testAllApis() {
  const testEndpoints = [
    { name: 'Banner API', url: 'http://localhost:3000/api/banner' },
    { name: 'Feed/Posts API', url: 'http://localhost:3000/api/posts' }
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`\n=== Testing ${endpoint.name} ===`);
      console.log(`URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Headers: ${JSON.stringify(response.headers.raw(), null, 2)}`);
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
      } else {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 300)}...`);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint.name}: ${error.message}`);
    }
  }
}

testAllApis();
