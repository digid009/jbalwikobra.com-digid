# 🧪 Manual End-to-End Testing Guide
**Purchase and Rental Flow Verification**

## ✅ **What We've Verified Automatically:**
- 🔗 **Webhook endpoints**: Working on both local and production
- 📱 **WhatsApp group messaging**: Successfully sending test messages
- 🏗️ **Code compilation**: All builds successful with no errors
- 🗂️ **File cleanup**: All duplicates and conflicts removed

## 🎯 **Manual Testing Steps Required:**

### **1. 🛒 Purchase Flow Test**

#### **Step 1: Access the Application**
- Go to: https://www.jbalwikobra.com (Production) or http://localhost:3000 (Local)
- Verify the homepage loads correctly

#### **Step 2: Browse Products**
- Navigate to the products section
- Find a **regular product** (not rental)
- Click on a product to view details

#### **Step 3: Initiate Purchase**
- Click "Buy Now" or equivalent purchase button
- Fill in customer details:
  - **Name**: Test Customer Purchase
  - **Email**: test.purchase@example.com
  - **Phone**: +62 896 5351 0125 (or your WhatsApp number)
- Select payment method (QRIS recommended for testing)

#### **Step 4: Verify Payment Creation**
- Confirm order details are correct
- Click "Proceed to Payment"
- **✅ Expected Result**: 
  - Payment page loads with QR code or payment instructions
  - **Check WhatsApp**: You should receive a payment link notification message

#### **Step 5: Simulate Payment Success**
- For testing, we'll simulate webhook manually
- The payment page should show payment instructions
- **✅ Expected Result**: Professional payment link message received

---

### **2. 🏠 Rental Flow Test**

#### **Step 1: Find Rental Product**
- Browse products and find one marked as **"Rental"**
- Look for products with duration options (30 days, etc.)

#### **Step 2: Initiate Rental**
- Click on rental product
- Select rental duration
- Fill in customer details:
  - **Name**: Test Customer Rental  
  - **Email**: test.rental@example.com
  - **Phone**: +62 896 5351 0125 (or your WhatsApp number)

#### **Step 3: Verify Rental Payment**
- Select payment method (Bank Transfer recommended for rentals)
- Review rental terms and duration
- **✅ Expected Result**: 
  - Rental-specific payment page loads
  - **Check WhatsApp**: Receive rental payment link notification (different template than purchase)

---

### **3. 📱 WhatsApp Notifications Testing**

#### **Admin Group Notifications:**
1. When a payment is "completed" (webhook triggered), admins should receive:
   - **Purchase Orders**: 30-minute deadline message with purchase checklist
   - **Rental Orders**: 15-minute deadline message with video call requirements

#### **Customer Notifications:**
1. **Payment Link**: Sent when payment is created
2. **Success Confirmation**: Sent when payment is completed (webhook triggered)

---

### **4. 🔧 Admin Panel Testing**

#### **Step 1: Access Admin Dashboard**
- Go to: `/admin` (add your authentication)
- Navigate to **WhatsApp Settings**

#### **Step 2: Verify Group Configuration**
- Check that different WhatsApp groups are configured for:
  - Purchase Orders
  - Rental Orders  
  - Flash Sales
  - General Notifications

#### **Step 3: Test Group Selection**
- Use the "Quick Selection Tool"
- Verify group dropdowns are populated
- Save configuration changes

---

### **5. 🎬 Webhook Simulation (Manual)**

Since we can't complete real payments easily, here's how to trigger the webhook manually:

#### **Using the Test Endpoint:**
```bash
# Test WhatsApp Group Message
curl -X POST "https://www.jbalwikobra.com/api/xendit/webhook?testGroupSend=1" \
  -H "Content-Type: application/json" \
  -d '{
    "testGroupSend": true,
    "message": "🧪 Manual Test: System Working Correctly!"
  }'
```

#### **Simulate Purchase Payment Success:**
```bash
# Simulate successful purchase payment
curl -X POST "https://www.jbalwikobra.com/api/xendit/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Callback-Token: your_xendit_callback_token" \
  -d '{
    "event": "qr_code.callback",
    "data": {
      "id": "test_payment_123",
      "external_id": "test_order_123", 
      "status": "SUCCEEDED",
      "amount": 50000,
      "paid_at": "2025-09-18T10:00:00Z",
      "payment_channel": "QRIS"
    }
  }'
```

---

## 📋 **Expected Results Checklist:**

### **Purchase Flow:**
- [ ] Product selection works correctly
- [ ] Customer form accepts all required data
- [ ] Payment page loads with correct amount
- [ ] **WhatsApp**: Payment link notification received
- [ ] **WhatsApp**: Success notification received (after webhook)
- [ ] **WhatsApp**: Admin group notification received with purchase checklist

### **Rental Flow:**
- [ ] Rental product selection works
- [ ] Duration options display correctly
- [ ] Rental-specific pricing shown
- [ ] **WhatsApp**: Rental payment link notification received
- [ ] **WhatsApp**: Rental success notification received
- [ ] **WhatsApp**: Admin group notification with 15-min deadline and video call requirements

### **Admin Panel:**
- [ ] WhatsApp Settings page loads correctly
- [ ] Group configuration dropdowns populated
- [ ] Quick selection tool works
- [ ] Configuration saves successfully

### **WhatsApp Messages:**
- [ ] Professional formatting with emojis and structure
- [ ] Different templates for purchase vs rental
- [ ] Customer messages include next steps and support contact
- [ ] Admin messages include action items and checklists
- [ ] Appropriate group routing based on order type

---

## 🎯 **Success Criteria:**

**🟢 PASS**: All major flows work, WhatsApp notifications are delivered with correct content and formatting

**🟡 PARTIAL**: Most flows work but minor formatting or routing issues  

**🔴 FAIL**: Major functionality broken, payments don't process, or WhatsApp messages not delivered

---

## 🚨 **If Issues Found:**

1. **Check Console**: Look for JavaScript errors in browser console
2. **Check Network**: Verify API calls are successful in browser dev tools
3. **Check Logs**: Look at server logs for any errors
4. **WhatsApp Issues**: Verify provider configuration in admin panel
5. **Database Issues**: Check Supabase connection and table structure

---

## 🎉 **After Testing:**

Once manual testing is complete and successful:

1. **Document any issues found**
2. **Verify all WhatsApp messages received correctly**
3. **Confirm admin panel functionality**
4. **Test with real small payment if possible**
5. **System is ready for production use!**

**Your enhanced payment flow with intelligent WhatsApp messaging is now ready! 🚀**
