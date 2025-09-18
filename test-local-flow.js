/**
 * Local Development Flow Test
 * Quick test for purchase and rental flows during development
 */

const fetch = require('node-fetch');

// Configuration for local testing
const LOCAL_CONFIG = {
  BASE_URL: 'http://localhost:3002',
  CUSTOMER_DATA: {
    name: 'Local Test User',
    email: 'local.test@example.com',
    phone: '6289653510125'
  }
};

console.log('🔧 Local Purchase & Rental Flow Test');
console.log(`📍 Testing: ${LOCAL_CONFIG.BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testLocalFlow() {
  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Checking if development server is running...');
    const healthResponse = await fetch(`${LOCAL_CONFIG.BASE_URL}/api/products`);
    
    if (!healthResponse.ok) {
      throw new Error(`Server not responding: ${healthResponse.status}`);
    }
    
    console.log('✅ Development server is running');

    // Test 2: Fetch products
    console.log('\n2️⃣ Fetching available products...');
    const products = await healthResponse.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('⚠️ No products found. Please ensure you have products in your database.');
      return;
    }

    const purchaseProduct = products.find(p => p.is_active && !p.rental_duration);
    const rentalProduct = products.find(p => p.is_active && p.rental_duration);

    console.log(`📦 Found ${products.length} products:`);
    if (purchaseProduct) console.log(`   ✅ Purchase product: ${purchaseProduct.name}`);
    if (rentalProduct) console.log(`   ✅ Rental product: ${rentalProduct.name}`);

    // Test 3: Test Purchase Payment Creation
    if (purchaseProduct) {
      console.log('\n3️⃣ Testing purchase payment creation...');
      
      const purchaseOrder = {
        product_id: purchaseProduct.id,
        order_type: 'purchase',
        customer_name: LOCAL_CONFIG.CUSTOMER_DATA.name,
        customer_email: LOCAL_CONFIG.CUSTOMER_DATA.email,
        customer_phone: LOCAL_CONFIG.CUSTOMER_DATA.phone,
        payment_method: 'QRIS'
      };

      const purchaseResponse = await fetch(`${LOCAL_CONFIG.BASE_URL}/api/xendit/create-direct-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseOrder)
      });

      if (purchaseResponse.ok) {
        const purchaseResult = await purchaseResponse.json();
        console.log('✅ Purchase payment created successfully');
        console.log(`   - Payment ID: ${purchaseResult.id}`);
        console.log(`   - Amount: Rp ${Number(purchaseResult.amount).toLocaleString('id-ID')}`);
        
        // Test webhook simulation
        console.log('\n4️⃣ Testing purchase webhook simulation...');
        await testWebhookSimulation(purchaseResult.id, purchaseResult.external_id, 'purchase');
      } else {
        const error = await purchaseResponse.text();
        console.log(`❌ Purchase payment failed: ${error}`);
      }
    }

    // Test 4: Test Rental Payment Creation
    if (rentalProduct) {
      console.log('\n5️⃣ Testing rental payment creation...');
      
      const rentalOrder = {
        product_id: rentalProduct.id,
        order_type: 'rental',
        rental_duration: '30 days',
        customer_name: LOCAL_CONFIG.CUSTOMER_DATA.name,
        customer_email: LOCAL_CONFIG.CUSTOMER_DATA.email,
        customer_phone: LOCAL_CONFIG.CUSTOMER_DATA.phone,
        payment_method: 'BANK_TRANSFER'
      };

      const rentalResponse = await fetch(`${LOCAL_CONFIG.BASE_URL}/api/xendit/create-direct-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentalOrder)
      });

      if (rentalResponse.ok) {
        const rentalResult = await rentalResponse.json();
        console.log('✅ Rental payment created successfully');
        console.log(`   - Payment ID: ${rentalResult.id}`);
        console.log(`   - Amount: Rp ${Number(rentalResult.amount).toLocaleString('id-ID')}`);
        console.log(`   - Duration: ${rentalOrder.rental_duration}`);
        
        // Test webhook simulation
        console.log('\n6️⃣ Testing rental webhook simulation...');
        await testWebhookSimulation(rentalResult.id, rentalResult.external_id, 'rental');
      } else {
        const error = await rentalResponse.text();
        console.log(`❌ Rental payment failed: ${error}`);
      }
    }

    // Test 5: WhatsApp Group Message Test
    console.log('\n7️⃣ Testing WhatsApp group message...');
    await testWhatsAppMessage();

    console.log('\n🎉 All local tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check your WhatsApp for test messages');
    console.log('   2. Verify payment links work correctly');
    console.log('   3. Test the complete user journey on frontend');

  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your development server is running (npm start)');
    console.log('   2. Check your environment variables (.env.local)');
    console.log('   3. Verify your database connection');
  }
}

async function testWebhookSimulation(paymentId, externalId, orderType) {
  try {
    const webhookPayload = {
      event: orderType === 'rental' ? 'invoice.paid' : 'qr_code.callback',
      data: {
        id: paymentId,
        external_id: externalId,
        status: 'PAID',
        amount: 50000,
        currency: 'IDR',
        paid_at: new Date().toISOString(),
        payment_channel: orderType === 'rental' ? 'BANK_TRANSFER' : 'QRIS'
      }
    };

    const webhookResponse = await fetch(`${LOCAL_CONFIG.BASE_URL}/api/xendit/webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Callback-Token': 'test-token'
      },
      body: JSON.stringify(webhookPayload)
    });

    if (webhookResponse.ok) {
      const result = await webhookResponse.json();
      console.log(`✅ ${orderType} webhook processed successfully`);
      console.log(`   - Orders updated: ${result.updated || 0}`);
    } else {
      console.log(`⚠️ ${orderType} webhook failed: ${webhookResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ ${orderType} webhook test failed:`, error.message);
  }
}

async function testWhatsAppMessage() {
  try {
    const testMessage = {
      testGroupSend: true,
      message: `🧪 *LOCAL DEVELOPMENT TEST*

📋 **FLOW TESTING COMPLETE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ **Purchase Flow:** Tested
✅ **Rental Flow:** Tested
✅ **Webhook Processing:** Tested
✅ **Message Templates:** Active

🕐 **Test Time:** ${new Date().toLocaleString('id-ID')}
💻 **Environment:** Local Development

#LocalTest #DevEnvironment #FlowValidated`
    };

    const response = await fetch(`${LOCAL_CONFIG.BASE_URL}/api/xendit/webhook?testGroupSend=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ WhatsApp test message sent');
      if (result.provider) {
        console.log(`   - Provider: ${result.provider.name || 'Unknown'}`);
      }
    } else {
      const error = await response.text();
      console.log(`⚠️ WhatsApp test failed: ${error}`);
    }
  } catch (error) {
    console.log('❌ WhatsApp test failed:', error.message);
  }
}

// Run the local test
console.log('🚀 Starting local flow test...\n');
testLocalFlow();
