/**
 * 🧪 Local Development E2E Testing Script
 * Tests purchase and rental flows with development Xendit keys
 * 
 * To run: Open browser console on http://localhost:3000 and paste this script
 */

class E2EPaymentTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
    this.testCustomer = {
      name: 'Test User Development',
      email: 'test@localhost-dev.com',
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

  // Test 1: Verify development environment setup
  async testEnvironmentSetup() {
    this.log('🔧 Testing Environment Setup...', 'info');
    
    try {
      // Check if .env.local exists (we can't directly access it, but we can test the effect)
      const response = await fetch('/api/xendit/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10000 })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.log('Environment setup appears correct - payment methods API responding', 'success');
        this.log(`Payment methods source: ${data.source}`, 'info');
        return { success: true, data };
      } else {
        this.log('Payment methods API failed - check environment variables', 'error');
        return { success: false, error: 'API failed' };
      }
    } catch (error) {
      this.log(`Environment test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 2: Test direct payment creation (Purchase)
  async testPurchaseFlow() {
    this.log('🛒 Testing Purchase Flow...', 'info');
    
    const purchasePayload = {
      payment_method_id: 'qris',
      amount: 50000,
      currency: 'IDR',
      customer: {
        given_names: this.testCustomer.name,
        email: this.testCustomer.email,
        mobile_number: this.testCustomer.phone
      },
      description: 'E2E Test Purchase - QRIS',
      external_id: `e2e_purchase_${Date.now()}`,
      success_redirect_url: `${this.baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${this.baseUrl}/payment-status?status=failed`,
      order: {
        customer_name: this.testCustomer.name,
        customer_email: this.testCustomer.email,
        customer_phone: this.testCustomer.phone,
        product_name: 'Test Product - Purchase',
        amount: 50000,
        order_type: 'purchase',
        rental_duration: null
      }
    };

    try {
      const response = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchasePayload)
      });

      const data = await response.json();
      
      if (response.ok) {
        this.log('Purchase payment created successfully', 'success');
        this.log(`Payment ID: ${data.id}`, 'info');
        this.log(`Status: ${data.status}`, 'info');
        this.log(`QR available: ${data.qr_string ? 'Yes' : 'No'}`, 'info');
        
        return { 
          success: true, 
          paymentId: data.id, 
          externalId: purchasePayload.external_id,
          qrString: data.qr_string 
        };
      } else {
        this.log(`Purchase payment failed: ${JSON.stringify(data)}`, 'error');
        return { success: false, error: data };
      }
    } catch (error) {
      this.log(`Purchase test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 3: Test rental flow
  async testRentalFlow() {
    this.log('🏠 Testing Rental Flow...', 'info');
    
    const rentalPayload = {
      payment_method_id: 'bni',
      amount: 25000,
      currency: 'IDR',
      customer: {
        given_names: this.testCustomer.name,
        email: this.testCustomer.email,
        mobile_number: this.testCustomer.phone
      },
      description: 'E2E Test Rental - Virtual Account',
      external_id: `e2e_rental_${Date.now()}`,
      success_redirect_url: `${this.baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${this.baseUrl}/payment-status?status=failed`,
      order: {
        customer_name: this.testCustomer.name,
        customer_email: this.testCustomer.email,
        customer_phone: this.testCustomer.phone,
        product_name: 'Test Product - Rental',
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
        this.log('Rental payment created successfully', 'success');
        this.log(`Payment ID: ${data.id}`, 'info');
        this.log(`Status: ${data.status}`, 'info');
        this.log(`Account Number: ${data.account_number || 'N/A'}`, 'info');
        this.log(`Bank Code: ${data.bank_code || 'N/A'}`, 'info');
        
        return { 
          success: true, 
          paymentId: data.id, 
          externalId: rentalPayload.external_id,
          accountNumber: data.account_number,
          bankCode: data.bank_code
        };
      } else {
        this.log(`Rental payment failed: ${JSON.stringify(data)}`, 'error');
        return { success: false, error: data };
      }
    } catch (error) {
      this.log(`Rental test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 4: Test payment retrieval
  async testPaymentRetrieval(paymentId) {
    this.log(`🔍 Testing Payment Retrieval for ${paymentId}...`, 'info');
    
    try {
      const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
      const data = await response.json();
      
      if (response.ok) {
        this.log('Payment retrieval successful', 'success');
        this.log(`Retrieved Status: ${data.status}`, 'info');
        this.log(`Payment Method: ${data.payment_method}`, 'info');
        return { success: true, data };
      } else {
        this.log(`Payment retrieval failed: ${JSON.stringify(data)}`, 'error');
        return { success: false, error: data };
      }
    } catch (error) {
      this.log(`Payment retrieval test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Test 5: Test different payment methods
  async testPaymentMethods() {
    this.log('💳 Testing Different Payment Methods...', 'info');
    
    const methods = [
      { id: 'qris', name: 'QRIS', amount: 15000 },
      { id: 'bca', name: 'BCA Virtual Account', amount: 20000 },
      { id: 'mandiri', name: 'Mandiri Virtual Account', amount: 30000 },
      { id: 'dana', name: 'DANA E-Wallet', amount: 25000 }
    ];

    const results = [];
    
    for (const method of methods) {
      this.log(`Testing ${method.name}...`, 'info');
      
      const payload = {
        payment_method_id: method.id,
        amount: method.amount,
        currency: 'IDR',
        customer: {
          given_names: `Test ${method.name}`,
          email: this.testCustomer.email,
          mobile_number: this.testCustomer.phone
        },
        description: `E2E Test - ${method.name}`,
        external_id: `e2e_${method.id}_${Date.now()}`,
        order: {
          customer_name: `Test ${method.name}`,
          customer_email: this.testCustomer.email,
          customer_phone: this.testCustomer.phone,
          product_name: `Test Product - ${method.name}`,
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
          this.log(`${method.name} payment created successfully`, 'success');
          results.push({ method: method.id, success: true, paymentId: data.id });
        } else {
          this.log(`${method.name} payment failed: ${data.error}`, 'error');
          results.push({ method: method.id, success: false, error: data.error });
        }
      } catch (error) {
        this.log(`${method.name} test failed: ${error.message}`, 'error');
        results.push({ method: method.id, success: false, error: error.message });
      }

      // Add delay between requests
      await this.delay(1000);
    }
    
    return results;
  }

  // Test 6: Test payment interface page
  async testPaymentInterface(paymentId, method) {
    this.log(`🖥️ Testing Payment Interface for ${method}...`, 'info');
    
    const paymentUrl = `${this.baseUrl}/payment?id=${paymentId}&method=${method}&amount=50000&external_id=test`;
    
    try {
      // Simulate opening the payment interface
      this.log(`Payment interface URL: ${paymentUrl}`, 'info');
      this.log('Manual test: Open this URL to verify the payment interface', 'warning');
      
      return { success: true, url: paymentUrl };
    } catch (error) {
      this.log(`Payment interface test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting E2E Payment Tests for Local Development', 'info');
    this.log('=' .repeat(80), 'info');
    
    const results = {
      environment: null,
      purchase: null,
      rental: null,
      paymentMethods: null,
      summary: {}
    };

    // Test 1: Environment Setup
    results.environment = await this.testEnvironmentSetup();
    
    if (!results.environment.success) {
      this.log('Environment setup failed. Stopping tests.', 'error');
      return results;
    }

    await this.delay(1000);

    // Test 2: Purchase Flow
    results.purchase = await this.testPurchaseFlow();
    
    if (results.purchase.success) {
      await this.delay(1000);
      // Test payment retrieval
      await this.testPaymentRetrieval(results.purchase.paymentId);
      // Test payment interface
      await this.testPaymentInterface(results.purchase.paymentId, 'qris');
    }

    await this.delay(2000);

    // Test 3: Rental Flow
    results.rental = await this.testRentalFlow();
    
    if (results.rental.success) {
      await this.delay(1000);
      // Test payment retrieval
      await this.testPaymentRetrieval(results.rental.paymentId);
      // Test payment interface
      await this.testPaymentInterface(results.rental.paymentId, 'bni');
    }

    await this.delay(2000);

    // Test 4: Different Payment Methods
    results.paymentMethods = await this.testPaymentMethods();

    // Generate summary
    results.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      environmentOk: results.environment.success,
      purchaseOk: results.purchase?.success || false,
      rentalOk: results.rental?.success || false,
      paymentMethodsOk: results.paymentMethods?.filter(r => r.success).length || 0
    };

    results.summary.total = 3 + (results.paymentMethods?.length || 0);
    results.summary.passed = 
      (results.environment.success ? 1 : 0) +
      (results.purchase?.success ? 1 : 0) +
      (results.rental?.success ? 1 : 0) +
      (results.paymentMethods?.filter(r => r.success).length || 0);
    results.summary.failed = results.summary.total - results.summary.passed;

    // Print final summary
    this.log('=' .repeat(80), 'info');
    this.log('📊 TEST SUMMARY', 'info');
    this.log('=' .repeat(80), 'info');
    this.log(`Environment Setup: ${results.environment.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Purchase Flow: ${results.purchase?.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Rental Flow: ${results.rental?.success ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Payment Methods: ${results.summary.paymentMethodsOk}/${results.paymentMethods?.length || 0} passed`, 'info');
    this.log('=' .repeat(80), 'info');
    this.log(`Overall: ${results.summary.passed}/${results.summary.total} tests passed`, 
      results.summary.failed === 0 ? 'success' : 'warning');

    if (results.summary.failed === 0) {
      this.log('🎉 All tests passed! Your development environment is ready for E2E testing.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Check the logs above for details.', 'warning');
    }

    return results;
  }
}

// Auto-run the tests
console.log('🧪 JB Alwikobra E2E Payment Tester Loaded');
console.log('Run: const tester = new E2EPaymentTester(); tester.runAllTests();');

// Or run immediately
const autoTester = new E2EPaymentTester();
autoTester.runAllTests().then(results => {
  console.log('✅ E2E Testing completed. Results stored in window.e2eResults');
  window.e2eResults = results;
});
