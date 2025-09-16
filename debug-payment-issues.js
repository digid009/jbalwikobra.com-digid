/**
 * Debug Payment Issues Script
 * Run this in the browser console on localhost:3003 or production
 */

// Debug Flash Sale Card Navigation
window.debugFlashSaleNavigation = function() {
  console.log('🔍 Debug: Flash Sale Card Navigation');
  
  // Check if we're on the flash sales page
  const isFlashSalesPage = window.location.pathname === '/flash-sales';
  console.log('📍 Current page:', window.location.pathname);
  console.log('⚡ Is Flash Sales Page:', isFlashSalesPage);
  
  // Find flash sale cards
  const flashSaleCards = document.querySelectorAll('[data-testid="flash-sale-card"], .cursor-pointer');
  console.log('🎴 Flash Sale Cards Found:', flashSaleCards.length);
  
  // Check if cards have click handlers
  flashSaleCards.forEach((card, index) => {
    console.log(`Card ${index + 1}:`, {
      hasOnClick: !!card.onclick,
      hasEventListeners: card.getEventListeners ? card.getEventListeners() : 'Check DevTools',
      textContent: card.textContent?.substring(0, 50) + '...'
    });
  });
  
  // Find buy buttons
  const buyButtons = document.querySelectorAll('button:contains("Beli"), [data-testid="buy-button"]');
  console.log('🛒 Buy Buttons Found:', buyButtons.length);
  
  return {
    isFlashSalesPage,
    cardCount: flashSaleCards.length,
    buttonCount: buyButtons.length
  };
};

// Debug Payment Methods
window.debugPaymentMethods = function() {
  console.log('💳 Debug: Payment Methods');
  
  // Check if checkout modal is open
  const modal = document.querySelector('[data-testid="checkout-modal"], .fixed.inset-0');
  const isModalOpen = modal && !modal.classList.contains('hidden');
  console.log('🛒 Checkout Modal Open:', isModalOpen);
  
  if (!isModalOpen) {
    console.log('ℹ️ Open checkout modal to debug payment methods');
    return { modalOpen: false };
  }
  
  // Find payment method sections
  const paymentSection = modal.querySelector('[data-testid="payment-methods"]') || 
                         modal.querySelector(':contains("Metode Pembayaran")');
  console.log('💳 Payment Section Found:', !!paymentSection);
  
  // Check for QRIS specifically
  const qrisElements = modal.querySelectorAll('*');
  let qrisFound = false;
  qrisElements.forEach(el => {
    if (el.textContent?.toLowerCase().includes('qris')) {
      qrisFound = true;
      console.log('📱 QRIS Found:', el.textContent.trim());
    }
  });
  
  console.log('📱 QRIS Detected:', qrisFound);
  
  // Check for expanded groups
  const expandedGroups = modal.querySelectorAll('.space-y-2, [data-expanded="true"]');
  console.log('📂 Expanded Groups:', expandedGroups.length);
  
  // Check for popular methods section
  const popularSection = modal.querySelector(':contains("Metode Populer")');
  console.log('⭐ Popular Methods Section:', !!popularSection);
  
  return {
    modalOpen: isModalOpen,
    paymentSectionFound: !!paymentSection,
    qrisDetected: qrisFound,
    expandedGroups: expandedGroups.length,
    popularSectionExists: !!popularSection
  };
};

// Auto-run basic checks
console.log('🔧 Payment Debug Helper Loaded!');
console.log('📖 Available commands:');
console.log('   debugFlashSaleNavigation() - Check flash sale card issues');
console.log('   debugPaymentMethods() - Check QRIS and payment method issues');

// Quick page check
if (window.location.pathname.includes('flash-sales')) {
  console.log('⚡ Flash Sales page detected - run debugFlashSaleNavigation()');
}

if (window.location.pathname.includes('products/')) {
  console.log('📦 Product detail page detected - try opening checkout to debug payments');
}
