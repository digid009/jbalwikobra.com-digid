// Test the latest deployment directly
const fetch = require('node-fetch');

async function testLatestDeployment() {
  const latestUrl = 'https://jbalwikobra-com-digid-6vjyjm5dj-digitalindo.vercel.app';
  
  console.log('🔍 Testing Latest Deployment:', latestUrl);
  
  try {
    const response = await fetch(latestUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 Mobile Test' }
    });
    
    const html = await response.text();
    
    console.log('📄 HTML Size:', html.length, 'bytes');
    console.log('📅 Status:', response.status);
    
    // Check for our changes
    console.log('\n🔍 CHECKING FOR FIXES:');
    console.log('Header with fixed:', html.includes('<header') && html.includes('fixed') ? '✅ Found' : '❌ Missing');
    console.log('w-full class:', html.includes('w-full') ? '✅ Found' : '❌ Missing');
    console.log('z-50 class:', html.includes('z-50') ? '✅ Found' : '❌ Missing');
    console.log('Bottom nav:', html.includes('bottom-0') ? '✅ Found' : '❌ Missing');
    console.log('Mobile classes:', html.includes('md:hidden') ? '✅ Found' : '❌ Missing');
    console.log('Style injection:', html.includes('position: fixed') ? '✅ Found' : '❌ Missing');
    
    // Look for React app
    console.log('\n📱 REACT APP CHECK:');
    console.log('React root:', html.includes('id="root"') ? '✅ Found' : '❌ Missing');
    console.log('JS bundles:', html.includes('.js') ? '✅ Found' : '❌ Missing');
    
    if (html.length < 5000) {
      console.log('\n📄 FULL HTML CONTENT (small file):');
      console.log(html.substring(0, 1000) + '...');
    }
    
  } catch (error) {
    console.log(`❌ Test Failed: ${error.message}`);
  }
}

testLatestDeployment();
