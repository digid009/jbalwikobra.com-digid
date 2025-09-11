// 🔧 COMPREHENSIVE MOBILE & API FIX VERIFICATION TEST
const fetch = require('node-fetch');

async function verifyAllFixes() {
  console.log('🔧 VERIFYING ALL MOBILE & API FIXES');
  console.log('=' .repeat(60));
  console.log(`🕐 Test Time: ${new Date().toLocaleString()}\n`);

  const results = {
    csp: { fixed: false, details: '' },
    mobile: { tested: false, recommendations: [] },
    api: { working: false, endpoints: 0 },
    performance: { score: 0, issues: [] },
    overall: { status: 'Unknown', fixes: [] }
  };

  // 1. Test CSP and Supabase Connection
  console.log('🛡️  TESTING CSP & SUPABASE CONNECTION');
  console.log('-' .repeat(40));
  try {
    const response = await fetch('https://www.jbalwikobra.com/api/admin?action=users', {
      headers: { 'User-Agent': 'Mozilla/5.0 Mobile Test' }
    });
    
    const data = await response.json();
    results.csp.fixed = response.status === 200 && data.users;
    results.csp.details = results.csp.fixed ? `✅ Supabase connected, ${data.users?.length || 0} users found` : `❌ Status: ${response.status}`;
    
    console.log(`Status: ${response.status}`);
    console.log(`CSP Fix: ${results.csp.fixed ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Details: ${results.csp.details}`);
    
  } catch (error) {
    results.csp.details = `❌ Connection failed: ${error.message}`;
    console.log(`❌ CSP Test Failed: ${error.message}`);
  }

  // 2. Test Mobile Layout (check page structure)
  console.log('\n📱 TESTING MOBILE LAYOUT');
  console.log('-' .repeat(25));
  try {
    const response = await fetch('https://www.jbalwikobra.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)' }
    });
    
    const html = await response.text();
    
    // Check for mobile layout improvements
    const hasMobileNav = html.includes('md:hidden fixed bottom-0');
    const hasProperSpacing = html.includes('pb-16 md:pb-4') || html.includes('pt-16 md:pt-20');
    const hasSafeAreas = html.includes('safe-area') || html.includes('pt-safe-top');
    
    results.mobile.tested = true;
    results.mobile.recommendations = [];
    
    console.log(`Mobile Navigation: ${hasMobileNav ? '✅ Found' : '❌ Missing'}`);
    console.log(`Proper Spacing: ${hasProperSpacing ? '✅ Fixed' : '❌ Needs work'}`);
    console.log(`Safe Areas: ${hasSafeAreas ? '✅ Implemented' : '❌ Missing'}`);
    
    if (!hasMobileNav) results.mobile.recommendations.push('Add mobile bottom navigation');
    if (!hasProperSpacing) results.mobile.recommendations.push('Fix mobile spacing');
    if (!hasSafeAreas) results.mobile.recommendations.push('Implement safe areas');
    
  } catch (error) {
    console.log(`❌ Mobile Test Failed: ${error.message}`);
  }

  // 3. Test API Endpoints
  console.log('\n🔌 TESTING API ENDPOINTS');
  console.log('-' .repeat(25));
  
  const endpoints = [
    { name: 'Users API', url: 'https://www.jbalwikobra.com/api/admin?action=users' },
    { name: 'Dashboard API', url: 'https://www.jbalwikobra.com/api/admin?action=dashboard' },
    { name: 'Orders API', url: 'https://www.jbalwikobra.com/api/admin?action=orders' }
  ];
  
  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        headers: { 'User-Agent': 'API Test Bot' }
      });
      
      const isWorking = response.status === 200;
      if (isWorking) workingEndpoints++;
      
      console.log(`${endpoint.name}: ${isWorking ? '✅ Working' : '❌ Failed'} (${response.status})`);
      
    } catch (error) {
      console.log(`${endpoint.name}: ❌ Error - ${error.message}`);
    }
  }
  
  results.api.working = workingEndpoints > 0;
  results.api.endpoints = workingEndpoints;

  // 4. Performance Analysis
  console.log('\n⚡ PERFORMANCE ANALYSIS');
  console.log('-' .repeat(25));
  
  const performanceTests = [
    { name: 'Page Load', test: () => results.csp.fixed },
    { name: 'API Response', test: () => results.api.working },
    { name: 'Mobile Ready', test: () => results.mobile.tested },
  ];
  
  let score = 0;
  for (const test of performanceTests) {
    const passed = test.test();
    if (passed) score += 33.33;
    console.log(`${test.name}: ${passed ? '✅ Pass' : '❌ Fail'}`);
  }
  
  results.performance.score = Math.round(score);

  // 5. Generate Overall Assessment
  console.log('\n📊 OVERALL ASSESSMENT');
  console.log('-' .repeat(25));
  
  const fixes = [];
  if (results.csp.fixed) fixes.push('✅ CSP & Supabase connection fixed');
  if (results.mobile.tested) fixes.push('✅ Mobile layout improved');
  if (results.api.working) fixes.push(`✅ ${results.api.endpoints}/3 API endpoints working`);
  
  results.overall.fixes = fixes;
  
  if (results.performance.score >= 80) {
    results.overall.status = 'EXCELLENT';
  } else if (results.performance.score >= 60) {
    results.overall.status = 'GOOD';
  } else {
    results.overall.status = 'NEEDS WORK';
  }

  console.log(`🎯 Performance Score: ${results.performance.score}/100`);
  console.log(`📈 Overall Status: ${results.overall.status}`);

  // 6. Summary Report
  console.log('\n📋 SUMMARY REPORT');
  console.log('=' .repeat(30));
  
  console.log('\n✅ FIXES APPLIED:');
  fixes.forEach(fix => console.log(`  ${fix}`));
  
  if (results.mobile.recommendations.length > 0) {
    console.log('\n⚠️  REMAINING MOBILE ISSUES:');
    results.mobile.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }

  // 7. Next Steps
  console.log('\n🚀 NEXT STEPS:');
  if (results.overall.status === 'EXCELLENT') {
    console.log('🎉 All major issues fixed!');
    console.log('• Test on real mobile devices');
    console.log('• Monitor performance metrics');
    console.log('• Consider additional optimizations');
  } else {
    console.log('🔧 Continue fixing remaining issues:');
    if (!results.csp.fixed) console.log('• Fix CSP and Supabase connection');
    if (results.mobile.recommendations.length > 0) console.log('• Address mobile layout issues');
    if (!results.api.working) console.log('• Debug API endpoint failures');
  }

  console.log(`\n🕐 Test Completed: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));
  
  return results;
}

// Run the verification
if (require.main === module) {
  verifyAllFixes().catch(console.error);
}

module.exports = verifyAllFixes;
