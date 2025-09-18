# 🚀 PRODUCTION E2E TESTING GUIDE
## Testing www.jbalwikobra.com with Development Keys

### ✅ **Quick Setup**
1. Navigate to: **https://www.jbalwikobra.com**
2. Open Developer Console (F12)
3. Copy and paste the contents of `production-e2e-test.js`
4. The script will automatically detect the domain and run tests

### 🧪 **Automated Testing (Recommended)**

The script will automatically test:
- ✅ **Payment Methods API** - Verify Xendit integration
- ✅ **Purchase Flow (QRIS)** - Create QRIS payment for scanning
- ✅ **Rental Flow (BNI VA)** - Create virtual account for transfer
- ✅ **Multiple Payment Methods** - Test DANA, Mandiri, BCA, etc.
- ✅ **Payment Interface Pages** - Verify UI components load correctly

### 📱 **Manual UI Testing Steps**

#### **Test Purchase Flow:**
1. Go to **Products** page on www.jbalwikobra.com
2. Select any product and click **"Detail"**
3. Click **"Beli Sekarang"** (Buy Now)
4. Fill customer information:
   ```
   Name: Test User Production
   Email: test@production-e2e.com
   Phone: +628123456789
   ```
5. Select a payment method (QRIS, BCA VA, DANA, etc.)
6. Click **"Bayar Sekarang"** (Pay Now)
7. Verify redirect to payment interface
8. **For QRIS:** Should show QR code for scanning
9. **For Virtual Account:** Should show account number and transfer instructions

#### **Test Rental Flow:**
1. Find a product with **rental options**
2. Select rental duration (e.g., "1 hari", "3 hari")
3. Click **"Sewa Sekarang"** (Rent Now)
4. Fill customer information
5. Select payment method
6. Complete the payment flow
7. Verify rental-specific messaging and pricing

### 🔍 **Expected Results**

#### **✅ Successful API Responses:**
```javascript
// Payment Methods API
{
  "source": "xendit_api",
  "payment_methods": [...],
  "total": 10+
}

// QRIS Payment Creation
{
  "id": "pmt_xxx",
  "status": "ACTIVE",
  "qr_string": "00020101021...",
  "amount": 50000
}

// Virtual Account Payment Creation
{
  "id": "pmt_xxx", 
  "status": "ACTIVE",
  "account_number": "888017712345678",
  "bank_code": "BNI"
}
```

#### **✅ Payment Interface Pages:**
- **QRIS:** Shows QR code with countdown timer
- **Virtual Account:** Shows account number, amount, transfer instructions
- **E-Wallets:** Direct redirect to app or custom interface
- **Credit Card:** Xendit's secure card form

### ⚠️ **Testing with Development Keys**

Your development Xendit keys are configured to:
- ✅ **Create test payments** without real money
- ✅ **Generate QR codes** for testing
- ✅ **Provide virtual account numbers** for testing
- ✅ **Allow webhook testing** when payments complete

#### **🧪 Complete a Test Payment:**
1. **QRIS:** Use Xendit's test QR scanner or wait for timeout
2. **Virtual Account:** Use test transfer or wait for timeout  
3. **E-Wallets:** Use Xendit simulator
4. **Credit Card:** Use test card numbers

### 📊 **Monitoring & Verification**

#### **Check Admin Panel:**
1. Go to **Admin Dashboard** (if you have access)
2. Check **Orders** section for new test orders
3. Verify **Payment Data** is being stored correctly
4. Look for **WhatsApp notifications** (if configured)

#### **Check Browser Console:**
- No JavaScript errors during checkout
- API calls returning expected responses
- Payment methods loading correctly
- Redirect flows working smoothly

#### **Check Xendit Dashboard:**
1. Log into **Xendit Dashboard** (development mode)
2. Go to **Transactions** → **Payment Links/Requests**  
3. Verify test payments are appearing
4. Check payment statuses and details

### 🚨 **Common Issues & Solutions**

#### **Issue: "Payment methods not available"**
**Solution:** Development keys might not be active. Check Xendit dashboard settings.

#### **Issue: "Failed to create payment"**
**Solution:** Check browser console for API errors. Verify environment variables.

#### **Issue: Payment interface not loading**
**Solution:** Check if payment ID is valid. Verify URL parameters.

#### **Issue: Webhooks not working**
**Solution:** Development webhooks may need different setup. Check Xendit webhook settings.

### 🎯 **Success Criteria**

Your production E2E testing is successful if:
- ✅ Payment methods API returns available options
- ✅ Purchase payments create successfully with QR codes/account numbers
- ✅ Rental payments work with different durations
- ✅ Payment interfaces load and display correctly
- ✅ No console errors during the flow
- ✅ Orders are stored in the database
- ✅ Payment data is properly linked to orders

### 🚀 **Next Steps After Testing**

1. **Switch to Live Keys:** Replace development keys with production keys
2. **Test Real Payments:** Make small real transactions to verify
3. **Monitor Performance:** Check payment success rates and timing
4. **User Acceptance Testing:** Have real users test the flows
5. **Launch:** Announce the new payment system to customers

---

**💡 Pro Tip:** Keep the browser console open during testing to see real-time logs and catch any issues immediately!
