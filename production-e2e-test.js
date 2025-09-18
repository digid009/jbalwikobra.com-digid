/**
 * 🚀 Production E2E Testing Script for www.jbalwikobra.com
 * Tests purchase and rental flows with Xendit development keys
 * 
 * To run: Open browser console on https://www.jbalwikobra.com and paste this script
 */

class ProductionE2ETester {
  constructor() {
    this.baseUrl = 'https://www.jbalwikobra.com';
    this.testResults = [];
    this.testCustomer = {
      name: 'Test User Production',
      email: 'test@production-e2e.com',
      phone: '+628123456789'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test 0: Environment diagnostic
  async testEnvironmentDiagnostic() {
    this.log('🔍 Running Environment Diagnostic...', 'info');
    
    try {
      // Test basic API connectivity
      const response = await fetch('/api/test', {
        method: 'GET'
      });
      
      this.log(`Basic API connectivity test: ${response.status}`, 'info');
      
      // Test if we can reach any Xendit endpoint
      const xenditTest = await fetch('/api/xendit/webhook', {
        method: 'GET'
      });
      
      this.log(`Xendit webhook endpoint test: ${xenditTest.status}`, 'info');
      
      return { success: true };
    } catch (error) {
      this.log(`Environment diagnostic failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 1: Verify production environment and payment methods
  async testProductionPaymentMethods() {
    this.log('🔧 Testing Production Payment Methods API...', 'info');
    
    try {
      const response = await fetch('/api/xendit/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50000 })
      });
      
      this.log(`Payment Methods API Status: ${response.status}`, 'info');
      
      if (response.ok) {
        const data = await response.json();
        this.log('Production payment methods API responding', 'success');
        this.log(`Data source: ${data.source}`, 'info');
        this.log(`Available methods: ${data.payment_methods?.length || 0}`, 'info');
        
        // List available payment methods
        if (data.payment_methods && data.payment_methods.length > 0) {
          const methods = data.payment_methods.map(m => m.id).join(', ');
          this.log(`Methods: ${methods}`, 'info');
        }
        
        return { success: true, data };
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText, status: response.status };
        }
        this.log(`Payment methods API failed (${response.status}): ${JSON.stringify(errorData)}`, 'error');
        this.log('💡 This might indicate dev keys are not configured in production environment', 'warning');
        return { success: false, error: errorData, status: response.status };
      }
    } catch (error) {
      this.log(`Payment methods test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 2: Test production purchase flow with development keys
  async testProductionPurchaseFlow() {
    this.log('🛒 Testing Production Purchase Flow (QRIS)...', 'info');
    
    const purchasePayload = {
      payment_method_id: 'qris',
      amount: 50000,
      currency: 'IDR',
      customer: {
        given_names: this.testCustomer.name,
        email: this.testCustomer.email,
        mobile_number: this.testCustomer.phone
      },
      description: 'Production E2E Test Purchase - QRIS',
      external_id: `prod_e2e_purchase_${Date.now()}`,
      success_redirect_url: `${this.baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${this.baseUrl}/payment-status?status=failed`,
      order: {
        customer_name: this.testCustomer.name,
        customer_email: this.testCustomer.email,
        customer_phone: this.testCustomer.phone,
        product_name: 'Test Product - Purchase (Production E2E)',
        amount: 50000,
        order_type: 'purchase',
        rental_duration: null
      }
    };

    try {
      this.log('Sending purchase request...', 'info');
      const response = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchasePayload)
      });

      this.log(`Purchase API Status: ${response.status}`, 'info');
      
      if (response.ok) {
        const data = await response.json();
        this.log('Production purchase payment created successfully', 'success');
        this.log(`Payment ID: ${data.id}`, 'info');
        this.log(`Status: ${data.status}`, 'info');
        this.log(`QR Code available: ${data.qr_string ? 'Yes' : 'No'}`, 'info');
        
        if (data.qr_string) {
          this.log('QR Code ready for scanning', 'success');
          this.log(`Payment URL: ${this.baseUrl}/payment?id=${data.id}&method=qris&amount=50000&external_id=${purchasePayload.external_id}`, 'info');
        }
        
        return { 
          success: true, 
          paymentId: data.id, 
          externalId: purchasePayload.external_id,
          qrString: data.qr_string,
          paymentUrl: data.payment_url || `${this.baseUrl}/payment?id=${data.id}&method=qris&amount=50000&external_id=${purchasePayload.external_id}`
        };
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText, status: response.status };
        }
        this.log(`Purchase payment failed (${response.status}): ${JSON.stringify(errorData)}`, 'error');
        
        // Check for specific error types
        if (response.status === 400) {
          this.log('🔍 400 Error suggests validation issue or missing environment variables', 'warning');
        } else if (response.status === 401) {
          this.log('🔍 401 Error suggests authentication issue with Xendit keys', 'warning');
        } else if (response.status === 500) {
          this.log('🔍 500 Error suggests server configuration issue', 'warning');
        }
        
        return { success: false, error: errorData, status: response.status };
      }
    } catch (error) {
      this.log(`Production purchase test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 3: Test production rental flow
  async testProductionRentalFlow() {
    this.log('🏠 Testing Production Rental Flow (BNI VA)...', 'info');
    
    const rentalPayload = {
      payment_method_id: 'bni',
      amount: 25000,
      currency: 'IDR',
      customer: {
        given_names: this.testCustomer.name + ' Rental',
        email: 'test.rental@production-e2e.com',
        mobile_number: this.testCustomer.phone
      },
      description: 'Production E2E Test Rental - BNI VA',
      external_id: `prod_e2e_rental_${Date.now()}`,
      success_redirect_url: `${this.baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${this.baseUrl}/payment-status?status=failed`,
      order: {
        customer_name: this.testCustomer.name + ' Rental',
        customer_email: 'test.rental@production-e2e.com',
        customer_phone: this.testCustomer.phone,
        product_name: 'Test Product - Rental (Production E2E)',
        amount: 25000,
        order_type: 'rental',
        rental_duration: '1 hari'
      }
    };

    try {
      const response = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentalPayload)
      });

      const data = await response.json();
      
      if (response.ok) {
        this.log('Production rental payment created successfully', 'success');
        this.log(`Payment ID: ${data.id}`, 'info');
        this.log(`Status: ${data.status}`, 'info');
        this.log(`Virtual Account: ${data.account_number || 'N/A'}`, 'info');
        this.log(`Bank Code: ${data.bank_code || 'N/A'}`, 'info');
        
        if (data.account_number) {
          this.log(`Transfer to BNI VA: ${data.account_number} (Amount: Rp ${data.amount.toLocaleString('id-ID')})`, 'success');
          this.log(`Payment URL: ${this.baseUrl}/payment?id=${data.id}&method=bni&amount=25000&external_id=${rentalPayload.external_id}`, 'info');
        }
        
        return { 
          success: true, 
          paymentId: data.id, 
          externalId: rentalPayload.external_id,
          accountNumber: data.account_number,
          bankCode: data.bank_code,
          paymentUrl: `${this.baseUrl}/payment?id=${data.id}&method=bni&amount=25000&external_id=${rentalPayload.external_id}`
        };
      } else {
        this.log(`Production rental payment failed: ${JSON.stringify(data)}`, 'error');
        return { success: false, error: data };
      }
    } catch (error) {
      this.log(`Production rental test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 4: Test different payment methods on production
  async testProductionPaymentMethods() {
    this.log('💳 Testing Different Payment Methods on Production...', 'info');
    
    const methods = [
      { id: 'qris', name: 'QRIS', amount: 15000 },
      { id: 'bca', name: 'BCA Virtual Account', amount: 20000 },
      { id: 'mandiri', name: 'Mandiri Virtual Account', amount: 30000 },
      { id: 'dana', name: 'DANA E-Wallet', amount: 25000 }
    ];

    const results = [];
    
    for (const method of methods) {
      this.log(`Testing ${method.name} on production...`, 'info');
      
      const payload = {
        payment_method_id: method.id,
        amount: method.amount,
        currency: 'IDR',
        customer: {
          given_names: `Test ${method.name} Production`,
          email: `test.${method.id}@production-e2e.com`,
          mobile_number: this.testCustomer.phone
        },
        description: `Production E2E Test - ${method.name}`,
        external_id: `prod_e2e_${method.id}_${Date.now()}`,
        order: {
          customer_name: `Test ${method.name} Production`,
          customer_email: `test.${method.id}@production-e2e.com`,
          customer_phone: this.testCustomer.phone,
          product_name: `Test Product - ${method.name} (Production)`,
          amount: method.amount,
          order_type: 'purchase'
        }
      };

      try {
        const response = await fetch('/api/xendit/create-direct-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
          this.log(`${method.name} payment created successfully on production`, 'success');
          results.push({ 
            method: method.id, 
            success: true, 
            paymentId: data.id,
            paymentUrl: data.payment_url || `${this.baseUrl}/payment?id=${data.id}&method=${method.id}&amount=${method.amount}&external_id=${payload.external_id}`
          });
        } else {
          this.log(`${method.name} payment failed on production: ${data.error}`, 'error');
          results.push({ method: method.id, success: false, error: data.error });
        }
      } catch (error) {
        this.log(`${method.name} test failed: ${error.message}`, 'error');
        results.push({ method: method.id, success: false, error: error.message });
      }

      // Add delay between requests to avoid rate limiting
      await this.delay(1500);
    }
    
    return results;
  }

  // Test 5: Verify payment interface pages
  async testPaymentInterfacePages(paymentData) {
    this.log('🖥️ Testing Payment Interface Pages...', 'info');
    
    const testPages = [];
    
    if (paymentData.purchase && paymentData.purchase.success) {
      testPages.push({
        name: 'Purchase QRIS Interface',
        url: paymentData.purchase.paymentUrl,
        type: 'qris'
      });
    }
    
    if (paymentData.rental && paymentData.rental.success) {
      testPages.push({
        name: 'Rental BNI VA Interface',
        url: paymentData.rental.paymentUrl,
        type: 'virtual_account'
      });
    }
    
    this.log(`Found ${testPages.length} payment interface pages to test`, 'info');
    
    testPages.forEach(page => {
      this.log(`${page.name}: ${page.url}`, 'info');
      this.log(`Manual test: Open this URL to verify the ${page.type} interface`, 'warning');
    });
    
    return testPages;
  }

  // Main test runner for production
  async runProductionTests() {
    this.log('🚀 Starting Production E2E Tests on www.jbalwikobra.com', 'info');
    this.log('🔑 Using Xendit Development Keys for Testing', 'warning');
    this.log('=' .repeat(80), 'info');
    
    const results = {
      diagnostic: null,
      paymentMethods: null,
      purchase: null,
      rental: null,
      multiplePaymentMethods: null,
      summary: {}
    };

    // Test 0: Environment Diagnostic
    this.log('0️⃣ Running Environment Diagnostic...', 'info');
    results.diagnostic = await this.testEnvironmentDiagnostic();

    await this.delay(1000);

    // Test 1: Payment Methods API
    this.log('1️⃣ Testing Payment Methods API...', 'info');
    results.paymentMethods = await this.testProductionPaymentMethods();
    
    if (!results.paymentMethods.success) {
      this.log('❌ Payment Methods API failed. Cannot continue with payment tests.', 'error');
      this.log('💡 Make sure development Xendit keys are configured in production environment variables.', 'warning');
      return results;
    }

    await this.delay(2000);

    // Test 2: Purchase Flow
    this.log('2️⃣ Testing Purchase Flow...', 'info');
    results.purchase = await this.testProductionPurchaseFlow();

    await this.delay(2000);

    // Test 3: Rental Flow
    this.log('3️⃣ Testing Rental Flow...', 'info');
    results.rental = await this.testProductionRentalFlow();

    await this.delay(2000);

    // Test 4: Multiple Payment Methods
    this.log('4️⃣ Testing Multiple Payment Methods...', 'info');
    results.multiplePaymentMethods = await this.testProductionPaymentMethods();

    // Test 5: Payment Interface Pages
    this.log('5️⃣ Testing Payment Interface Pages...', 'info');
    const interfacePages = await this.testPaymentInterfacePages(results);

    // Generate summary
    results.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      paymentMethodsOk: results.paymentMethods.success,
      purchaseOk: results.purchase?.success || false,
      rentalOk: results.rental?.success || false,
      multipleMethodsOk: results.multiplePaymentMethods?.filter(r => r.success).length || 0,
      totalMethodsTested: results.multiplePaymentMethods?.length || 0
    };

    results.summary.total = 3 + (results.multiplePaymentMethods?.length || 0);
    results.summary.passed = 
      (results.paymentMethods.success ? 1 : 0) +
      (results.purchase?.success ? 1 : 0) +
      (results.rental?.success ? 1 : 0) +
      (results.multiplePaymentMethods?.filter(r => r.success).length || 0);
    results.summary.failed = results.summary.total - results.summary.passed;

    // Print final summary
    this.log('=' .repeat(80), 'info');
    this.log('📊 PRODUCTION E2E TEST SUMMARY', 'info');
    this.log('=' .repeat(80), 'info');
    this.log(`Payment Methods API: ${results.paymentMethods.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Purchase Flow (QRIS): ${results.purchase?.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Rental Flow (BNI VA): ${results.rental?.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Payment Methods: ${results.summary.multipleMethodsOk}/${results.summary.totalMethodsTested} passed`, 'info');
    this.log('=' .repeat(80), 'info');
    this.log(`Overall: ${results.summary.passed}/${results.summary.total} tests passed`, 
      results.summary.failed === 0 ? 'success' : 'warning');

    if (results.summary.failed === 0) {
      this.log('🎉 All production tests passed! Your E2E flows are working correctly.', 'success');
      this.log('🚀 Ready for real customer transactions with live Xendit keys.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Check the logs above for details.', 'warning');
    }

    // Show actionable next steps
    this.log('\n🎯 NEXT STEPS:', 'info');
    
    if (results.purchase?.success) {
      this.log(`📱 Test QRIS Payment: ${results.purchase.paymentUrl}`, 'info');
    }
    
    if (results.rental?.success) {
      this.log(`🏦 Test BNI Transfer: ${results.rental.paymentUrl}`, 'info');
    }
    
    this.log('🔄 Complete a test payment to verify webhook handling', 'warning');
    this.log('📱 Test on mobile devices for responsive design', 'warning');
    this.log('🔐 Switch to live Xendit keys when ready for production', 'warning');

    // Store results globally
    window.productionTestResults = results;
    
    return results;
  }
}

// Auto-initialize and provide instructions
console.log('🚀 Production E2E Tester for www.jbalwikobra.com loaded!');
console.log('💡 Run: const tester = new ProductionE2ETester(); tester.runProductionTests();');
console.log('📱 Make sure you\'re on https://www.jbalwikobra.com before running tests');

// Auto-run if we detect we're on the right domain
if (window.location.hostname === 'www.jbalwikobra.com' || window.location.hostname === 'jbalwikobra.com') {
  console.log('✅ Detected correct domain. Starting tests automatically...');
  const autoTester = new ProductionE2ETester();
  autoTester.runProductionTests().then(results => {
    console.log('✅ Production E2E testing completed!');
    console.log('📊 Results stored in window.productionTestResults');
  });
} else {
  console.log('⚠️ Please navigate to https://www.jbalwikobra.com first, then run the tests');
}
