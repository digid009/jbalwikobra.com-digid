/**
 * Simple Payment Flow Test for www.jbalwikobra.com
 * Run this in browser console - shows results immediately
 */

// Function to test payment methods API
function testPaymentMethods() {
  console.log('🚀 Testing Payment Methods API...');
  
  fetch('/api/xendit/payment-methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 50000 })
  })
  .then(response => {
    console.log('📥 Payment Methods API Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 API Response Analysis:');
    console.log('  Source:', data.source);
    console.log('  Methods Count:', data.payment_methods?.length || 0);
    
    if (data.source === 'xendit_api') {
      console.log('✅ SUCCESS: API is online - "Mode Offline" should be gone!');
    } else if (data.source === 'fallback') {
      console.log('⚠️  WARNING: Still in fallback mode - "Mode Offline" will show');
    } else {
      console.log('❓ UNKNOWN: Unexpected source:', data.source);
    }
    
    // Show payment methods
    if (data.payment_methods?.length > 0) {
      console.log('💳 Available Payment Methods:');
      data.payment_methods.slice(0, 5).forEach(method => {
        console.log(`  - ${method.name} (${method.type})`);
      });
    }
  })
  .catch(error => {
    console.log('💥 Payment Methods API Error:', error.message);
  });
}

// Function to check UI for Mode Offline
function checkModeOffline() {
  console.log('🎨 Checking for "Mode Offline" in UI...');
  
  const allElements = document.querySelectorAll('*');
  let offlineFound = false;
  
  for (let element of allElements) {
    if (element.textContent && element.textContent.includes('Mode Offline')) {
      console.log('❌ "Mode Offline" found in UI:');
      console.log('   Element:', element.textContent.trim());
      offlineFound = true;
      break;
    }
  }
  
  if (!offlineFound) {
    console.log('✅ No "Mode Offline" indicator found in UI');
  }
  
  // Check for payment interface
  const modal = document.querySelector('[data-testid="checkout-modal"], .fixed.inset-0');
  if (modal) {
    console.log('📱 Payment modal is open');
  } else {
    console.log('ℹ️  No payment modal visible - go to a product and click "Beli Sekarang"');
  }
}

// Function to test payment creation
function testPaymentCreation() {
  console.log('⚡ Testing QRIS Payment Creation...');
  
  const testPayload = {
    amount: 50000,
    currency: 'IDR',
    payment_method_id: 'qris',
    customer: {
      given_names: 'Test User',
      email: 'test@jbalwikobra.com',
      mobile_number: '+6281234567890'
    },
    description: 'Test Payment - QRIS',
    external_id: `test_${Date.now()}`,
    success_redirect_url: 'https://jbalwikobra.com/payment-status?status=success',
    failure_redirect_url: 'https://jbalwikobra.com/payment-status?status=failed'
  };
  
  fetch('/api/xendit/create-direct-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  })
  .then(response => {
    console.log('📥 Payment Creation Status:', response.status);
    return response.json();
  })
  .then(data => {
    if (data.id) {
      console.log('✅ Payment created successfully!');
      console.log('🆔 Payment ID:', data.id);
      console.log('📱 Has QR String:', !!data.qr_string);
      console.log('🌐 Payment URL:', data.payment_url);
      
      const interfaceUrl = `/payment?id=${data.id}&method=qris&amount=50000&external_id=${testPayload.external_id}&description=${encodeURIComponent(testPayload.description)}`;
      console.log('🔗 Payment Interface URL:', interfaceUrl);
      console.log('💡 You can visit this URL to see the real QR code!');
    } else {
      console.log('❌ Payment creation failed:', data.error);
    }
  })
  .catch(error => {
    console.log('💥 Payment creation error:', error.message);
  });
}

// Run all tests immediately
console.log('🎬 JBalWikobra Payment Flow Test - Simple Version');
console.log('='.repeat(60));

// Test 1: Payment Methods API
testPaymentMethods();

// Test 2: Check UI after 1 second
setTimeout(() => {
  checkModeOffline();
}, 1000);

// Test 3: Create test payment after 2 seconds
setTimeout(() => {
  testPaymentCreation();
}, 2000);

console.log('\n📋 WHAT TO LOOK FOR:');
console.log('1. Source should be "xendit_api" (not "fallback")');
console.log('2. No "Mode Offline" text in UI');
console.log('3. Real payment creation with QR codes');
console.log('4. Valid payment interface URL generated');
