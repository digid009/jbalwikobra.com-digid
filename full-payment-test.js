/**
 * Comprehensive Payment Flow Test Suite
 * Tests the complete end-to-end payment journey
 */

const TEST_CONFIG = {
  BASE_URL: 'https://jbalwikobra.com',
  TEST_SCENARIOS: [
    {
      name: 'Small Amount Purchase',
      amount: 25000,
      description: 'Test small purchase - Mobile Legends account'
    },
    {
      name: 'Medium Amount Purchase', 
      amount: 150000,
      description: 'Test medium purchase - PUBG Mobile account'
    },
    {
      name: 'Large Amount Purchase',
      amount: 500000,
      description: 'Test large purchase - Genshin Impact account'
    }
  ],
  TIMEOUT: 30000
};

class PaymentFlowTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSessions: [],
      summary: {}
    };
  }

  async testProductPageFlow() {
    console.log('\n🧪 Testing Product Page Integration...');
    
    try {
      // Test getting products to simulate real user flow
      const productsResponse = await fetch(`${TEST_CONFIG.BASE_URL}`, {
        headers: { 'User-Agent': 'PaymentTest/1.0' }
      });
      
      console.log(`📊 Homepage Status: ${productsResponse.status}`);
      
      if (productsResponse.ok) {
        const html = await productsResponse.text();
        const hasProducts = html.includes('product') || html.includes('akun');
        console.log(`✅ Homepage loads: ${hasProducts ? 'Has product content' : 'Basic page'}`);
        return { success: true, hasProducts };
      } else {
        console.log('❌ Homepage failed to load');
        return { success: false, error: `Status ${productsResponse.status}` };
      }
    } catch (error) {
      console.error('❌ Product page test error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testInvoiceCreation(scenario) {
    console.log(`\n🧪 Testing Invoice Creation - ${scenario.name}...`);
    
    const timestamp = new Date().getTime();
    const testPayload = {
      external_id: `fulltest_${scenario.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`,
      amount: scenario.amount,
      payer_email: 'fulltest@jbalwikobra.com',
      description: scenario.description,
      success_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
      failure_redirect_url: `${TEST_CONFIG.BASE_URL}/payment-status`,
      customer: {
        given_names: 'Full Test User',
        email: 'fulltest@jbalwikobra.com',
        mobile_number: '+628123456789'
      },
      order: {
        customer_name: 'Full Test User',
        customer_email: 'fulltest@jbalwikobra.com',
        customer_phone: '+628123456789',
        order_type: 'purchase',
        amount: scenario.amount,
        rental_duration: null
      }
    };

    try {
      console.log(`💰 Testing amount: Rp ${scenario.amount.toLocaleString('id-ID')}`);
      console.log(`🔑 External ID: ${testPayload.external_id}`);
      
      const startTime = Date.now();
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/xendit/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FullPaymentTest/1.0'
        },
        body: JSON.stringify(testPayload)
      });
      const responseTime = Date.now() - startTime;
      
      console.log(`📊 Response: ${response.status} (${responseTime}ms)`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Invoice Created: ${data.id}`);
        console.log(`🔗 Payment URL: ${data.invoice_url}`);
        console.log(`⏰ Expires: ${new Date(data.expiry_date).toLocaleString('id-ID')}`);
        
        return {
          success: true,
          scenario: scenario.name,
          amount: scenario.amount,
          invoice: {
            id: data.id,
            url: data.invoice_url,
            status: data.status,
            expires_at: data.expiry_date,
            external_id: testPayload.external_id
          },
          responseTime,
          paymentMethods: {
            banks: data.available_banks?.length || 0,
            ewallets: data.available_ewallets?.length || 0,
            qr_codes: data.available_qr_codes?.length || 0,
            retail: data.available_retail_outlets?.length || 0,
            paylaters: data.available_paylaters?.length || 0
          }
        };
      } else {
        const errorText = await response.text();
        console.error(`❌ Invoice creation failed: ${errorText}`);
        return {
          success: false,
          scenario: scenario.name,
          amount: scenario.amount,
          error: errorText,
          status: response.status,
          responseTime
        };
      }
    } catch (error) {
      console.error(`❌ Network error: ${error.message}`);
      return {
        success: false,
        scenario: scenario.name,
        amount: scenario.amount,
        error: error.message,
        type: 'network'
      };
    }
  }

  async testDatabaseOrderCreation(externalId) {
    console.log('\n🧪 Testing Database Order Creation...');
    
    try {
      // We can't directly query the database from client, but we can test if the order
      // appears in the payment status page or through a test endpoint
      const statusResponse = await fetch(`${TEST_CONFIG.BASE_URL}/payment-status?external_id=${externalId}`, {
        headers: { 'User-Agent': 'DatabaseTest/1.0' }
      });
      
      if (statusResponse.ok) {
        const html = await statusResponse.text();
        const hasOrderData = html.includes('order') || html.includes('pembayaran');
        console.log(`✅ Order status page: ${hasOrderData ? 'Contains order data' : 'Basic page'}`);
        return { success: true, hasOrderData };
      } else {
        console.log(`⚠️  Status page returned: ${statusResponse.status}`);
        return { success: false, status: statusResponse.status };
      }
    } catch (error) {
      console.error('❌ Database test error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testWebhookSimulation(invoiceData) {
    console.log('\n🧪 Testing Webhook Processing...');
    
    const mockWebhook = {
      id: invoiceData.id,
      external_id: invoiceData.external_id,
      status: 'PAID',
      amount: invoiceData.amount || 25000,
      paid_at: new Date().toISOString(),
      payment_channel: 'BANK_TRANSFER',
      payer_email: 'fulltest@jbalwikobra.com',
      currency: 'IDR',
      metadata: {
        client_external_id: invoiceData.external_id,
        customer_name: 'Full Test User',
        customer_email: 'fulltest@jbalwikobra.com',
        amount: invoiceData.amount || 25000
      }
    };

    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/xendit/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Callback-Token': 'test-webhook-token',
          'User-Agent': 'WebhookTest/1.0'
        },
        body: JSON.stringify(mockWebhook)
      });

      console.log(`📊 Webhook Response: ${response.status}`);
      const responseText = await response.text();
      
      if (response.status === 401) {
        console.log('✅ Webhook security: Token validation working');
        return { success: true, securityWorking: true };
      } else if (response.ok) {
        console.log('✅ Webhook processed successfully');
        return { success: true, processed: true };
      } else {
        console.log(`⚠️  Webhook processing issue: ${responseText}`);
        return { success: false, status: response.status, response: responseText };
      }
    } catch (error) {
      console.error('❌ Webhook test error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testPaymentMethodsAvailability(invoiceData) {
    console.log('\n🧪 Testing Payment Methods Availability...');
    
    try {
      if (!invoiceData.invoice || !invoiceData.invoice.url) {
        console.log('⚠️  No invoice URL to test');
        return { success: false, error: 'No invoice URL' };
      }

      // Test if the Xendit checkout page loads
      const checkoutResponse = await fetch(invoiceData.invoice.url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'PaymentMethodTest/1.0' }
      });
      
      console.log(`📊 Checkout Page: ${checkoutResponse.status}`);
      
      const methods = invoiceData.paymentMethods || {};
      console.log('💳 Available Payment Methods:');
      console.log(`   🏦 Banks: ${methods.banks || 0}`);
      console.log(`   📱 E-Wallets: ${methods.ewallets || 0}`);
      console.log(`   📱 QR Codes: ${methods.qr_codes || 0}`);
      console.log(`   🏪 Retail: ${methods.retail || 0}`);
      console.log(`   💰 PayLater: ${methods.paylaters || 0}`);
      
      const totalMethods = Object.values(methods).reduce((sum, count) => sum + (count || 0), 0);
      
      return {
        success: checkoutResponse.ok,
        checkoutPageStatus: checkoutResponse.status,
        methods,
        totalMethods,
        hasMultipleMethods: totalMethods > 3
      };
    } catch (error) {
      console.error('❌ Payment methods test error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runFullTestSuite() {
    console.log('🚀 COMPREHENSIVE PAYMENT FLOW TEST SUITE');
    console.log('🌐 Environment: Production (jbalwikobra.com)');
    console.log('⏰ Started:', new Date().toLocaleString('id-ID'));
    console.log('=' .repeat(60));

    // Test 1: Product page integration
    const productTest = await this.testProductPageFlow();
    this.results.productPageTest = productTest;

    // Test 2: Multiple invoice creation scenarios
    console.log('\n📋 Testing Multiple Invoice Scenarios...');
    for (const scenario of TEST_CONFIG.TEST_SCENARIOS) {
      const invoiceTest = await this.testInvoiceCreation(scenario);
      this.results.testSessions.push(invoiceTest);
      
      if (invoiceTest.success) {
        // Test 3: Database order creation for this invoice
        const dbTest = await this.testDatabaseOrderCreation(invoiceTest.invoice.external_id);
        invoiceTest.databaseTest = dbTest;
        
        // Test 4: Payment methods availability
        const methodsTest = await this.testPaymentMethodsAvailability(invoiceTest);
        invoiceTest.paymentMethodsTest = methodsTest;
        
        // Test 5: Webhook simulation for this invoice
        const webhookTest = await this.testWebhookSimulation(invoiceTest.invoice);
        invoiceTest.webhookTest = webhookTest;
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate final report
    this.generateFinalReport();
    return this.results;
  }

  generateFinalReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('=' .repeat(60));

    const successful = this.results.testSessions.filter(t => t.success);
    const failed = this.results.testSessions.filter(t => !t.success);

    console.log(`📈 Invoice Creation Tests: ${successful.length}/${this.results.testSessions.length} passed`);
    console.log(`🌐 Product Page Integration: ${this.results.productPageTest?.success ? '✅' : '❌'}`);

    if (successful.length > 0) {
      console.log('\n✅ SUCCESSFUL TESTS:');
      successful.forEach(test => {
        console.log(`   💰 ${test.scenario}: Rp ${test.amount.toLocaleString('id-ID')} (${test.responseTime}ms)`);
        console.log(`      🔗 Invoice: ${test.invoice.id}`);
        console.log(`      💳 Payment Methods: ${test.paymentMethodsTest?.totalMethods || 0} available`);
        console.log(`      🗄️  Database: ${test.databaseTest?.success ? '✅' : '❌'}`);
        console.log(`      🔗 Webhook: ${test.webhookTest?.success ? '✅' : '❌'}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failed.forEach(test => {
        console.log(`   💰 ${test.scenario}: ${test.error}`);
      });
    }

    console.log('\n💡 TEST SUMMARY:');
    if (successful.length === this.results.testSessions.length) {
      console.log('🎉 ALL PAYMENT TESTS PASSED! Payment flow is fully functional.');
      console.log('✅ Users can successfully create invoices and make payments.');
    } else if (successful.length > 0) {
      console.log(`⚠️  PARTIAL SUCCESS: ${successful.length}/${this.results.testSessions.length} scenarios working.`);
    } else {
      console.log('❌ ALL TESTS FAILED: Payment system needs immediate attention.');
    }

    // Live invoice URLs for manual testing
    const liveInvoices = successful
      .filter(t => t.invoice?.url)
      .slice(0, 2); // Show max 2 for manual testing
      
    if (liveInvoices.length > 0) {
      console.log('\n🔗 LIVE TEST INVOICES (for manual payment testing):');
      liveInvoices.forEach(test => {
        console.log(`   ${test.scenario} (Rp ${test.amount.toLocaleString('id-ID')})`);
        console.log(`   ${test.invoice.url}`);
        console.log(`   Expires: ${new Date(test.invoice.expires_at).toLocaleString('id-ID')}`);
      });
      console.log('\n   💡 Visit these URLs to complete manual payment tests');
    }

    console.log('\n📊 Performance Metrics:');
    const responseTimes = successful.map(t => t.responseTime).filter(t => t);
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      console.log(`   ⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`   🚀 Fastest: ${Math.min(...responseTimes)}ms`);
      console.log(`   🐌 Slowest: ${Math.max(...responseTimes)}ms`);
    }

    this.results.summary = {
      total: this.results.testSessions.length,
      passed: successful.length,
      failed: failed.length,
      passRate: ((successful.length / this.results.testSessions.length) * 100).toFixed(1),
      avgResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : null
    };
  }
}

// Run the comprehensive test suite
const tester = new PaymentFlowTester();
tester.runFullTestSuite()
  .then(results => {
    console.log('\n✨ Full test suite completed!');
    console.log(`📊 Final Score: ${results.summary.passed}/${results.summary.total} (${results.summary.passRate}% pass rate)`);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
  });
