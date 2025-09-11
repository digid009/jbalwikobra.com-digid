// Test the newest deployment
const fetch = require('node-fetch');

async function testNewestDeployment() {
  const newestUrl = 'https://jbalwikobra-com-digid-4w21hymjp-digitalindo.vercel.app';
  
  console.log('🔍 Testing Newest Deployment:', newestUrl);
  
  try {
    const response = await fetch(newestUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)' }
    });
    
    const html = await response.text();
    
    console.log('📄 HTML Size:', html.length, 'bytes');
    console.log('📅 Status:', response.status);
    
    if (response.status === 200) {
      // Check for our changes
      console.log('\n🔍 CHECKING FOR MOBILE FIXES:');
      
      const hasFixedHeader = html.includes('fixed top-0') || (html.includes('<header') && html.includes('fixed'));
      const hasWFull = html.includes('w-full');
      const hasZIndex = html.includes('z-50') || html.includes('z-[100]');
      const hasBottomNav = html.includes('bottom-0');
      const hasMobileClasses = html.includes('md:hidden');
      const hasStyleFix = html.includes('position: fixed');
      
      console.log('Fixed Header:', hasFixedHeader ? '✅ Found' : '❌ Missing');
      console.log('w-full class:', hasWFull ? '✅ Found' : '❌ Missing');
      console.log('Z-index classes:', hasZIndex ? '✅ Found' : '❌ Missing');
      console.log('Bottom nav:', hasBottomNav ? '✅ Found' : '❌ Missing');
      console.log('Mobile responsive:', hasMobileClasses ? '✅ Found' : '❌ Missing');
      console.log('Style fixes:', hasStyleFix ? '✅ Found' : '❌ Missing');
      
      // Check React app is working
      console.log('\n📱 REACT APP STATUS:');
      console.log('React root:', html.includes('id="root"') ? '✅ Found' : '❌ Missing');
      console.log('JS bundles:', html.includes('static/js/') ? '✅ Found' : '❌ Missing');
      console.log('CSS files:', html.includes('static/css/') ? '✅ Found' : '❌ Missing');
      
      // Count fixes
      const fixes = [hasFixedHeader, hasWFull, hasZIndex, hasBottomNav, hasMobileClasses, hasStyleFix];
      const fixCount = fixes.filter(Boolean).length;
      
      console.log('\n📊 MOBILE FIX SUMMARY:');
      console.log(`✅ Fixes Applied: ${fixCount}/6`);
      console.log(`📈 Success Rate: ${Math.round((fixCount/6)*100)}%`);
      
      if (fixCount >= 4) {
        console.log('🎉 Mobile layout fixes successfully deployed!');
        console.log('📱 Header and bottom navigation should now stick properly');
      } else {
        console.log('⚠️ Some fixes may not be fully applied yet');
      }
      
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.log(`❌ Test Failed: ${error.message}`);
  }
}

testNewestDeployment();
