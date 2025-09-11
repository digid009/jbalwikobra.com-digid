// Test the new deployment with mobile fixes
const fetch = require('node-fetch');

async function testLatestDeployment() {
  console.log('🔍 TESTING LATEST DEPLOYMENT');
  console.log('============================');
  
  const testUrls = [
    'https://jbalwikobra-com-digid-a9l8lb41y-digitalindo.vercel.app',
    'https://www.jbalwikobra.com'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🌐 Testing: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      
      if (response.status === 401) {
        console.log('🔒 401 Unauthorized - deployment authentication issue');
        continue;
      }
      
      if (response.status !== 200) {
        console.log(`❌ Response: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`✅ Response: ${response.status} (${html.length} bytes)`);
      
      // Check for our latest CSS fixes
      const cssMatch = html.match(/static\/css\/main\.([^"]+)\.css/);
      if (cssMatch) {
        const cssHash = cssMatch[1];
        console.log(`📄 CSS Hash: ${cssHash}`);
        
        // Test the CSS file
        const cssUrl = `${url}/${cssMatch[0]}`;
        const cssResponse = await fetch(cssUrl);
        const cssContent = await cssResponse.text();
        
        console.log(`📄 CSS Size: ${Math.round(cssContent.length / 1024)}KB`);
        
        // Check for our mobile fixes
        const hasMobileFixes = cssContent.includes('mobile-bottom-nav-fixed') || 
                              cssContent.includes('position:fixed!important') ||
                              cssContent.includes('transform:translate3d');
        
        if (hasMobileFixes) {
          console.log('✅ Mobile positioning fixes detected in CSS');
        } else {
          console.log('⚠️  Mobile fixes not found in CSS - may need cache clear');
        }
        
        // Check for critical mobile CSS rules
        if (cssContent.includes('padding-top') && cssContent.includes('padding-bottom')) {
          console.log('✅ Mobile spacing rules detected');
        } else {
          console.log('⚠️  Mobile spacing rules not found');
        }
      }
      
      // Test the JavaScript bundle
      const jsMatch = html.match(/static\/js\/main\.([^"]+)\.js/);
      if (jsMatch) {
        const jsHash = jsMatch[1];
        console.log(`📜 JS Hash: ${jsHash}`);
        
        // Check if it's a newer build
        if (jsHash !== '5e380ed1') {
          console.log('✅ New JavaScript bundle detected');
        } else {
          console.log('⚠️  Same JavaScript hash - might be cached');
        }
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }
  
  console.log('\n============================');
  console.log('📱 MOBILE TESTING RECOMMENDATIONS:');
  console.log('1. Test on actual mobile device or browser dev tools');
  console.log('2. Check if header stays at top when scrolling');
  console.log('3. Check if bottom nav stays at bottom when scrolling');
  console.log('4. Verify login functionality works');
  console.log('5. Check if banner and feed data loads');
}

testLatestDeployment();
