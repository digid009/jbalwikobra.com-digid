/**
 * Test script to validate the enhanced payment flow
 * Tests the complete flow from checkout to payment interface
 */

async function testEnhancedPaymentFlow() {
  console.log('🚀 Testing Enhanced Payment Flow...');
  console.log('=' .repeat(60));
  
  // Test different payment methods
  const testMethods = [
    { id: 'qris', name: 'QRIS', expectedInterface: 'QR Code' },
    { id: 'bca', name: 'BCA Virtual Account', expectedInterface: 'Virtual Account' },
    { id: 'dana', name: 'DANA', expectedInterface: 'E-Wallet Redirect' },
    { id: 'gopay', name: 'GoPay', expectedInterface: 'E-Wallet Redirect' }
  ];
  
  for (const method of testMethods) {
    console.log(`\n🧪 Testing ${method.name}...`);
    
    try {
      // Step 1: Create a direct payment
      const paymentPayload = {
        amount: 50000,
        currency: 'IDR',
        payment_method_id: method.id,
        customer: {
          given_names: 'Test User',
          email: 'test@example.com',
          mobile_number: '+6281234567890'
        },
        description: `Test Payment - ${method.name}`,
        external_id: `test_${method.id}_${Date.now()}`,
        success_redirect_url: 'https://jbalwikobra.com/payment-status?status=success',
        failure_redirect_url: 'https://jbalwikobra.com/payment-status?status=failed'
      };
      
      console.log(`   📤 Creating ${method.name} payment...`);
      const createResponse = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.log(`   ❌ ${method.name} creation failed:`, errorData.error);
        continue;
      }
      
      const paymentData = await createResponse.json();
      console.log(`   ✅ ${method.name} payment created:`, paymentData.id);
      
      // Step 2: Test getting payment data
      console.log(`   📥 Fetching payment data...`);
      const getResponse = await fetch(`/api/xendit/get-payment?id=${paymentData.id}`);
      
      if (!getResponse.ok) {
        console.log(`   ⚠️  ${method.name} get payment failed - may not be stored yet`);
        continue;
      }
      
      const retrievedData = await getResponse.json();
      console.log(`   ✅ ${method.name} data retrieved successfully`);
      
      // Step 3: Validate the interface data
      console.log(`   🔍 Validating ${method.expectedInterface} interface...`);
      
      if (method.id === 'qris' && retrievedData.qr_string) {
        console.log(`   ✅ QRIS QR code available`);
      } else if (['bca', 'bni', 'mandiri'].includes(method.id) && retrievedData.account_number) {
        console.log(`   ✅ Virtual Account number: ${retrievedData.account_number}`);
      } else if (['dana', 'gopay'].includes(method.id) && retrievedData.payment_url) {
        console.log(`   ✅ E-Wallet redirect URL available`);
      } else {
        console.log(`   ⚠️  Expected interface data not found for ${method.name}`);
        console.log('      Available fields:', Object.keys(retrievedData));
      }
      
      // Step 4: Test the payment interface URL
      const paymentInterfaceUrl = `/payment?id=${paymentData.id}&method=${method.id}&amount=50000&external_id=${paymentPayload.external_id}&description=${encodeURIComponent(paymentPayload.description)}`;
      console.log(`   🌐 Payment interface URL: ${paymentInterfaceUrl}`);
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   💥 ${method.name} test error:`, error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Enhanced Payment Flow Test Complete!');
  console.log('\n💡 To test manually:');
  console.log('1. Go to any product page');
  console.log('2. Click "Beli Sekarang"');
  console.log('3. Fill the form and select a payment method');
  console.log('4. Click "Bayar Sekarang"');
  console.log('5. You should see the specific payment interface instead of generic Xendit page');
  console.log('\n📱 For QRIS: QR code display');
  console.log('🏦 For Virtual Account: Account number and instructions');
  console.log('💳 For E-Wallets: Direct app redirect (Dana, GoPay) or custom interface');
}

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  // Running in browser
  testEnhancedPaymentFlow();
} else {
  // Running in Node.js
  console.log('This script should be run in the browser console');
  console.log('Copy and paste the testEnhancedPaymentFlow function into the browser console on https://jbalwikobra.com');
}
