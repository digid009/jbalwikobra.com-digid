/**
 * 🧪 Unified Browser Payment Testing Script
 * Consolidated script that replaces production-e2e-test.js, browser-e2e-test.js, and other duplicated test files
 * 
 * Usage:
 * 1. Open browser console on www.jbalwikobra.com
 * 2. Paste this entire script
 * 3. Run: await window.UnifiedPaymentTest.runQuickTest()
 *    Or: await window.UnifiedPaymentTest.runComprehensiveTest()
 */

class UnifiedPaymentTester {
  constructor() {
    this.baseUrl = window.location.origin;
    this.testResults = [];
    this.config = {
      paymentMethods: {
        QRIS: 'qris',
        BCA_VA: 'bca',
        BNI_VA: 'bni',
        MANDIRI_VA: 'mandiri',
        DANA: 'dana',
        GOPAY: 'gopay',
        SHOPEEPAY: 'shopeepay',
        LINKAJA: 'linkaja'
      },
      testAmounts: {
        SMALL: 10000,
        MEDIUM: 50000,
        LARGE: 100000
      },
      testCustomer: {
        given_names: 'Test User Browser',
        email: 'test.browser@example.com',
        mobile_number: '+628123456789'
      }
    };
    
    this.log('🧪 Unified Payment Tester initialized', 'info');
    this.log(`Base URL: ${this.baseUrl}`, 'info');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    }[type] || 'ℹ️';
    
    const color = {
      'success': 'color: green',
      'error': 'color: red',
      'warning': 'color: orange',
      'info': 'color: blue'
    }[type] || 'color: blue';
    
    console.log(`%c[${timestamp}] ${emoji} ${message}`, color);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createPaymentPayload(paymentMethodId, amount, orderType = 'purchase', customData = {}) {
    const timestamp = Date.now();
    const basePayload = {
      payment_method_id: paymentMethodId,
      amount,
      currency: 'IDR',
      customer: this.config.testCustomer,
      description: `Browser Test ${orderType} - ${paymentMethodId.toUpperCase()}`,
      external_id: `browser_${paymentMethodId}_${orderType}_${timestamp}`,
      success_redirect_url: `${this.baseUrl}/payment-status?status=success`,
      failure_redirect_url: `${this.baseUrl}/payment-status?status=failed`,
      order: {
        customer_name: this.config.testCustomer.given_names,
        customer_email: this.config.testCustomer.email,
        customer_phone: this.config.testCustomer.mobile_number,
        product_name: `Test ${orderType} product`,
        amount,
        order_type: orderType,
        ...(orderType === 'rental' && { rental_duration: 7 })
      }
    };

    return { ...basePayload, ...customData };
  }

  async testPaymentMethods(amount = this.config.testAmounts.MEDIUM) {
    this.log('🔍 Testing Payment Methods API...', 'info');
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/xendit/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (response.ok) {
        this.log(`Payment Methods API succeeded (${executionTime}ms)`, 'success');
        this.log(`Data source: ${data.source}`, 'info');
        this.log(`Available methods: ${data.payment_methods?.length || 0}`, 'info');
        
        if (data.payment_methods?.length > 0) {
          const methods = data.payment_methods.map(m => m.id).join(', ');
          this.log(`Methods: ${methods}`, 'info');
        }
        
        return { success: true, data, executionTime };
      } else {
        this.log(`Payment Methods API failed: ${data.error || response.statusText}`, 'error');
        return { success: false, error: data.error || response.statusText, executionTime };
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.log(`Payment Methods API error: ${error.message}`, 'error');
      return { success: false, error: error.message, executionTime };
    }
  }

  async testCreatePayment(paymentMethodId, amount, orderType = 'purchase') {
    const methodName = Object.keys(this.config.paymentMethods).find(
      key => this.config.paymentMethods[key] === paymentMethodId
    ) || paymentMethodId.toUpperCase();
    
    this.log(`💳 Testing ${methodName} ${orderType} payment...`, 'info');
    const startTime = Date.now();
    
    try {
      const payload = this.createPaymentPayload(paymentMethodId, amount, orderType);
      
      const response = await fetch(`${this.baseUrl}/api/xendit/create-direct-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (response.ok && data.id) {
        this.log(`${methodName} ${orderType} succeeded (${executionTime}ms)`, 'success');
        this.log(`Payment ID: ${data.id}`, 'info');
        this.log(`Status: ${data.status}`, 'info');
        
        // Show method-specific info
        if (data.qr_string) this.log('QR Code generated successfully', 'info');
        if (data.account_number) this.log(`Virtual Account: ${data.account_number}`, 'info');
        if (data.payment_url) this.log('Payment URL available', 'info');
        
        const result = { 
          success: true, 
          paymentId: data.id, 
          data, 
          executionTime,
          method: methodName,
          orderType 
        };
        this.testResults.push(result);
        return result;
      } else {
        this.log(`${methodName} ${orderType} failed: ${data.error || response.statusText}`, 'error');
        const result = { 
          success: false, 
          error: data.error || response.statusText, 
          executionTime,
          method: methodName,
          orderType 
        };
        this.testResults.push(result);
        return result;
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.log(`${methodName} ${orderType} error: ${error.message}`, 'error');
      const result = { 
        success: false, 
        error: error.message, 
        executionTime,
        method: methodName,
        orderType 
      };
      this.testResults.push(result);
      return result;
    }
  }

  async testMultiplePaymentMethods(methods, amount, orderType = 'purchase') {
    const results = [];
    
    for (const method of methods) {
      const result = await this.testCreatePayment(method, amount, orderType);
      results.push(result);
      
      // Small delay between tests to avoid rate limiting
      await this.delay(1000);
    }
    
    return results;
  }

  async runQuickTest() {
    this.log('🚀 Starting Quick Test Suite...', 'info');
    this.log('=' * 60, 'info');
    
    this.clearResults();
    const startTime = Date.now();
    
    // Test 1: Payment Methods API
    const paymentMethodsResult = await this.testPaymentMethods();
    
    // Test 2: Quick QRIS test
    const qrisResult = await this.testCreatePayment(
      this.config.paymentMethods.QRIS, 
      this.config.testAmounts.MEDIUM
    );
    
    const totalTime = Date.now() - startTime;
    const successCount = [paymentMethodsResult, qrisResult].filter(r => r.success).length;
    
    this.log('📊 Quick Test Summary:', 'info');
    this.log(`Total tests: 2`, 'info');
    this.log(`Successful: ${successCount}`, successCount === 2 ? 'success' : 'warning');
    this.log(`Total time: ${totalTime}ms`, 'info');
    
    return {
      paymentMethods: paymentMethodsResult,
      qrisTest: qrisResult,
      summary: { total: 2, successful: successCount, totalTime }
    };
  }

  async runComprehensiveTest() {
    this.log('🚀 Starting Comprehensive Test Suite...', 'info');
    this.log('=' * 60, 'info');
    
    this.clearResults();
    const startTime = Date.now();
    
    // Test 1: Payment Methods API
    this.log('1️⃣ Testing Payment Methods API...', 'info');
    const paymentMethodsResult = await this.testPaymentMethods();
    
    // Test 2: Purchase Flow Tests
    this.log('2️⃣ Testing Purchase Flows...', 'info');
    const purchaseMethods = [
      this.config.paymentMethods.QRIS,
      this.config.paymentMethods.BNI_VA,
      this.config.paymentMethods.DANA
    ];
    const purchaseResults = await this.testMultiplePaymentMethods(
      purchaseMethods, 
      this.config.testAmounts.MEDIUM, 
      'purchase'
    );
    
    // Test 3: Rental Flow Tests
    this.log('3️⃣ Testing Rental Flows...', 'info');
    const rentalMethods = [
      this.config.paymentMethods.QRIS,
      this.config.paymentMethods.MANDIRI_VA
    ];
    const rentalResults = await this.testMultiplePaymentMethods(
      rentalMethods, 
      this.config.testAmounts.LARGE, 
      'rental'
    );
    
    const totalTime = Date.now() - startTime;
    const allTests = [paymentMethodsResult, ...purchaseResults, ...rentalResults];
    const successCount = allTests.filter(r => r.success).length;
    const successRate = (successCount / allTests.length) * 100;
    
    this.log('📊 Comprehensive Test Summary:', 'info');
    this.log(`Total tests: ${allTests.length}`, 'info');
    this.log(`Successful: ${successCount}`, successCount === allTests.length ? 'success' : 'warning');
    this.log(`Failed: ${allTests.length - successCount}`, 'info');
    this.log(`Success rate: ${successRate.toFixed(1)}%`, successRate > 80 ? 'success' : 'warning');
    this.log(`Total time: ${totalTime}ms`, 'info');
    
    return {
      paymentMethods: paymentMethodsResult,
      purchaseTests: purchaseResults,
      rentalTests: rentalResults,
      summary: { 
        total: allTests.length, 
        successful: successCount, 
        failed: allTests.length - successCount,
        successRate,
        totalTime 
      }
    };
  }

  async runSingleMethodTest(paymentMethodId, amount = this.config.testAmounts.MEDIUM) {
    const methodName = Object.keys(this.config.paymentMethods).find(
      key => this.config.paymentMethods[key] === paymentMethodId
    ) || paymentMethodId.toUpperCase();
    
    this.log(`🚀 Testing Single Method: ${methodName}`, 'info');
    this.log('=' * 60, 'info');
    
    this.clearResults();
    const startTime = Date.now();
    
    // Test purchase
    const purchaseResult = await this.testCreatePayment(paymentMethodId, amount, 'purchase');
    await this.delay(1000);
    
    // Test rental
    const rentalResult = await this.testCreatePayment(paymentMethodId, amount * 2, 'rental');
    
    const totalTime = Date.now() - startTime;
    const successCount = [purchaseResult, rentalResult].filter(r => r.success).length;
    
    this.log(`📊 ${methodName} Test Summary:`, 'info');
    this.log(`Purchase: ${purchaseResult.success ? '✅ PASS' : '❌ FAIL'}`, purchaseResult.success ? 'success' : 'error');
    this.log(`Rental: ${rentalResult.success ? '✅ PASS' : '❌ FAIL'}`, rentalResult.success ? 'success' : 'error');
    this.log(`Total time: ${totalTime}ms`, 'info');
    
    return {
      purchase: purchaseResult,
      rental: rentalResult,
      summary: { total: 2, successful: successCount, totalTime }
    };
  }

  generateReport() {
    const results = this.testResults;
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    let report = '📊 Payment Test Report\n';
    report += '='.repeat(50) + '\n';
    report += `Total Tests: ${results.length}\n`;
    report += `Successful: ${successful}\n`;
    report += `Failed: ${failed}\n`;
    report += `Success Rate: ${((successful / results.length) * 100).toFixed(1)}%\n\n`;
    
    if (failed > 0) {
      report += '❌ Failed Tests:\n';
      results.filter(r => !r.success).forEach((result, index) => {
        report += `  ${index + 1}. ${result.method} ${result.orderType}: ${result.error}\n`;
      });
    }
    
    if (successful > 0) {
      report += '\n✅ Successful Tests:\n';
      results.filter(r => r.success).forEach((result, index) => {
        report += `  ${index + 1}. ${result.method} ${result.orderType} (${result.executionTime}ms)\n`;
      });
    }
    
    console.log(report);
    return report;
  }

  getTestResults() {
    return this.testResults;
  }

  clearResults() {
    this.testResults = [];
  }

  // Convenience methods for easy access
  async quickTest() {
    return await this.runQuickTest();
  }

  async fullTest() {
    return await this.runComprehensiveTest();
  }

  async testQRIS() {
    return await this.runSingleMethodTest(this.config.paymentMethods.QRIS);
  }

  async testBNI() {
    return await this.runSingleMethodTest(this.config.paymentMethods.BNI_VA);
  }

  async testDANA() {
    return await this.runSingleMethodTest(this.config.paymentMethods.DANA);
  }
}

// Global setup
window.UnifiedPaymentTest = new UnifiedPaymentTester();

// Quick access methods
window.quickTest = () => window.UnifiedPaymentTest.runQuickTest();
window.fullTest = () => window.UnifiedPaymentTest.runComprehensiveTest();
window.testQRIS = () => window.UnifiedPaymentTest.testQRIS();
window.testBNI = () => window.UnifiedPaymentTest.testBNI();
window.testDANA = () => window.UnifiedPaymentTest.testDANA();

// Auto-display help
console.log('%c🧪 Unified Payment Testing Script Loaded!', 'color: green; font-weight: bold; font-size: 16px;');
console.log('%c' + '='.repeat(60), 'color: gray;');
console.log('%cQuick Commands:', 'color: blue; font-weight: bold;');
console.log('%c  await quickTest()     - Run quick test (2 tests)', 'color: blue;');
console.log('%c  await fullTest()      - Run comprehensive test (6+ tests)', 'color: blue;');
console.log('%c  await testQRIS()      - Test QRIS payment only', 'color: blue;');
console.log('%c  await testBNI()       - Test BNI Virtual Account only', 'color: blue;');
console.log('%c  await testDANA()      - Test DANA e-wallet only', 'color: blue;');
console.log('%c', '');
console.log('%cAdvanced Commands:', 'color: orange; font-weight: bold;');
console.log('%c  UnifiedPaymentTest.generateReport()         - Show detailed report', 'color: orange;');
console.log('%c  UnifiedPaymentTest.getTestResults()         - Get raw test data', 'color: orange;');
console.log('%c  UnifiedPaymentTest.clearResults()           - Clear test history', 'color: orange;');
console.log('%c  UnifiedPaymentTest.runSingleMethodTest(id)  - Test specific method', 'color: orange;');
console.log('%c', '');
console.log('%cExample: await quickTest()', 'color: green; font-style: italic;');
