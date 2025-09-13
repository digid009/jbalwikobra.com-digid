// Open browser console and run this to debug FlashSalesPage rendering
console.clear();
console.log('🔍 FLASH SALES PAGE DEBUG');

// Check if we're on the flash sales page
if (window.location.pathname === '/flash-sales' || window.location.pathname === '/flash-sales/') {
  console.log('✅ On Flash Sales Page');
  
  // Wait a bit for React to render
  setTimeout(() => {
    console.log('\n📊 CHECKING PRODUCT CARDS:');
    
    const productCards = document.querySelectorAll('[class*="product"], [class*="card"]');
    console.log(`Found ${productCards.length} potential product cards`);
    
    const flashSaleTimers = document.querySelectorAll('[class*="timer"], [class*="countdown"]');
    console.log(`Found ${flashSaleTimers.length} potential timer elements`);
    
    const discountBadges = document.querySelectorAll('[class*="discount"], [class*="badge"]');
    console.log(`Found ${discountBadges.length} potential discount badges`);
    
    const priceElements = document.querySelectorAll('[class*="price"]');
    console.log(`Found ${priceElements.length} potential price elements`);
    
    // Look for specific flash sale indicators
    const clockIcons = document.querySelectorAll('[class*="lucide"], svg');
    console.log(`Found ${clockIcons.length} potential icons`);
    
    console.log('\n🎯 DETAILED ANALYSIS:');
    console.log('If you see products but no timers/discounts, the issue is in ProductCard rendering logic.');
    console.log('If you see no products at all, the issue is in FlashSalesPage data fetching.');
    
    // Check for any React error boundaries
    const errorElements = document.querySelectorAll('[class*="error"]');
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} potential error elements`);
    }
    
  }, 2000);
} else {
  console.log('❌ Not on Flash Sales Page. Current path:', window.location.pathname);
  console.log('Navigate to /flash-sales to test');
}
