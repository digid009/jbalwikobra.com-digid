# ✅ Testing Checklist - Verify Your Tracking Works

## 🚀 **Quick Test Procedure**

### **Step 1: Basic GTM Test**
1. Visit your website: `http://localhost:3000`
2. Open Chrome DevTools (F12)
3. Go to **Console** tab
4. Type: `dataLayer` and press Enter
5. **Expected Result:** You should see an array with GTM events

### **Step 2: Page View Test**
1. **Action:** Navigate to different pages on your site
2. **Expected Event:** `page_view` should fire for each page
3. **Check:** Look in console for new dataLayer entries

### **Step 3: Product View Test**
1. **Action:** Click on any product to view details
2. **Expected Event:** `view_item` should fire
3. **Expected Data:**
   ```javascript
   {
     event: 'view_item',
     currency: 'IDR',
     value: [product_price],
     items: [{
       item_id: '[product_id]',
       item_name: '[product_name]',
       category: 'gaming_accounts',
       price: [product_price],
       quantity: 1
     }]
   }
   ```

### **Step 4: Begin Checkout Test**
1. **Action:** Click "Beli Sekarang" on any product
2. **Expected Event:** `begin_checkout` should fire
3. **Check:** Look for the event in console

### **Step 5: Wishlist Test**
1. **Action:** Click the heart icon to add to wishlist
2. **Expected Event:** `add_to_wishlist` should fire
3. **Check:** Event should include product details

### **Step 6: Registration Test**
1. **Action:** Complete the signup process
2. **Expected Event:** `sign_up` should fire
3. **Expected Data:**
   ```javascript
   {
     event: 'sign_up',
     method: 'phone'
   }
   ```

### **Step 7: Login Test**
1. **Action:** Login with existing account
2. **Expected Event:** `login` should fire
3. **Expected Data:**
   ```javascript
   {
     event: 'login',
     method: 'email' // or 'phone'
   }
   ```

## 📊 **Google Analytics Real-Time Test**

1. **Open Google Analytics:** [analytics.google.com](https://analytics.google.com)
2. **Go to:** Reports → Real-time → Events
3. **Perform actions** on your website
4. **Watch events** appear in real-time (may take 30-60 seconds)

## 🔍 **GTM Preview Mode Test**

1. **In GTM Dashboard:** Click "Preview" button
2. **Enter your site URL:** `http://localhost:3000`
3. **New tab opens** with GTM debug panel
4. **Navigate your site** and watch events fire in the debug panel
5. **Each event** should show up with full data

## 🐛 **Troubleshooting**

### **No Events in Console:**
- Check if GTM script is loaded (Network tab in DevTools)
- Verify GTM container ID in your HTML
- Make sure container is published

### **Events Not in Google Analytics:**
- Wait 5-10 minutes for data processing
- Check if GA4 measurement ID is correct in GTM tags
- Verify tags are firing in GTM Preview mode

### **Missing Event Data:**
- Check browser console for JavaScript errors
- Verify product data is loaded before tracking
- Make sure dataLayer push is inside try/catch blocks

## ✅ **Success Criteria**

Your tracking is working correctly when you see:
- ✅ dataLayer entries in browser console
- ✅ Events firing in GTM Preview mode
- ✅ Real-time data in Google Analytics
- ✅ No JavaScript errors in console

## 📞 **Next Steps After Testing**

Once everything is working:
1. **Deploy to production** (if testing locally)
2. **Set up Google Ads conversion tracking**
3. **Create custom audiences for remarketing**
4. **Launch your ad campaigns**

Let me know your test results!