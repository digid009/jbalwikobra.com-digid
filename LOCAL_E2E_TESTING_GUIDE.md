# 🧪 LOCAL DEVELOPMENT E2E TESTING GUIDE

## ✅ Prerequisites Completed
- ✅ Development Xendit keys configured in `.env.local`
- ✅ Development server running on `http://localhost:3000`

## 🚀 Quick Start Testing

### Method 1: Automated Testing Script
1. Open browser and go to `http://localhost:3000`
2. Open Developer Console (F12)
3. Copy and paste the contents of `e2e-test-development.js`
4. The script will automatically run all tests

### Method 2: Manual Testing Steps

#### Test 1: Payment Methods API
```javascript
// In browser console on localhost:3000
fetch('/api/xendit/payment-methods', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({amount: 50000})
}).then(r => r.json()).then(console.log);
```

**Expected:** Should return payment methods with `source: "xendit_api"`

#### Test 2: Purchase Flow (QRIS)
```javascript
// Test purchase payment creation
fetch('/api/xendit/create-direct-payment', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    payment_method_id: 'qris',
    amount: 50000,
    currency: 'IDR',
    customer: {
      given_names: 'Test User',
      email: 'test@localhost.com',
      mobile_number: '+628123456789'
    },
    description: 'Test Purchase',
    external_id: 'test_purchase_' + Date.now(),
    order: {
      customer_name: 'Test User',
      customer_email: 'test@localhost.com',
      customer_phone: '+628123456789',
      product_name: 'Test Product',
      amount: 50000,
      order_type: 'purchase'
    }
  })
}).then(r => r.json()).then(console.log);
```

**Expected:** Should return payment object with QR code

#### Test 3: Rental Flow (Virtual Account)
```javascript
// Test rental payment creation
fetch('/api/xendit/create-direct-payment', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    payment_method_id: 'bni',
    amount: 25000,
    currency: 'IDR',
    customer: {
      given_names: 'Test User',
      email: 'test@localhost.com',
      mobile_number: '+628123456789'
    },
    description: 'Test Rental',
    external_id: 'test_rental_' + Date.now(),
    order: {
      customer_name: 'Test User',
      customer_email: 'test@localhost.com',
      customer_phone: '+628123456789',
      product_name: 'Test Product Rental',
      amount: 25000,
      order_type: 'rental',
      rental_duration: '1 hari'
    }
  })
}).then(r => r.json()).then(console.log);
```

**Expected:** Should return payment object with virtual account number

## 🖥️ Frontend UI Testing

### Test Purchase Flow Through UI
1. Go to `http://localhost:3000`
2. Navigate to a product page
3. Click "Beli Sekarang" (Buy Now)
4. Fill in customer information:
   - Name: "Test User"
   - Email: "test@localhost.com"
   - Phone: "+628123456789"
5. Select a payment method (e.g., QRIS)
6. Click "Bayar Sekarang" (Pay Now)
7. Verify redirect to payment interface

### Test Rental Flow Through UI
1. Find a product with rental options
2. Select rental duration
3. Click "Sewa Sekarang" (Rent Now)
4. Fill customer information
5. Select payment method
6. Complete payment flow

## ⚠️ Common Issues & Solutions

### Issue: "XENDIT_SECRET_KEY is undefined"
**Solution:** Make sure `.env.local` file is created and server is restarted

### Issue: "Failed to create direct payment"
**Solution:** Check that Xendit development keys are correct and active

### Issue: Payment methods show "fallback" source
**Solution:** This is normal for local development - the API will still work

## 📊 Success Indicators

### ✅ Environment is working correctly if:
- Payment methods API returns data
- Direct payment creation returns payment IDs
- QRIS payments return QR codes
- Virtual Account payments return account numbers
- Payment interface loads without errors

### ✅ Purchase flow is working if:
- Order creation succeeds
- Payment creation returns valid payment data
- Redirect to payment interface works
- QR codes or account numbers are displayed

### ✅ Rental flow is working if:
- Rental orders are created with duration
- Payment amounts match rental pricing
- Rental-specific messaging appears
- Payment completion triggers appropriate flows

## 🔧 Development Notes

### Testing with Real Payments
- Xendit development mode allows testing without real money
- Use their test cards and payment methods
- Webhooks will work when payments are completed

### Database Testing
- Orders and payments are stored in your Supabase database
- Check admin panel to verify data is being saved correctly
- Use Supabase dashboard to inspect tables directly

### WhatsApp Testing
- Set valid WHATSAPP_API_KEY to test notifications
- Messages will be sent when payments complete
- Admin notifications go to configured group

## 🎯 Next Steps After Testing

1. **Complete a test payment** using Xendit's test environment
2. **Verify webhook handling** by checking order status updates
3. **Test WhatsApp notifications** if API key is configured
4. **Check admin panel** for order and payment data
5. **Deploy to staging** for further testing

---

**💡 Tip:** Keep the browser console open while testing to see detailed logs and catch any errors immediately.
