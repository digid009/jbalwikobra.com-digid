#!/usr/bin/env node

const http = require('http');

async function testMobileFirst() {
  console.log('🧪 TESTING MOBILE-FIRST IMPLEMENTATION');
  console.log('=====================================\n');
  
  try {
    // Test if server is running
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ Server Response: ${res.statusCode}`);
      console.log(`✅ Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📱 MOBILE-FIRST COMPONENTS CHECK');
        console.log('==================================');
        
        // Check for mobile-first classes
        const checks = [
          { name: 'Mobile-first CSS import', pattern: 'mobile-first.css', found: data.includes('mobile-first.css') },
          { name: 'iOS Container', pattern: 'ios-container', found: data.includes('ios-container') },
          { name: 'Mobile Bottom Nav', pattern: 'mobile-bottom-nav', found: data.includes('mobile-bottom-nav') },
          { name: 'Z-index utilities', pattern: 'z-50|z-60', found: /z-5[06]/.test(data) },
          { name: 'Fixed positioning', pattern: 'fixed', found: data.includes('fixed') },
          { name: 'Responsive padding', pattern: 'pt-\\[70px\\]', found: data.includes('pt-[70px]') },
          { name: 'React App bundle', pattern: 'bundle.js', found: data.includes('bundle.js') }
        ];
        
        checks.forEach(check => {
          console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
        });
        
        console.log('\n🔍 DETAILED ANALYSIS');
        console.log('====================');
        console.log(`📄 HTML Size: ${data.length} bytes`);
        console.log(`📦 Contains React bundle: ${data.includes('static/js/bundle.js') ? 'Yes' : 'No'}`);
        console.log(`📱 iOS meta tags: ${data.includes('apple-mobile-web-app') ? 'Yes' : 'No'}`);
        console.log(`🎨 CSS bundle: ${data.includes('static/css/main') ? 'Yes' : 'No'}`);
        
        console.log('\n🎉 Basic server test completed!');
        console.log('📝 Open http://localhost:3000 in your browser to test mobile-first layout');
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Request error: ${e.message}`);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testMobileFirst();
