/**
 * Comprehensive Payment Flow Test for www.jbalwikobra.com
 * Run this in browser console on the live site
 */

async function testJBalWikobraPaymentFlow() {
  console.log('🚀 Testing Payment Flow on www.jbalwikobra.com');
  console.log('=' .repeat(60));
  
  // Step 1: Test Payment Methods API
  console.log('\n📋 Step 1: Testing Payment Methods API...');
  
  try {
    const response = await fetch('/api/xendit/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 })
    });
    
    console.log('📥 Payment Methods API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 API Response Analysis:');
      console.log('  Source:', data.source);
      console.log('  Methods Count:', data.payment_methods?.length || 0);
      
      if (data.source === 'xendit_api') {
        console.log('✅ SUCCESS: API is online - "Mode Offline" should be gone!');
      } else if (data.source === 'fallback') {
        console.log('⚠️  WARNING: Still in fallback mode - "Mode Offline" will show');
        console.log('   This indicates Xendit API credentials may need checking');
      } else {
        console.log('❓ UNKNOWN: Unexpected source:', data.source);
      }
      
      // Show some available methods
      if (data.payment_methods?.length > 0) {
        console.log('💳 Available Payment Methods:');
        data.payment_methods.slice(0, 5).forEach(method => {
          console.log(`  - ${method.name} (${method.type})`);
        });
      }
    } else {
      console.log('❌ Payment Methods API failed:', response.status);
    }
    
  } catch (error) {
    console.log('💥 Payment Methods API Error:', error.message);
  }
  
  // Step 2: Check Frontend Payment Methods Display
  console.log('\n🎨 Step 2: Checking Frontend Display...');
  
  // Look for checkout modal or payment methods section
  const modal = document.querySelector('[data-testid="checkout-modal"], .fixed.inset-0');
  
  // Find payment section by text content using proper DOM traversal
  let paymentSection = null;
  const allElements = document.querySelectorAll('*');
  for (let element of allElements) {
    if (element.textContent && element.textContent.includes('Metode Pembayaran')) {
      paymentSection = element;
      break;
    }
  }
  
  if (modal || paymentSection) {
    console.log('📱 Payment interface found on page');
    
    // Check for "Mode Offline" indicator using text search
    let offlineIndicator = null;
    for (let element of allElements) {
      if (element.textContent && element.textContent.includes('Mode Offline')) {
        offlineIndicator = element;
        break;
      }
    }
    
    if (offlineIndicator) {
      console.log('❌ "Mode Offline" still visible in UI');
      console.log('   Element:', offlineIndicator.textContent.trim());
    } else {
      console.log('✅ No "Mode Offline" indicator found in UI');
    }
    
    // Check for payment methods using proper selectors
    const methods = document.querySelectorAll('[class*="payment"], [class*="method"], button[class*="qris"], button[class*="bca"], button[class*="dana"]');
    
    // Also search for payment method text content
    let paymentMethodCount = methods.length;
    for (let element of allElements) {
      if (element.textContent && (
        element.textContent.includes('QRIS') || 
        element.textContent.includes('BCA') || 
        element.textContent.includes('DANA') ||
        element.textContent.includes('GoPay') ||
        element.textContent.includes('OVO')
      )) {
        paymentMethodCount++;
      }
    }
    
    console.log('💳 Payment method elements found:', paymentMethodCount);
    
  } else {
    console.log('ℹ️  No payment interface currently visible');
    console.log('💡 To test: Go to a product page and click "Beli Sekarang"');
  }
  
  // Step 3: Test Direct Payment Creation (if we have test data)
  console.log('\n⚡ Step 3: Testing Direct Payment Creation...');
  
  try {
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
    
    console.log('📤 Creating test QRIS payment...');
    const paymentResponse = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📥 Direct Payment Status:', paymentResponse.status);
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ Payment created successfully!');
      console.log('🆔 Payment ID:', paymentData.id);
      console.log('📱 Has QR String:', !!paymentData.qr_string);
      console.log('🌐 Has Payment URL:', !!paymentData.payment_url);
      
      // Test the payment interface URL
      const interfaceUrl = `/payment?id=${paymentData.id}&method=qris&amount=50000&external_id=${testPayload.external_id}&description=${encodeURIComponent(testPayload.description)}`;
      console.log('🔗 Payment Interface URL:', interfaceUrl);
      
      // Test getting payment data
      console.log('\n📡 Testing payment data retrieval...');
      const getResponse = await fetch(`/api/xendit/get-payment?id=${paymentData.id}`);
      
      if (getResponse.ok) {
        const retrievedData = await getResponse.json();
        console.log('✅ Payment data retrieved successfully');
        console.log('💾 Retrieved data has QR:', !!retrievedData.qr_string);
      } else {
        console.log('⚠️  Could not retrieve payment data:', getResponse.status);
      }
      
    } else {
      const errorData = await paymentResponse.json();
      console.log('❌ Payment creation failed:', errorData.error);
    }
    
  } catch (error) {
    console.log('💥 Payment creation error:', error.message);
  }
  
  // Step 4: Summary and Recommendations
  console.log('\n' + '=' .repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('\n🎯 Key Points to Check:');
  console.log('1. Is "Mode Offline" gone from payment methods?');
  console.log('2. Do payment methods load without fallback indicator?');
  console.log('3. Can you create real payments with QR codes?');
  console.log('4. Does the payment interface show real data?');
  
  console.log('\n🧪 Manual Test Steps:');
  console.log('1. Go to any product page');
  console.log('2. Click "Beli Sekarang"');
  console.log('3. Fill in customer information');
  console.log('4. Select QRIS payment method');
  console.log('5. Click "Bayar Sekarang"');
  console.log('6. Should see real QR code instead of placeholder');
  
  console.log('\n✅ Success Indicators:');
  console.log('- No "Mode Offline" in payment methods');
  console.log('- Real QR codes in payment interface');
  console.log('- Xendit API source = "xendit_api"');
  console.log('- Smooth payment flow without errors');
}

// Auto-run the test with proper error handling
console.log('🎬 Starting JBalWikobra Payment Flow Test...');
testJBalWikobraPaymentFlow()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
  });
