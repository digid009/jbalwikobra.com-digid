const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('Testing API proxy on http://localhost:3000/api/banner...');
    const response = await fetch('http://localhost:3000/api/banner');
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      
      if (data.error) {
        console.log('API returned an error:', data.error);
      } else {
        console.log('API call successful!');
      }
    } else {
      console.log('Response is not JSON');
      const text = await response.text();
      console.log(text.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testApi();
