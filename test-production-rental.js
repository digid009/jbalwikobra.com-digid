/**
 * Production Rental Flow Test
 * Creates a rental payment via /api/xendit/create-direct-payment with proper order payload
 */

const PRODUCTION_URL = 'https://www.jbalwikobra.com';
const TEST_AMOUNT = 25000;

async function run() {
  console.log('🚀 Production Rental Flow Test');
  console.log('🌐 URL:', PRODUCTION_URL);
  console.log('💰 Amount:', TEST_AMOUNT);
  console.log('='.repeat(60));

  const externalId = `test_rental_${Date.now()}`;
  const payload = {
    amount: TEST_AMOUNT,
    currency: 'IDR',
    payment_method_id: 'qris',
    customer: {
      given_names: 'Test Rental User',
      email: 'test+rental@jbalwikobra.com',
      mobile_number: '+628123456789'
    },
    description: 'Production Test Rental',
    external_id: externalId,
    success_redirect_url: `${PRODUCTION_URL}/payment-success`,
    failure_redirect_url: `${PRODUCTION_URL}/payment-failed`,
    order: {
      customer_name: 'Test Rental User',
      customer_email: 'test+rental@jbalwikobra.com',
      customer_phone: '+628123456789',
      order_type: 'rental',
      amount: TEST_AMOUNT,
      rental_duration: '1 hari',
      product_id: null,
      user_id: null
    }
  };

  try {
    const res = await fetch(`${PRODUCTION_URL}/api/xendit/create-direct-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('📊 Status:', res.status);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (res.ok) {
        console.log('✅ Rental payment created');
        console.log('🆔 ID:', data.id);
        console.log('⏰ Status:', data.status);
        if (data.qr_string || data.payment_url) {
          console.log('🔗 Payment info present');
        }
        console.log('ℹ️ Note: Complete the payment to trigger the webhook and WhatsApp notifications.');
      } else {
        console.error('❌ API error:', data);
      }
    } catch (e) {
      console.error('❌ Non-JSON response:', text);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

run();
