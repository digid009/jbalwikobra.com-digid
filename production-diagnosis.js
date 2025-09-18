/**
 * 🔧 PRODUCTION TROUBLESHOOTING GUIDE
 * For debugging www.jbalwikobra.com purchase flow issues
 */

// STEP 1: Copy and paste this into browser console on https://www.jbalwikobra.com

async function diagnosePurchaseFlowIssues() {
  console.log('🚨 PRODUCTION PURCHASE FLOW DIAGNOSIS');
  console.log('=' .repeat(60));
  console.log('🌐 Site:', window.location.href);
  console.log('🕒 Time:', new Date().toLocaleString('id-ID'));
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    issues: [],
    recommendations: [],
    criticalErrors: []
  };

  // Check 1: Basic Site Health
  console.log('\n🔍 BASIC SITE HEALTH');
  console.log('-'.repeat(30));
  
  const reactApp = document.getElementById('root');
  const hasContent = reactApp && reactApp.children.length > 0;
  
  if (!hasContent) {
    const issue = 'React application failed to load';
    console.log('❌', issue);
    diagnosis.criticalErrors.push(issue);
  } else {
    console.log('✅ React application loaded');
  }

  // Check 2: Navigation and Routing
  console.log('\n🔍 NAVIGATION SYSTEM');
  console.log('-'.repeat(30));
  
  const nav = document.querySelector('nav, [role="navigation"]');
  const productLinks = document.querySelectorAll('a[href*="/product"]');
  const flashSaleLinks = document.querySelectorAll('a[href*="/flash-sale"]');
  
  console.log(`📱 Navigation present: ${nav ? '✅' : '❌'}`);
  console.log(`🛍️ Product links: ${productLinks.length}`);
  console.log(`⚡ Flash sale links: ${flashSaleLinks.length}`);
  
  if (productLinks.length === 0) {
    const issue = 'No product links found on homepage';
    diagnosis.issues.push(issue);
    diagnosis.recommendations.push('Check if products are loading from database');
  }

  // Check 3: API Endpoints
  console.log('\n🔍 API ENDPOINTS STATUS');
  console.log('-'.repeat(30));
  
  // Test payment methods API
  try {
    console.log('📡 Testing /api/xendit/payment-methods...');
    const pmResponse = await fetch('/api/xendit/payment-methods');
    
    if (pmResponse.ok) {
      const pmData = await pmResponse.json();
      console.log('✅ Payment methods API: WORKING');
      console.log(`   Methods available: ${pmData.methods?.length || 0}`);
      console.log(`   Data source: ${pmData.source || 'unknown'}`);
      
      if (pmData.source === 'fallback') {
        const issue = 'Payment API using fallback data (offline mode)';
        console.log('⚠️', issue);
        diagnosis.issues.push(issue);
        diagnosis.recommendations.push('Check Xendit API credentials and network connectivity');
      }
    } else {
      const issue = `Payment methods API failed: ${pmResponse.status}`;
      console.log('❌', issue);
      diagnosis.criticalErrors.push(issue);
    }
  } catch (error) {
    const issue = `Payment methods API error: ${error.message}`;
    console.log('❌', issue);
    diagnosis.criticalErrors.push(issue);
  }

  // Test payment creation endpoint
  console.log('\n📡 Testing payment creation endpoint...');
  try {
    const testPayload = {
      amount: 10000,
      currency: 'IDR',
      payment_method_id: 'qris',
      customer: {
        given_names: 'Debug Test',
        email: 'debug@jbalwikobra.com',
        mobile_number: '+6281234567890'
      },
      description: 'Debug Test',
      external_id: `debug_${Date.now()}`,
      success_redirect_url: 'https://www.jbalwikobra.com/payment-status?status=success',
      failure_redirect_url: 'https://www.jbalwikobra.com/payment-status?status=failed'
    };

    const createResponse = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Payment creation API: WORKING');
      console.log(`   Payment ID: ${createData.id || 'N/A'}`);
    } else {
      const errorData = await createResponse.json();
      const issue = `Payment creation failed: ${errorData.error || createResponse.statusText}`;
      console.log('❌', issue);
      diagnosis.criticalErrors.push(issue);
    }
  } catch (error) {
    const issue = `Payment creation error: ${error.message}`;
    console.log('❌', issue);
    diagnosis.criticalErrors.push(issue);
  }

  // Check 4: Current Page Analysis
  console.log('\n🔍 CURRENT PAGE ANALYSIS');
  console.log('-'.repeat(30));
  
  const currentPath = window.location.pathname;
  console.log(`📍 Current path: ${currentPath}`);
  
  if (currentPath === '/') {
    console.log('🏠 On homepage');
    const featuredProducts = document.querySelectorAll('[data-testid*="product"], .product-card');
    console.log(`   Featured products: ${featuredProducts.length}`);
    
    if (featuredProducts.length === 0) {
      diagnosis.issues.push('No products displayed on homepage');
      diagnosis.recommendations.push('Check product data loading from Supabase');
    }
    
  } else if (currentPath.includes('/product/')) {
    console.log('📦 On product detail page');
    
    // Check purchase elements
    const buyButtons = [...document.querySelectorAll('button')]
      .filter(btn => btn.textContent && btn.textContent.includes('Beli'));
    const rentButtons = [...document.querySelectorAll('button')]
      .filter(btn => btn.textContent && btn.textContent.includes('Sewa'));
    
    console.log(`   Buy buttons: ${buyButtons.length}`);
    console.log(`   Rent buttons: ${rentButtons.length}`);
    
    if (buyButtons.length === 0) {
      diagnosis.issues.push('No purchase buttons found on product page');
    }
    
    // Check product data
    const productTitle = document.querySelector('h1, [data-testid="product-title"]');
    const priceElements = document.querySelectorAll('[class*="price"], .text-pink-400, .text-green-400');
    
    console.log(`   Product title: ${productTitle ? '✅' : '❌'}`);
    console.log(`   Price elements: ${priceElements.length}`);
    
  } else if (currentPath.includes('/products')) {
    console.log('🛍️ On products listing page');
    const productCards = document.querySelectorAll('[data-testid*="product"], .product-card');
    console.log(`   Product cards: ${productCards.length}`);
    
  } else {
    console.log(`📄 On other page: ${currentPath}`);
  }

  // Check 5: Environment Variables (visible ones)
  console.log('\n🔍 ENVIRONMENT CHECK');
  console.log('-'.repeat(30));
  
  // Check for React environment indicators
  const isDevelopment = window.location.hostname === 'localhost';
  const isProduction = window.location.hostname === 'www.jbalwikobra.com';
  
  console.log(`🏗️ Environment: ${isDevelopment ? 'Development' : isProduction ? 'Production' : 'Unknown'}`);
  
  if (!isProduction && !isDevelopment) {
    diagnosis.issues.push('Running on unexpected domain');
  }

  // Check 6: Browser Compatibility
  console.log('\n🔍 BROWSER COMPATIBILITY');
  console.log('-'.repeat(30));
  
  const browser = {
    userAgent: navigator.userAgent,
    supportsModules: 'noModule' in HTMLScriptElement.prototype,
    supportsES6: typeof Symbol !== 'undefined',
    supportsFetch: typeof fetch !== 'undefined',
    supportsLocalStorage: typeof localStorage !== 'undefined'
  };
  
  console.log(`📱 User Agent: ${browser.userAgent}`);
  console.log(`⚡ ES6 Modules: ${browser.supportsModules ? '✅' : '❌'}`);
  console.log(`📦 ES6 Features: ${browser.supportsES6 ? '✅' : '❌'}`);
  console.log(`🌐 Fetch API: ${browser.supportsFetch ? '✅' : '❌'}`);
  console.log(`💾 Local Storage: ${browser.supportsLocalStorage ? '✅' : '❌'}`);

  // Check 7: Error Detection
  console.log('\n🔍 ERROR DETECTION');
  console.log('-'.repeat(30));
  
  const errors = [];
  const originalError = console.error;
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError(...args);
  };
  
  // Restore after 2 seconds and report
  setTimeout(() => {
    console.error = originalError;
    console.log(`🐛 JavaScript errors detected: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
      diagnosis.issues.push(`${errors.length} JavaScript errors detected`);
    }
  }, 2000);

  // Final Diagnosis
  console.log('\n' + '=' .repeat(60));
  console.log('🏥 DIAGNOSIS SUMMARY');
  console.log('=' .repeat(60));
  
  if (diagnosis.criticalErrors.length > 0) {
    console.log('\n🚨 CRITICAL ERRORS:');
    diagnosis.criticalErrors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  if (diagnosis.issues.length > 0) {
    console.log('\n⚠️ ISSUES FOUND:');
    diagnosis.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  if (diagnosis.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    diagnosis.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }
  
  if (diagnosis.criticalErrors.length === 0 && diagnosis.issues.length === 0) {
    console.log('\n✅ NO CRITICAL ISSUES DETECTED');
    console.log('The purchase flow appears to be working correctly.');
  }
  
  console.log('\n🧪 MANUAL TESTING STEPS:');
  console.log('1. Navigate to: /products');
  console.log('2. Click on any product');
  console.log('3. Click "Beli Sekarang"');
  console.log('4. Fill customer form:');
  console.log('   - Name: "Test User"');
  console.log('   - Email: "test@jbalwikobra.com"');
  console.log('   - WhatsApp: "+628123456789"');
  console.log('5. Select QRIS payment method');
  console.log('6. Click "Bayar Sekarang"');
  console.log('7. Should redirect to /payment?method=qris&...');
  
  console.log('\n🔧 DEBUGGING TOOLS:');
  console.log('- Run diagnosis again: diagnosePurchaseFlowIssues()');
  console.log('- Test specific API: testAPI()');
  console.log('- Check modal state: checkModalState()');
  
  // Store diagnosis globally
  window.purchaseFlowDiagnosis = diagnosis;
  
  return diagnosis;
}

// Helper functions
async function testAPI() {
  console.log('🧪 API Test');
  try {
    const response = await fetch('/api/xendit/payment-methods');
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.log('Error:', error);
    return null;
  }
}

function checkModalState() {
  const modal = document.querySelector('.fixed.inset-0');
  if (!modal) {
    console.log('❌ No modal found');
    return null;
  }
  
  const state = {
    visible: !modal.classList.contains('hidden'),
    hasBlackBg: modal.classList.contains('bg-black') || !!modal.querySelector('.bg-black'),
    formFields: modal.querySelectorAll('input').length,
    hasPaymentMethods: modal.textContent.includes('Metode Pembayaran'),
    hasOfflineMode: modal.textContent.includes('Mode Offline')
  };
  
  console.log('🔍 Modal State:', state);
  return state;
}

// Auto-run
diagnosePurchaseFlowIssues();

// Make functions globally available
window.diagnosePurchaseFlowIssues = diagnosePurchaseFlowIssues;
window.testAPI = testAPI;
window.checkModalState = checkModalState;
