// Quick Payment Test - Copy this entire block and paste in browser console

console.log('🎬 Quick Payment Test for www.jbalwikobra.com');
console.log('='.repeat(50));

// Test payment methods API immediately
fetch('/api/xendit/payment-methods', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 50000 })
})
.then(response => {
  console.log('📥 Status:', response.status);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`API failed with status ${response.status}`);
  }
})
.then(data => {
  console.log('📊 RESULTS:');
  console.log('  Source:', data.source);
  console.log('  Methods:', data.payment_methods?.length || 0);
  
  if (data.source === 'xendit_api') {
    console.log('✅ SUCCESS: Mode Offline should be GONE!');
  } else {
    console.log('❌ ISSUE: Still showing Mode Offline');
  }
  
  console.log('💳 Payment Methods:');
  (data.payment_methods || []).slice(0, 3).forEach(method => {
    console.log(`  - ${method.name}`);
  });
})
.catch(error => {
  console.log('❌ Error:', error.message);
});

console.log('⏳ Testing... results will appear below...');
