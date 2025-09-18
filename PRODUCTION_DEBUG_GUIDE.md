# 🔧 Production Purchase Flow Debug Guide
**For testing www.jbalwikobra.com**

## 🚨 Quick Debug Steps

### 1. Open Browser Console
1. Go to https://www.jbalwikobra.com
2. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
3. Click on "Console" tab

### 2. Run Debug Script
Copy and paste this code into the console:

```javascript
// Quick Production Debug
async function quickDebug() {
  console.log('🚀 QUICK PRODUCTION DEBUG');
  console.log('Current URL:', window.location.href);
  
  // Test 1: Check if React loaded
  const reactApp = document.getElementById('root');
  console.log('React app loaded:', reactApp?.children.length > 0 ? '✅' : '❌');
  
  // Test 2: Check navigation
  const productLinks = document.querySelectorAll('a[href*="/product"]').length;
  console.log('Product links found:', productLinks);
  
  // Test 3: Test API
  try {
    const response = await fetch('/api/xendit/payment-methods');
    const data = await response.json();
    console.log('Payment API status:', response.ok ? '✅ WORKING' : '❌ FAILED');
    console.log('Payment methods count:', data.methods?.length || 0);
    console.log('Data source:', data.source);
    
    if (data.source === 'fallback') {
      console.log('⚠️ WARNING: Using offline fallback data');
    }
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
  
  console.log('\n💡 Next: Navigate to Products page and test purchase flow');
}

quickDebug();
```

### 3. Manual Purchase Flow Test

#### Step A: Navigate to Products
1. Click "Produk" in navigation menu
2. Or go directly to: https://www.jbalwikobra.com/products

#### Step B: Select a Product
1. Click on any product card
2. Should navigate to product detail page
3. Check if product information loads correctly

#### Step C: Test Purchase Flow
1. Click "Beli Sekarang" button
2. Checkout modal should open
3. Fill the form:
   - **Name**: "Test User"
   - **Email**: "test@jbalwikobra.com"  
   - **WhatsApp**: "+628123456789"

#### Step D: Test Payment Selection
1. Scroll down to payment methods section
2. Select "QRIS" payment method
3. Click "Bayar Sekarang" button

#### Step E: Verify Payment Interface
1. Should redirect to `/payment?method=qris&...`
2. Should show QR code interface
3. Should display payment amount and instructions

## 🐛 Common Issues & Solutions

### Issue 1: "React app not loading"
**Symptoms**: Blank page or loading spinner
**Solutions**:
- Check browser console for JavaScript errors
- Try hard refresh: `Ctrl+F5`
- Clear browser cache
- Check if using supported browser

### Issue 2: "No product links found"
**Symptoms**: Empty products page
**Solutions**:
- Check database connection
- Verify Supabase configuration
- Check product data in admin panel

### Issue 3: "Payment API using fallback data"
**Symptoms**: "Mode Offline" indicator in payment methods
**Solutions**:
- Check Xendit API credentials
- Verify environment variables
- Check network connectivity
- Restart Vercel deployment

### Issue 4: "Payment creation failed"
**Symptoms**: Error when clicking "Bayar Sekarang"
**Solutions**:
- Check Xendit sandbox/live mode settings
- Verify API keys are correct
- Check payment method availability
- Review error logs in Vercel dashboard

### Issue 5: "Checkout modal not opening"
**Symptoms**: Nothing happens when clicking "Beli Sekarang"
**Solutions**:
- Check for JavaScript errors in console
- Verify React router is working
- Check if product data is loaded
- Test on different browser

## 🔧 Advanced Debugging

### Full Diagnosis Script
```javascript
// Paste this for comprehensive diagnosis
// [Use the production-diagnosis.js script content]
```

### API Testing Script
```javascript
// Test specific API endpoints
async function testAPIs() {
  const tests = [
    '/api/xendit/payment-methods',
    '/api/xendit/create-direct-payment'
  ];
  
  for (const endpoint of tests) {
    try {
      const response = await fetch(endpoint);
      console.log(`${endpoint}: ${response.ok ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`);
    }
  }
}

testAPIs();
```

## 📞 Escalation Steps

If issues persist:
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Test Xendit API directly using Postman
4. Check Supabase database connectivity
5. Review recent deployment changes

## ✅ Success Criteria

Purchase flow is working if:
- ✅ React app loads without errors
- ✅ Product pages display correctly
- ✅ Checkout modal opens and functions
- ✅ Payment methods load from Xendit API
- ✅ Payment creation works
- ✅ Payment interface shows correctly
- ✅ No critical JavaScript errors

---

**Last Updated**: September 17, 2025
**Environment**: Production (www.jbalwikobra.com)
