/**
 * Debug script to test flash sales navigation
 * Run this in the browser console on the flash sales page
 */

// Function to inspect flash sale cards and their navigation
function debugFlashSalesNavigation() {
  console.log('🔍 Debugging Flash Sales Navigation...');
  
  // Find all flash sale cards
  const flashSaleCards = document.querySelectorAll('a[href*="/products/"]');
  
  console.log(`Found ${flashSaleCards.length} flash sale card links`);
  
  flashSaleCards.forEach((card, index) => {
    const href = card.getAttribute('href');
    const productName = card.querySelector('[class*="text-white"][class*="font-semibold"]')?.textContent?.trim();
    
    console.log(`Card ${index + 1}:`);
    console.log(`  - Product: ${productName || 'Unknown'}`);
    console.log(`  - Link: ${href}`);
    console.log(`  - Element:`, card);
    
    // Check if clicking is working
    card.addEventListener('click', (e) => {
      console.log(`🖱️ Clicked on card ${index + 1}: ${productName}`);
      console.log(`  - Navigating to: ${href}`);
    });
  });
  
  // Also check for any JavaScript errors
  window.addEventListener('error', (e) => {
    console.error('❌ JavaScript Error:', e.error);
  });
  
  console.log('✅ Debug setup complete. Click on flash sale cards to see navigation logs.');
}

// Function to check if React Router is working
function checkReactRouter() {
  console.log('🔍 Checking React Router...');
  
  // Check if react-router-dom is loaded
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  }
  
  // Check current route
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  
  // Test navigation programmatically
  const testProductId = 'test-product-123';
  const testUrl = `/products/${testProductId}`;
  
  console.log(`🧪 Testing navigation to: ${testUrl}`);
  
  // This would test if the routing works
  // history.pushState(null, '', testUrl);
}

// Function to check flash sales data
function checkFlashSalesData() {
  console.log('🔍 Checking Flash Sales Data...');
  
  // Try to access React component data (if available)
  const reactFiberKey = Object.keys(document.querySelector('#root')).find(key => 
    key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
  );
  
  if (reactFiberKey) {
    console.log('✅ React fiber found, component data may be accessible');
  }
  
  // Check for any data in localStorage or sessionStorage
  console.log('LocalStorage keys:', Object.keys(localStorage));
  console.log('SessionStorage keys:', Object.keys(sessionStorage));
}

// Run all debug functions
function runAllDebugChecks() {
  console.clear();
  console.log('🚀 Starting Flash Sales Navigation Debug');
  console.log('==========================================');
  
  debugFlashSalesNavigation();
  checkReactRouter();
  checkFlashSalesData();
  
  console.log('==========================================');
  console.log('✅ Debug complete. Check the logs above for issues.');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugFlashSalesNavigation,
    checkReactRouter,
    checkFlashSalesData,
    runAllDebugChecks
  };
} else {
  // Browser environment
  window.debugFlashSales = {
    debugFlashSalesNavigation,
    checkReactRouter,
    checkFlashSalesData,
    runAllDebugChecks
  };
  
  console.log('🛠️ Flash Sales Debug Tools loaded!');
  console.log('Run debugFlashSales.runAllDebugChecks() to start debugging');
}
