// Simple deployment test
const fetch = require('node-fetch');

async function simpleTest() {
  const deployments = [
    'https://jbalwikobra-com-digid-4w21hymjp-digitalindo.vercel.app',
    'https://jbalwikobra-com-digid-6vjyjm5dj-digitalindo.vercel.app',
    'https://www.jbalwikobra.com'
  ];
  
  for (const url of deployments) {
    console.log(`\n🔍 Testing: ${url}`);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 Simple Test' }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.status === 200) {
        const html = await response.text();
        console.log(`HTML Size: ${html.length} bytes`);
        console.log(`Has React: ${html.includes('id="root"') ? 'Yes' : 'No'}`);
        console.log(`Has CSS: ${html.includes('.css') ? 'Yes' : 'No'}`);
        console.log(`Has JS: ${html.includes('.js') ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

simpleTest();
