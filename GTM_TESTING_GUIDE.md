# 🧪 Google Tag Manager Testing & Validation Guide
# Comprehensive testing instructions for JB Alwikobra tracking implementation

## 📋 **Pre-Testing Checklist**

### 1. **Environment Setup**
- [ ] GTM Container created and published
- [ ] Environment variables configured in `.env`
- [ ] Google Analytics 4 property created
- [ ] Google Ads account linked (if using ads)

### 2. **Required Environment Variables**
```bash
REACT_APP_GTM_CONTAINER_ID=GTM-XXXXXXX
REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_GOOGLE_ADS_ID=AW-XXXXXXXXX
```

## 🔍 **Testing Methods**

### **Method 1: GTM Preview Mode (Recommended)**
1. Open GTM dashboard
2. Click "Preview" button
3. Enter your local development URL (http://localhost:3000)
4. Navigate through your app
5. Verify events in GTM debug panel

### **Method 2: Browser Developer Tools**
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Type: `dataLayer` to see all events
4. Perform actions and watch events appear

### **Method 3: Google Analytics Real-Time Reports**
1. Open GA4 dashboard
2. Go to Reports > Real-time
3. Navigate your app in another tab
4. Watch events appear in real-time

## 🎯 **Event Testing Scenarios**

### **Scenario 1: Homepage Visit**
**Action:** Visit homepage
**Expected Events:**
```javascript
{
  event: 'page_view',
  page_title: 'JB Alwikobra - Home',
  page_path: '/',
  user_type: 'guest' // or 'authenticated'
}
```

### **Scenario 2: Product View**
**Action:** Click on any product to view details
**Expected Events:**
```javascript
{
  event: 'view_item',
  currency: 'IDR',
  value: [product_price],
  items: [{
    item_id: '[product_id]',
    item_name: '[product_name]',
    item_category: 'mobile_legends', // or other game
    price: [product_price],
    quantity: 1
  }]
}
```

### **Scenario 3: Add to Wishlist**
**Action:** Click heart icon on product
**Expected Events:**
```javascript
{
  event: 'add_to_wishlist',
  currency: 'IDR',
  value: [product_price],
  items: [{
    item_id: '[product_id]',
    item_name: '[product_name]',
    item_category: '[game_category]',
    price: [product_price]
  }]
}
```

### **Scenario 4: Begin Checkout (Purchase)**
**Action:** Click "Beli Sekarang" button
**Expected Events:**
```javascript
{
  event: 'begin_checkout',
  currency: 'IDR',
  value: [product_price],
  transaction_type: 'purchase',
  items: [{
    item_id: '[product_id]',
    item_name: '[product_name]',
    item_category: '[game_category]',
    price: [product_price],
    quantity: 1
  }]
}
```

### **Scenario 5: Begin Checkout (Rental)**
**Action:** Select rental option and click checkout
**Expected Events:**
```javascript
{
  event: 'begin_checkout',
  currency: 'IDR',
  value: [rental_price],
  transaction_type: 'rental',
  items: [{
    item_id: '[product_id]',
    item_name: '[product_name]',
    item_category: '[game_category]',
    price: [rental_price],
    quantity: 1
  }]
}
```

### **Scenario 6: Purchase Completion**
**Action:** Complete purchase flow (reaches payment page)
**Expected Events:**
```javascript
{
  event: 'purchase',
  transaction_id: '[order_id]',
  value: [total_amount],
  currency: 'IDR',
  payment_method: 'xendit',
  transaction_type: 'purchase',
  items: [{
    item_id: '[product_id]',
    item_name: '[product_name]',
    item_category: '[game_category]',
    price: [product_price],
    quantity: 1
  }]
}
```

### **Scenario 7: User Registration**
**Action:** Complete signup process
**Expected Events:**
```javascript
{
  event: 'sign_up',
  method: 'phone'
}
```

### **Scenario 8: User Login**
**Action:** Login with email or phone
**Expected Events:**
```javascript
{
  event: 'login',
  method: 'email' // or 'phone'
}
```

### **Scenario 9: Flash Sale Interaction**
**Action:** Visit flash sale page and click on product
**Expected Events:**
```javascript
{
  event: 'flash_sale_view',
  promotion_id: 'flash_sale',
  promotion_name: 'Flash Sale'
}
```

### **Scenario 10: WhatsApp Contact**
**Action:** Click WhatsApp contact button
**Expected Events:**
```javascript
{
  event: 'whatsapp_contact',
  contact_type: 'rental', // or 'purchase', 'inquiry'
  product_id: '[product_id]'
}
```

## 🐛 **Common Issues & Troubleshooting**

### **Issue 1: No Events Firing**
**Possible Causes:**
- GTM container ID not set in environment variables
- GTM script not loaded (check network tab)
- JavaScript errors preventing tracking

**Solutions:**
- Verify `REACT_APP_GTM_CONTAINER_ID` is set correctly
- Check browser console for errors
- Ensure GTM container is published

### **Issue 2: Events Fire but No Data in GA4**
**Possible Causes:**
- GA4 measurement ID not configured in GTM
- Events not mapped to GA4 in GTM
- Real-time reporting delay

**Solutions:**
- Check GTM tags are configured for GA4
- Wait 5-10 minutes for data to appear
- Verify GA4 configuration tag is firing

### **Issue 3: Duplicate Events**
**Possible Causes:**
- Multiple tracking calls
- React strict mode in development
- Event handler called multiple times

**Solutions:**
- Check for duplicate useTracking calls
- Use React.StrictMode detection
- Add event deduplication logic

### **Issue 4: Wrong Product Categories**
**Possible Causes:**
- Product category mapping logic incorrect
- Missing category data in products

**Solutions:**
- Check `getGameCategory` function in tracking service
- Verify product data has category information
- Update category mapping logic

## 📊 **Performance Testing**

### **Page Load Impact**
1. Open Chrome DevTools > Network tab
2. Reload page and measure load time
3. GTM should add minimal overhead (<100ms)
4. Check for any failed requests

### **Bundle Size Impact**
1. Run `npm run build:analyze`
2. Check if tracking code significantly increases bundle size
3. Ensure tracking service is tree-shaken properly

## 🚀 **Production Validation**

### **Pre-Launch Checklist**
- [ ] All test scenarios pass in staging
- [ ] GTM container published to live
- [ ] Production environment variables set
- [ ] Real-time data flowing to GA4
- [ ] Google Ads conversions tracking (if applicable)

### **Post-Launch Monitoring**
- [ ] Check GA4 real-time reports after launch
- [ ] Monitor GTM debug console for errors
- [ ] Verify conversion tracking in Google Ads
- [ ] Set up automated reporting dashboards

## 🎯 **Google Ads Optimization**

### **Conversion Events to Track**
1. **Purchase Completion** - Primary conversion
2. **Add to Wishlist** - Micro-conversion
3. **Begin Checkout** - Funnel tracking
4. **User Registration** - Lead generation
5. **WhatsApp Contact** - Engagement

### **Audience Building**
- **Product Viewers:** Users who viewed specific game categories
- **Purchasers:** Users who completed purchases
- **High-Value Customers:** Users with purchase value > threshold
- **Cart Abandoners:** Users who began checkout but didn't complete

## 📈 **Success Metrics**

### **Tracking Health Metrics**
- **Event Coverage:** >95% of user actions tracked
- **Data Accuracy:** <5% discrepancy between GTM and GA4
- **Performance Impact:** <100ms additional page load time
- **Error Rate:** <1% tracking errors

### **Business Metrics**
- **Conversion Rate:** Purchase/rental completion rate
- **Average Order Value:** Revenue per transaction
- **Customer Lifetime Value:** Total value per user
- **Return on Ad Spend (ROAS):** Revenue/Ad spend ratio

## 🔧 **Developer Tools**

### **Chrome Extensions**
- **GTM/GA Debugger:** For real-time event debugging
- **GA4 Enhanced Ecommerce Checker:** Validate e-commerce events
- **DataLayer Checker:** Inspect dataLayer contents

### **Testing Commands**
```bash
# Start development server with tracking enabled
npm start

# Check for tracking-related console errors
# Open browser console and look for [Tracking] logs

# Test in production mode
npm run build && npm run start
```

## 📞 **Support & Resources**

### **Documentation Links**
- [GTM Implementation Guide](https://developers.google.com/tag-manager/devguide)
- [GA4 Enhanced Ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Google Ads Conversion Tracking](https://support.google.com/google-ads/answer/1722054)

### **Debug Resources**
- GTM Preview Mode
- GA4 Real-time Reports
- Google Ads Conversion Tracking
- Browser Developer Tools