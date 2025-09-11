// 📱 MOBILE LAYOUT VERIFICATION TEST
const fetch = require('node-fetch');

async function testMobileLayout() {
  console.log('📱 TESTING MOBILE LAYOUT FIXES');
  console.log('=' .repeat(50));
  console.log(`🕐 Test Time: ${new Date().toLocaleString()}\n`);

  const results = {
    header: { fixed: false, css: false },
    bottomNav: { fixed: false, css: false },
    spacing: { correct: false },
    overall: { score: 0, status: 'Unknown' }
  };

  try {
    // Test homepage with mobile user agent
    console.log('🔍 Testing Mobile Homepage Layout...');
    const response = await fetch('https://www.jbalwikobra.com/', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    });
    
    const html = await response.text();
    
    // Check for fixed header
    const hasFixedHeader = html.includes('fixed top-0') && html.includes('z-50');
    const hasHeaderCSS = html.includes('position: fixed') || html.includes('fixed !important');
    
    results.header.fixed = hasFixedHeader;
    results.header.css = hasHeaderCSS;
    
    console.log(`📌 Fixed Header: ${hasFixedHeader ? '✅ Found' : '❌ Missing'}`);
    console.log(`🎨 Header CSS: ${hasHeaderCSS ? '✅ Applied' : '❌ Missing'}`);
    
    // Check for fixed bottom navigation
    const hasFixedBottomNav = html.includes('fixed bottom-0') && html.includes('z-[100]');
    const hasBottomNavCSS = html.includes('md:hidden');
    
    results.bottomNav.fixed = hasFixedBottomNav;
    results.bottomNav.css = hasBottomNavCSS;
    
    console.log(`📌 Fixed Bottom Nav: ${hasFixedBottomNav ? '✅ Found' : '❌ Missing'}`);
    console.log(`🎨 Bottom Nav CSS: ${hasBottomNavCSS ? '✅ Applied' : '❌ Missing'}`);
    
    // Check for proper spacing
    const hasProperSpacing = html.includes('pt-16') && html.includes('pb-16');
    results.spacing.correct = hasProperSpacing;
    
    console.log(`📏 Proper Spacing: ${hasProperSpacing ? '✅ Correct' : '❌ Incorrect'}`);
    
    // Check for responsive design
    const hasResponsive = html.includes('md:hidden') && html.includes('md:block');
    console.log(`📱 Responsive Design: ${hasResponsive ? '✅ Implemented' : '❌ Missing'}`);
    
    // Check for safe area support
    const hasSafeAreas = html.includes('safe-area') || html.includes('pt-safe-top');
    console.log(`🔒 Safe Areas: ${hasSafeAreas ? '✅ Supported' : '❌ Missing'}`);
    
    // Calculate score
    let score = 0;
    if (results.header.fixed) score += 25;
    if (results.bottomNav.fixed) score += 25;
    if (results.spacing.correct) score += 25;
    if (hasResponsive) score += 15;
    if (hasSafeAreas) score += 10;
    
    results.overall.score = score;
    
    if (score >= 85) results.overall.status = 'EXCELLENT';
    else if (score >= 70) results.overall.status = 'GOOD';
    else if (score >= 50) results.overall.status = 'FAIR';
    else results.overall.status = 'NEEDS WORK';
    
  } catch (error) {
    console.log(`❌ Test Failed: ${error.message}`);
  }

  // Summary
  console.log('\n📊 MOBILE LAYOUT SUMMARY');
  console.log('-' .repeat(30));
  console.log(`🎯 Overall Score: ${results.overall.score}/100`);
  console.log(`📈 Status: ${results.overall.status}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log(`📌 Header Sticking: ${results.header.fixed ? '✅ FIXED' : '❌ BROKEN'}`);
  console.log(`📌 Bottom Nav Sticking: ${results.bottomNav.fixed ? '✅ FIXED' : '❌ BROKEN'}`);
  console.log(`📏 Content Spacing: ${results.spacing.correct ? '✅ CORRECT' : '❌ INCORRECT'}`);
  
  console.log('\n🚀 RECOMMENDATIONS:');
  if (results.overall.score >= 80) {
    console.log('🎉 Mobile layout is working well!');
    console.log('• Test on real devices for final verification');
    console.log('• Consider adding animation improvements');
  } else {
    console.log('🔧 Areas that need attention:');
    if (!results.header.fixed) console.log('• Fix header positioning');
    if (!results.bottomNav.fixed) console.log('• Fix bottom navigation positioning');
    if (!results.spacing.correct) console.log('• Adjust content spacing');
  }
  
  console.log(`\n🕐 Test Completed: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(50));
  
  return results;
}

// Run the test
if (require.main === module) {
  testMobileLayout().catch(console.error);
}

module.exports = testMobileLayout;
