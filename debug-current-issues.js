// Debug the current deployment issues
const fetch = require('node-fetch');

async function debugCurrentIssues() {
  console.log('🔍 DEBUGGING CURRENT ISSUES');
  console.log('============================');
  
  // Test if the site loads at all
  try {
    console.log('\n1. Testing main domain accessibility...');
    const response = await fetch('https://www.jbalwikobra.com');
    console.log(`✅ Main domain responds: ${response.status}`);
    
    const html = await response.text();
    
    // Check if it's a React app
    if (html.includes('id="root"')) {
      console.log('✅ React app structure detected');
    } else {
      console.log('❌ No React app structure found');
    }
    
    // Check for our CSS
    if (html.includes('static/css/')) {
      console.log('✅ CSS bundle found in HTML');
    } else {
      console.log('❌ No CSS bundle found');
    }
    
    // Check for our JS
    if (html.includes('static/js/')) {
      console.log('✅ JS bundle found in HTML');
    } else {
      console.log('❌ No JS bundle found');
    }
    
    // Extract bundle URLs for testing
    const cssMatch = html.match(/static\/css\/[^"]+\.css/);
    const jsMatch = html.match(/static\/js\/[^"]+\.js/);
    
    if (cssMatch) {
      console.log(`📄 CSS Bundle: ${cssMatch[0]}`);
      
      // Test if CSS loads
      try {
        const cssResponse = await fetch(`https://www.jbalwikobra.com/${cssMatch[0]}`);
        console.log(`✅ CSS loads: ${cssResponse.status} (${Math.round((await cssResponse.text()).length / 1024)}KB)`);
      } catch (e) {
        console.log(`❌ CSS load failed: ${e.message}`);
      }
    }
    
    if (jsMatch) {
      console.log(`📄 JS Bundle: ${jsMatch[0]}`);
      
      // Test if JS loads
      try {
        const jsResponse = await fetch(`https://www.jbalwikobra.com/${jsMatch[0]}`);
        const jsSize = (await jsResponse.text()).length;
        console.log(`✅ JS loads: ${jsResponse.status} (${Math.round(jsSize / 1024)}KB)`);
        
        if (jsSize < 10000) {
          console.log('⚠️  JS bundle seems very small - might be missing components');
        }
      } catch (e) {
        console.log(`❌ JS load failed: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Main domain test failed: ${error.message}`);
    return;
  }
  
  console.log('\n============================');
  console.log('📋 LIKELY ISSUE SUMMARY:');
  console.log('1. 🔧 Mobile CSS fixes need to be redeployed');
  console.log('2. 🔒 Supabase connection might be failing (causing data issues)');
  console.log('3. 📱 Fixed positioning CSS needs stronger override');
  console.log('4. 🔄 App might be loading cached version without latest fixes');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Redeploy to ensure latest mobile fixes are live');
  console.log('2. Test Supabase connection directly');
  console.log('3. Add stronger CSS overrides for mobile positioning');
  console.log('4. Verify environment variables are properly set');
}

debugCurrentIssues();
