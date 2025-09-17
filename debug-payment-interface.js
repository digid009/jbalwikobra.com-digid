/**
 * Debug script to check payment interface data
 * Run this in browser console on the payment page
 */

console.log('🔍 Payment Interface Debug...');

// Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
console.log('📋 URL Parameters:');
console.log('  ID:', urlParams.get('id'));
console.log('  Method:', urlParams.get('method'));
console.log('  Amount:', urlParams.get('amount'));
console.log('  External ID:', urlParams.get('external_id'));
console.log('  Description:', urlParams.get('description'));

// Check if we can fetch payment data
const paymentId = urlParams.get('id');
if (paymentId) {
  console.log('\n📡 Fetching payment data...');
  
  fetch(`/api/xendit/get-payment?id=${paymentId}`)
    .then(response => {
      console.log('📥 Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('💳 Payment Data:', data);
      
      if (data.qr_string) {
        console.log('✅ QR Code available:', data.qr_string.substring(0, 50) + '...');
      } else {
        console.log('⚠️ No QR code in payment data');
      }
      
      if (data.payment_url) {
        console.log('🌐 Payment URL:', data.payment_url);
      }
      
      if (data.account_number) {
        console.log('🏦 Account Number:', data.account_number);
      }
    })
    .catch(error => {
      console.error('❌ Error fetching payment data:', error);
    });
} else {
  console.log('⚠️ No payment ID in URL');
}

// Check what's actually rendered in the payment interface
setTimeout(() => {
  console.log('\n🎨 UI Elements Check:');
  
  const qrElement = document.querySelector('img[alt="QRIS QR Code"]');
  if (qrElement) {
    console.log('📱 QR Image found:', qrElement.src.substring(0, 50) + '...');
  } else {
    console.log('📱 QR Image not found');
  }
  
  const amountElement = document.querySelector('*:contains("Rp")');
  console.log('💰 Amount display found:', !!amountElement);
  
  const statusElement = document.querySelector('*:contains("Menunggu")');
  console.log('📊 Status display found:', !!statusElement);
  
}, 1000);
