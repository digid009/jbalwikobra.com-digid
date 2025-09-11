// Test valid API endpoints 
const fetch = require('node-fetch');

async function testValidEndpoints() {
  console.log('🎯 Testing Valid API Endpoints');
  console.log('=' .repeat(40));

  const tests = [
    {
      name: 'Admin Dashboard',
      url: 'https://www.jbalwikobra.com/api/admin?action=dashboard'
    },
    {
      name: 'Admin Orders',
      url: 'https://www.jbalwikobra.com/api/admin?action=orders'
    },
    {
      name: 'Admin Users',
      url: 'https://www.jbalwikobra.com/api/admin?action=users'
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);

    try {
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const status = response.status;
      let content;
      
      try {
        content = await response.json();
      } catch {
        content = await response.text();
      }

      console.log(`📊 Status: ${status}`);
      
      if (status >= 200 && status < 400) {
        console.log('✅ SUCCESS');
        console.log(`📦 Response:`, JSON.stringify(content, null, 2).substring(0, 500));
        
        // Check for real data indicators
        const hasData = content.data || content.orders || content.users || content.stats;
        console.log(`🔍 Has Data: ${hasData ? '✅ Yes' : '❌ No'}`);
        
      } else {
        console.log('❌ ERROR');
        console.log(`📦 Response:`, JSON.stringify(content, null, 2));
      }

    } catch (error) {
      console.log(`❌ Request Failed: ${error.message}`);
    }
  }

  console.log('\n🎯 VALID ENDPOINT TEST COMPLETE');
}

// Run the test
if (require.main === module) {
  testValidEndpoints().catch(console.error);
}

module.exports = testValidEndpoints;
