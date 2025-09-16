/**
 * Browser Console Debug Helper for Payment Flow Testing
 * Copy and paste this into the browser console on localhost:3003
 */

// Payment Flow Debug Helper
window.PaymentFlowDebug = {
  
  // Check if we're on a product detail page
  checkProductPage() {
    const url = window.location.pathname;
    const isProductPage = url.includes('/product/');
    console.log('🔍 Product Page Check:', isProductPage ? '✅ YES' : '❌ NO');
    console.log('📍 Current URL:', url);
    return isProductPage;
  },

  // Get current product data from page
  getProductData() {
    try {
      // Look for product data in various places
      const productElements = document.querySelectorAll('[data-product-id], [data-testid*="product"]');
      const priceElements = document.querySelectorAll('[data-testid*="price"], .text-pink-400, .text-green-400');
      
      console.log('🛍️ Product Elements Found:', productElements.length);
      console.log('💰 Price Elements Found:', priceElements.length);
      
      // Try to extract product info
      const titleElement = document.querySelector('h1, [data-testid="product-title"]');
      const priceElement = document.querySelector('.text-pink-400, .text-green-400');
      
      const productData = {
        title: titleElement?.textContent || 'Not found',
        price: priceElement?.textContent || 'Not found',
        url: window.location.href
      };
      
      console.log('📦 Product Data:', productData);
      return productData;
    } catch (error) {
      console.error('❌ Error getting product data:', error);
      return null;
    }
  },

  // Check if checkout modal is present
  checkCheckoutModal() {
    const modal = document.querySelector('[data-testid="checkout-modal"], .fixed.inset-0, .backdrop-blur-sm');
    const isVisible = modal && !modal.classList.contains('hidden');
    
    console.log('🛒 Checkout Modal:', isVisible ? '✅ VISIBLE' : '❌ HIDDEN');
    
    if (modal) {
      const modalContent = {
        hasBlackBackground: modal.classList.contains('bg-black') || 
                           modal.querySelector('.bg-black'),
        hasPriceDisplay: !!modal.querySelector('[data-testid="price-display"]') ||
                        !!modal.textContent.includes('Ringkasan Pembayaran'),
        hasCustomerForm: !!modal.querySelector('input[type="text"], input[type="email"]'),
        hasPaymentMethods: !!modal.textContent.includes('Metode Pembayaran'),
        formFields: modal.querySelectorAll('input').length
      };
      
      console.log('📋 Modal Content Check:', modalContent);
      return modalContent;
    }
    
    return null;
  },

  // Check flash sale features
  checkFlashSaleFeatures() {
    const isFlashSalePage = window.location.pathname.includes('flash-sale');
    const hasCountdownTimer = !!document.querySelector('[data-testid="countdown"], .countdown, .timer');
    const hasDiscountDisplay = !!document.querySelector('.line-through, [data-testid="original-price"]');
    const hasRentalOptions = !!document.querySelector('[data-testid="rental-options"]');
    
    const flashSaleData = {
      isFlashSalePage,
      hasCountdownTimer,
      hasDiscountDisplay,
      hasRentalOptions,
      currentTime: new Date().toISOString()
    };
    
    console.log('⚡ Flash Sale Check:', flashSaleData);
    return flashSaleData;
  },

  // Monitor form validation
  testFormValidation() {
    const forms = document.querySelectorAll('form');
    console.log('📝 Forms Found:', forms.length);
    
    forms.forEach((form, index) => {
      console.log(`Form ${index + 1}:`, {
        fields: form.querySelectorAll('input').length,
        hasSubmitButton: !!form.querySelector('button[type="submit"], .submit'),
        action: form.action || 'No action'
      });
      
      // Add form submission listener
      form.addEventListener('submit', (e) => {
        console.log('📤 Form Submission Attempt:', {
          formIndex: index,
          formData: new FormData(form),
          timestamp: new Date().toISOString()
        });
      });
    });
  },

  // Check for JavaScript errors
  checkForErrors() {
    const errorCount = window.__errorCount || 0;
    console.log('🐛 JavaScript Errors:', errorCount);
    
    // Listen for future errors
    window.addEventListener('error', (e) => {
      console.error('🚨 JavaScript Error Detected:', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        error: e.error
      });
      window.__errorCount = (window.__errorCount || 0) + 1;
    });
  },

  // Run comprehensive test
  runAllChecks() {
    console.log('🚀 Running Payment Flow Debug Checks...');
    console.log('=' .repeat(50));
    
    this.checkProductPage();
    this.getProductData();
    this.checkCheckoutModal();
    this.checkFlashSaleFeatures();
    this.testFormValidation();
    this.checkForErrors();
    
    console.log('=' .repeat(50));
    console.log('✅ All checks completed! Review results above.');
    console.log('💡 To open checkout modal, click "Beli Sekarang" or "Sewa Sekarang"');
  },

  // Quick UI check
  checkUIImprovements() {
    console.log('🎨 Checking UI Improvements...');
    
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      const improvements = {
        hasBlackBg: modal.classList.contains('bg-black') || 
                   modal.querySelector('.bg-black'),
        noPriceDisplay: !modal.textContent.includes('Ringkasan Pembayaran'),
        hasCleanLayout: modal.querySelectorAll('.space-y-4, .space-y-6').length > 0
      };
      
      console.log('✨ UI Improvements:', improvements);
      
      if (improvements.hasBlackBg && improvements.noPriceDisplay) {
        console.log('🎉 UI improvements successfully applied!');
      } else {
        console.log('⚠️ Some UI improvements may be missing');
      }
    } else {
      console.log('ℹ️ No modal visible. Open checkout to test UI improvements.');
    }
  }
};

// Auto-run basic checks
console.log('🔧 Payment Flow Debug Helper Loaded!');
console.log('📖 Available commands:');
console.log('   PaymentFlowDebug.runAllChecks() - Run all tests');
console.log('   PaymentFlowDebug.checkUIImprovements() - Check UI changes');
console.log('   PaymentFlowDebug.checkCheckoutModal() - Check modal state');
console.log('   PaymentFlowDebug.checkFlashSaleFeatures() - Check flash sale features');

// Run a quick initial check
PaymentFlowDebug.checkProductPage();
PaymentFlowDebug.checkForErrors();
