// 🔍 Quick Production Diagnostic Script
// Copy and paste this in browser console on www.jbalwikobra.com

async function quickDiagnostic() {
  console.log('🔍 Production Environment Diagnostic');
  console.log('=' .repeat(50));
  
  // Test 1: Payment Methods API
  console.log('\n1️⃣ Testing Payment Methods API...');
  try {
    const response = await fetch('/api/xendit/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment Methods API working');
      console.log('Data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Payment Methods API failed');
      console.log('Error response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', errorJson);
      } catch (e) {
        console.log('Raw error text:', errorText);
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test 2: Minimal Payment Creation
  console.log('\n2️⃣ Testing Minimal Payment Creation...');
  try {
    const minimalPayload = {
      payment_method_id: 'qris',
      amount: 10000,
      currency: 'IDR',
      external_id: `test_${Date.now()}`,
      description: 'Diagnostic Test'
    };
    
    const response = await fetch('/api/xendit/create-direct-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Minimal payment creation working');
      console.log('Payment ID:', data.id);
    } else {
      const errorText = await response.text();
      console.log('❌ Minimal payment creation failed');
      console.log('Error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', errorJson);
        
        // Check for specific error types
        if (errorJson.message && errorJson.message.includes('XENDIT_SECRET_KEY')) {
          console.log('💡 Issue: Xendit secret key not configured in production');
        } else if (errorJson.message && errorJson.message.includes('unauthorized')) {
          console.log('💡 Issue: Xendit authentication failed');
        } else if (errorJson.message && errorJson.message.includes('validation')) {
          console.log('💡 Issue: Request validation failed');
        }
      } catch (e) {
        console.log('Raw error text:', errorText);
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test 3: Check current environment
  console.log('\n3️⃣ Environment Info...');
  console.log('Domain:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  console.log('User Agent:', navigator.userAgent.substring(0, 100) + '...');
  
  console.log('\n🎯 Diagnostic complete!');
  console.log('If you see 400 errors, likely causes:');
  console.log('• Development Xendit keys not configured in production environment');
  console.log('• Environment variables missing or incorrect');
  console.log('• API endpoint validation issues');
}

// Run diagnostic
quickDiagnostic();
