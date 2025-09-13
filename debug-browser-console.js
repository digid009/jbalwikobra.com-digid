// Flash Sales Debug Console Script
// Run this in browser developer console to debug flash sales data

console.log('🔍 Flash Sales Debug Started');

// Check if we're on the flash sales page
if (window.location.pathname.includes('flash-sales')) {
  console.log('✅ On Flash Sales page');
  
  // Wait for React to load data
  setTimeout(() => {
    console.log('🔍 Checking for flash sales data...');
    
    // Look for product cards
    const productCards = document.querySelectorAll('[class*="ProductCard"], .group');
    console.log(`Found ${productCards.length} product cards`);
    
    // Check for flash sale timers
    const flashSaleTimers = document.querySelectorAll('[class*="flash"], [class*="timer"], [class*="countdown"]');
    console.log(`Found ${flashSaleTimers.length} potential flash sale timers`);
    
    // Check for discount badges
    const discountBadges = document.querySelectorAll('*[class*="red-"], *:contains("%")');
    console.log(`Found ${discountBadges.length} potential discount badges`);
    
    // Check for price elements
    const priceElements = document.querySelectorAll('*[class*="price"], *[class*="currency"]');
    console.log(`Found ${priceElements.length} price elements`);
    
    // Try to find React data
    if (window.React || window._reactInternalFiber) {
      console.log('✅ React detected');
    }
    
    console.log('🔍 Page HTML structure:');
    console.log(document.querySelector('main, [role="main"], body > div')?.outerHTML?.substring(0, 500) + '...');
    
  }, 3000);
} else {
  console.log('❌ Not on flash sales page');
  console.log('Current path:', window.location.pathname);
}

// Function to manually check data
window.debugFlashSales = function() {
  console.log('🔄 Manual flash sales debug...');
  const app = document.getElementById('root');
  if (app) {
    console.log('Found React root');
    // Try to access React internals (dev only)
    const reactKey = Object.keys(app).find(key => key.startsWith('_react'));
    if (reactKey) {
      console.log('Found React key:', reactKey);
    }
  }
};

console.log('💡 Run debugFlashSales() to manually check data');
