// Comprehensive diagnosis of reported issues
const fetch = require('node-fetch');

async function diagnoseIssues() {
  console.log('🔍 DIAGNOSING REPORTED ISSUES');
  console.log('1. Header still scrolling');
  console.log('2. Bottom navigation placed at page bottom, not sticking to scroll');
  console.log('3. Can\'t login');
  console.log('4. Banner not fetching data');
  console.log('5. Feed not fetching data');
  
  console.log('\n📡 Testing API Endpoints...');
  
  // Test main domain
  try {
    const response = await fetch('https://www.jbalwikobra.com');
    console.log(`\n🌐 Main Domain Status: ${response.status}`);
    
    if (response.status === 200) {
      const html = await response.text();
      console.log(`📄 HTML Size: ${html.length} bytes`);
      
      // Check for CSS and JS
      const cssMatches = html.match(/static\/css\/[^"]+\.css/g) || [];
      const jsMatches = html.match(/static\/js\/[^"]+\.js/g) || [];
      
      console.log(`🎨 CSS Files: ${cssMatches.length}`);
      console.log(`📜 JS Files: ${jsMatches.length}`);
      
      if (cssMatches.length > 0) {
        console.log('CSS Files found:', cssMatches);
      }
      
      // Check for critical meta tags
      console.log('\n📱 Mobile Meta Tags:');
      console.log(`Viewport: ${html.includes('viewport') ? '✅' : '❌'}`);
      console.log(`Apple mobile capable: ${html.includes('apple-mobile-web-app-capable') ? '✅' : '❌'}`);
      console.log(`Viewport fit: ${html.includes('viewport-fit=cover') ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.log(`❌ Main domain test failed: ${error.message}`);
  }
  
  // Test API endpoints that might be causing data fetching issues
  const apiEndpoints = [
    'https://www.jbalwikobra.com/api/auth/check',
    'https://www.jbalwikobra.com/api/banner',
    'https://www.jbalwikobra.com/api/feed',
    'https://www.jbalwikobra.com/api/products'
  ];
  
  console.log('\n🔗 Testing API Endpoints:');
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log(`  ⚠️  Endpoint not found - might be causing data fetching issues`);
      } else if (response.status >= 500) {
        console.log(`  ❌ Server error - likely causing data fetching issues`);
      } else if (response.status === 401) {
        console.log(`  🔒 Unauthorized - authentication issue`);
      }
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`);
    }
  }
  
  console.log('\n🔄 LIKELY ISSUES IDENTIFIED:');
  console.log('1. Mobile CSS fixes may not be applied correctly');
  console.log('2. API routes might be missing or misconfigured');
  console.log('3. Authentication system may have environment variable issues');
  console.log('4. Data fetching failing due to API endpoint problems');
}

diagnoseIssues();
