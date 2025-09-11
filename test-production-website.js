const https = require('https');
const http = require('http');

// Test configuration
const PRODUCTION_URL = 'https://www.jbalwikobra.com';
const TEST_TIMEOUT = 10000; // 10 seconds

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TEST_TIMEOUT);

    const req = protocol.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Helper function to check if response contains real data vs mock data
function analyzeDataContent(html, testName) {
  const indicators = {
    hasProducts: false,
    hasRealProductNames: false,
    hasMockData: false,
    hasSupabaseErrors: false,
    hasLoadingStates: false,
    hasEmptyStates: false
  };

  // Check for real product indicators
  const realProductPatterns = [
    /FREE FIRE/i,
    /MOBILE LEGEND/i,
    /PUBG/i,
    /GENSHIN/i,
    /product-card/i,
    /product-grid/i
  ];

  // Check for mock data indicators
  const mockDataPatterns = [
    /sample.*product/i,
    /test.*data/i,
    /placeholder/i,
    /demo.*item/i,
    /mock.*product/i
  ];

  // Check for error indicators
  const errorPatterns = [
    /supabase.*error/i,
    /connection.*failed/i,
    /fetch.*failed/i,
    /network.*error/i,
    /database.*error/i
  ];

  // Check for loading states
  const loadingPatterns = [
    /loading/i,
    /skeleton/i,
    /spinner/i,
    /memuat/i
  ];

  // Check for empty states
  const emptyPatterns = [
    /no.*products.*found/i,
    /tidak.*ada.*produk/i,
    /empty.*state/i
  ];

  // Analyze content
  indicators.hasProducts = realProductPatterns.some(pattern => pattern.test(html));
  indicators.hasRealProductNames = /FREE FIRE|MOBILE LEGEND|PUBG/i.test(html);
  indicators.hasMockData = mockDataPatterns.some(pattern => pattern.test(html));
  indicators.hasSupabaseErrors = errorPatterns.some(pattern => pattern.test(html));
  indicators.hasLoadingStates = loadingPatterns.some(pattern => pattern.test(html));
  indicators.hasEmptyStates = emptyPatterns.some(pattern => pattern.test(html));

  return indicators;
}

async function testProductionWebsite() {
  console.log('🔍 Testing Production Website: www.jbalwikobra.com');
  console.log('=' .repeat(60));
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('');

  const tests = [
    {
      name: 'Homepage',
      url: `${PRODUCTION_URL}/`,
      description: 'Main landing page with featured products'
    },
    {
      name: 'Products Page',
      url: `${PRODUCTION_URL}/products`,
      description: 'Complete product catalog'
    },
    {
      name: 'Flash Sales',
      url: `${PRODUCTION_URL}/flash-sales`,
      description: 'Flash sale products'
    },
    {
      name: 'Admin Dashboard',
      url: `${PRODUCTION_URL}/admin`,
      description: 'Admin panel (should redirect to login)'
    },
    {
      name: 'API Health Check',
      url: `${PRODUCTION_URL}/api/admin?action=health`,
      description: 'Backend API status'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);
    
    try {
      const response = await makeRequest(test.url);
      const analysis = analyzeDataContent(response.data, test.name);
      
      const result = {
        name: test.name,
        url: test.url,
        status: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 400,
        size: response.data.length,
        analysis: analysis,
        hasRealData: analysis.hasProducts && analysis.hasRealProductNames && !analysis.hasMockData,
        timestamp: new Date().toISOString()
      };

      results.push(result);

      // Display results
      if (result.success) {
        console.log(`✅ Status: ${result.status} (${result.size} bytes)`);
      } else {
        console.log(`❌ Status: ${result.status}`);
      }

      // Data analysis
      if (test.name === 'Homepage' || test.name === 'Products Page' || test.name === 'Flash Sales') {
        console.log(`📊 Data Analysis:`);
        console.log(`   Real Products: ${analysis.hasRealProductNames ? '✅' : '❌'}`);
        console.log(`   Mock Data: ${analysis.hasMockData ? '⚠️' : '✅'}`);
        console.log(`   Errors: ${analysis.hasSupabaseErrors ? '❌' : '✅'}`);
        console.log(`   Loading States: ${analysis.hasLoadingStates ? '⏳' : '✅'}`);
        console.log(`   Empty States: ${analysis.hasEmptyStates ? '📭' : '✅'}`);
      }

      // Sample content preview (first 200 chars)
      if (response.data.length > 0) {
        const preview = response.data.substring(0, 200).replace(/\s+/g, ' ');
        console.log(`📄 Content Preview: ${preview}...`);
      }

    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('');
  }

  // Final Summary
  console.log('📋 PRODUCTION WEBSITE TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const withRealData = results.filter(r => r.hasRealData);

  console.log(`✅ Successful Tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed Tests: ${failed.length}/${results.length}`);
  console.log(`📊 Pages with Real Data: ${withRealData.length}/${results.length}`);
  console.log('');

  // Detailed results
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const dataStatus = result.hasRealData ? '📊 Real Data' : 
                      result.analysis?.hasMockData ? '🔧 Mock Data' : 
                      result.analysis?.hasEmptyStates ? '📭 Empty' : 
                      '❓ Unknown';
    
    console.log(`${status} ${result.name}: HTTP ${result.status || 'Error'} | ${dataStatus}`);
  });

  console.log('');

  // Recommendations
  console.log('🎯 RECOMMENDATIONS:');
  console.log('-'.repeat(30));

  if (withRealData.length === 0) {
    console.log('❌ CRITICAL: No pages are showing real data from Supabase');
    console.log('   → Check Vercel environment variables');
    console.log('   → Verify Supabase connection in production');
    console.log('   → Check console errors in browser dev tools');
  } else if (withRealData.length < successful.length) {
    console.log('⚠️  PARTIAL: Some pages showing real data, others may have issues');
    console.log('   → Check specific pages that are not loading data');
  } else {
    console.log('✅ EXCELLENT: All pages are showing real data from Supabase');
  }

  if (failed.length > 0) {
    console.log(`❌ ${failed.length} pages failed to load - check server status`);
  }

  console.log('');
  console.log(`⏰ Test completed at: ${new Date().toISOString()}`);
  
  return results;
}

// Run the test
testProductionWebsite().catch(console.error);
