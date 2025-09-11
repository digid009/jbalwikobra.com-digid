// Simple Production Website Data Test
const fetch = require('node-fetch');

async function testProductionData() {
  console.log('🔍 Testing www.jbalwikobra.com for Data Fetching');
  console.log('=' .repeat(55));
  console.log(`🕐 Started: ${new Date().toLocaleString()}\n`);

  const tests = [
    {
      name: 'Homepage Data Check',
      url: 'https://www.jbalwikobra.com/',
      type: 'html'
    },
    {
      name: 'Products API Test',
      url: 'https://www.jbalwikobra.com/api/admin?action=get-products',
      type: 'api'
    },
    {
      name: 'Auth API Test', 
      url: 'https://www.jbalwikobra.com/api/auth?action=health',
      type: 'api'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': test.type === 'api' ? 'application/json' : 'text/html'
        },
        timeout: 10000
      });

      const contentType = response.headers.get('content-type');
      const status = response.status;
      const statusText = response.statusText;

      let content;
      if (contentType && contentType.includes('application/json')) {
        content = await response.json();
      } else {
        content = await response.text();
      }

      const result = {
        name: test.name,
        url: test.url,
        status: status,
        success: status >= 200 && status < 400,
        contentType: contentType,
        size: typeof content === 'string' ? content.length : JSON.stringify(content).length,
        content: content
      };

      results.push(result);

      // Display basic results
      if (result.success) {
        console.log(`✅ Status: ${status} ${statusText}`);
        console.log(`📄 Content-Type: ${contentType}`);
        console.log(`📊 Size: ${result.size} bytes`);
      } else {
        console.log(`❌ Status: ${status} ${statusText}`);
      }

      // Analyze content for data indicators
      if (test.type === 'html') {
        const htmlContent = typeof content === 'string' ? content : '';
        
        // Check for real data indicators
        const hasProducts = /FREE FIRE|MOBILE LEGEND|PUBG|GENSHIN/i.test(htmlContent);
        const hasSupabaseConfig = /supabase/i.test(htmlContent);
        const hasMockData = /sample.*product|test.*data|placeholder|demo.*item/i.test(htmlContent);
        const hasErrors = /error|failed|connection.*failed/i.test(htmlContent);
        
        console.log(`🎮 Gaming Products: ${hasProducts ? '✅ Found' : '❌ Not found'}`);
        console.log(`🔧 Supabase Integration: ${hasSupabaseConfig ? '✅ Present' : '❌ Missing'}`);
        console.log(`🔍 Mock Data: ${hasMockData ? '⚠️ Detected' : '✅ None'}`);
        console.log(`❌ Errors: ${hasErrors ? '⚠️ Detected' : '✅ None'}`);
        
        result.analysis = {
          hasProducts,
          hasSupabaseConfig,
          hasMockData,
          hasErrors,
          realData: hasProducts && !hasMockData && !hasErrors
        };
      }

      if (test.type === 'api') {
        if (typeof content === 'object') {
          console.log(`📦 API Response:`, JSON.stringify(content, null, 2).substring(0, 300));
          
          // Check for successful data response
          const hasData = content.data || content.products || content.success;
          const hasError = content.error || content.message?.includes('error');
          
          console.log(`📊 Has Data: ${hasData ? '✅ Yes' : '❌ No'}`);
          console.log(`❌ Has Error: ${hasError ? '⚠️ Yes' : '✅ No'}`);
          
          result.analysis = {
            hasData: !!hasData,
            hasError: !!hasError,
            responseValid: !hasError && (hasData || status === 200)
          };
        } else {
          console.log(`📄 Text Response: ${content.substring(0, 200)}...`);
        }
      }

    } catch (error) {
      console.log(`❌ Request Failed: ${error.message}`);
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        error: error.message
      });
    }

    console.log('');
  }

  // Summary Report
  console.log('📋 PRODUCTION DATA TEST SUMMARY');
  console.log('=' .repeat(40));

  const successful = results.filter(r => r.success);
  const withRealData = results.filter(r => r.analysis?.realData || r.analysis?.responseValid);
  
  console.log(`✅ Successful Requests: ${successful.length}/${results.length}`);
  console.log(`📊 Pages with Real Data: ${withRealData.length}/${results.length}`);
  console.log('');

  // Detailed Results
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    let dataStatus = '❓ Unknown';
    
    if (result.analysis) {
      if (result.analysis.realData || result.analysis.responseValid) {
        dataStatus = '📊 Real Data';
      } else if (result.analysis.hasMockData || result.analysis.hasError) {
        dataStatus = '⚠️ Issues';
      } else {
        dataStatus = '🔧 Loading';
      }
    }
    
    console.log(`${status} ${result.name}: ${result.status || 'Failed'} | ${dataStatus}`);
  });

  console.log('');

  // Final Assessment
  console.log('🎯 FINAL ASSESSMENT:');
  console.log('-' .repeat(25));

  if (withRealData.length === results.length && successful.length === results.length) {
    console.log('🎉 EXCELLENT: All systems working with real data!');
    console.log('✅ Website: Loading real products from Supabase');
    console.log('✅ APIs: Responding correctly');
    console.log('✅ Data Flow: Complete and functional');
  } else if (withRealData.length > 0) {
    console.log('⚠️ PARTIAL SUCCESS: Some data loading, some issues detected');
    console.log('🔧 Recommendation: Check Vercel environment variables');
    console.log('🔧 Recommendation: Verify Supabase connection');
  } else {
    console.log('❌ NEEDS ATTENTION: Data loading issues detected');
    console.log('🚨 Critical: Check Supabase credentials in Vercel');
    console.log('🚨 Critical: Verify environment variables are set');
  }

  // Next Steps
  console.log('\n📝 NEXT STEPS:');
  if (withRealData.length < results.length) {
    console.log('1. Check Vercel Environment Variables');
    console.log('2. Verify Supabase connection');
    console.log('3. Check browser console for errors');
    console.log('4. Test API endpoints individually');
  } else {
    console.log('1. ✅ Data loading is working correctly!');
    console.log('2. Monitor for any performance issues');
    console.log('3. Consider adding more products if needed');
  }

  console.log(`\n🕐 Completed: ${new Date().toLocaleString()}`);
  
  return results;
}

// Run the test
if (require.main === module) {
  testProductionData().catch(console.error);
}

module.exports = testProductionData;
