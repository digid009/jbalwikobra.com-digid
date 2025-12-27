# Google Tag Manager - Additional Tags Setup (Step 6+)

## Overview
Your GTM container (G-4K6YY64XKN) should now be set up with basic page view tracking. This guide will help you create additional tags for tracking specific user actions on your gaming e-commerce platform.

## Current Status ✅
- [x] GTM container created and linked
- [x] Page view tracking enabled
- [x] DataLayer events implemented in React components:
  - `view_item` - Product page views
  - `begin_checkout` - Checkout initiation
  - `purchase` - Purchase completion
  - `add_to_wishlist` - Wishlist additions
  - `login` - User login
  - `sign_up` - User registration

## Step 6: Create Additional Event Tags

### 6.1 Product View Tracking Tag

1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `view_item`

3. **Event Parameters:**
   ```
   currency: {{DLV - currency}}
   value: {{DLV - value}}
   item_id: {{DLV - item_id}}
   item_name: {{DLV - item_name}}
   item_category: {{DLV - item_category}}
   item_category2: {{DLV - item_category2}}
   content_type: {{DLV - content_type}}
   ```

4. **Triggering:**
   - Choose "Custom Event"
   - Event name: `view_item`

5. **Save as:** "GA4 - Product View"

### 6.2 Purchase Tracking Tag

1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `purchase`

3. **Event Parameters:**
   ```
   transaction_id: {{DLV - transaction_id}}
   value: {{DLV - value}}
   currency: {{DLV - currency}}
   items: {{DLV - items}}
   ```

4. **Triggering:**
   - Choose "Custom Event"
   - Event name: `purchase`

5. **Save as:** "GA4 - Purchase"

### 6.3 Begin Checkout Tracking Tag

1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `begin_checkout`

3. **Event Parameters:**
   ```
   currency: {{DLV - currency}}
   value: {{DLV - value}}
   items: {{DLV - items}}
   ```

4. **Triggering:**
   - Choose "Custom Event"
   - Event name: `begin_checkout`

5. **Save as:** "GA4 - Begin Checkout"

### 6.4 Add to Wishlist Tracking Tag

1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `add_to_wishlist`

3. **Event Parameters:**
   ```
   currency: {{DLV - currency}}
   value: {{DLV - value}}
   items: {{DLV - items}}
   ```

4. **Triggering:**
   - Choose "Custom Event"
   - Event name: `add_to_wishlist`

5. **Save as:** "GA4 - Add to Wishlist"

### 6.5 User Authentication Tags

**Login Tag:**
1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `login`

3. **Triggering:**
   - Choose "Custom Event"
   - Event name: `login`

4. **Save as:** "GA4 - Login"

**Sign Up Tag:**
1. **In GTM, go to Tags → New**
2. **Tag Configuration:**
   - Choose "Google Analytics: GA4 Event"
   - Configuration Tag: Select your GA4 config tag
   - Event Name: `sign_up`

3. **Triggering:**
   - Choose "Custom Event"
   - Event name: `sign_up`

4. **Save as:** "GA4 - Sign Up"

## Step 7: Create Data Layer Variables

Before the tags work properly, you need to create variables to capture data from the dataLayer:

### 7.1 Create Variables for Product Data

1. **Go to Variables → User-Defined Variables → New**
2. **For each parameter, create a "Data Layer Variable":**

   - **Currency Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `currency`
     - Name: `DLV - currency`

   - **Value Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `value`
     - Name: `DLV - value`

   - **Item ID Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `item_id`
     - Name: `DLV - item_id`

   - **Item Name Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `item_name`
     - Name: `DLV - item_name`

   - **Item Category Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `item_category`
     - Name: `DLV - item_category`

   - **Item Category2 Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `item_category2`
     - Name: `DLV - item_category2`

   - **Content Type Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `content_type`
     - Name: `DLV - content_type`

   - **Transaction ID Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `transaction_id`
     - Name: `DLV - transaction_id`

   - **Items Array Variable:**
     - Variable Type: Data Layer Variable
     - Data Layer Variable Name: `items`
     - Name: `DLV - items`

## Step 8: Test Your Setup

### 8.1 Preview Mode Testing

1. **In GTM, click "Preview"**
2. **Enter your development URL:** `http://localhost:3000`
3. **Navigate through your app and verify:**
   - Page views are tracked
   - Product views trigger `view_item` events
   - Checkout actions trigger `begin_checkout` events
   - Purchases trigger `purchase` events
   - Wishlist additions trigger `add_to_wishlist` events
   - Login/signup trigger respective events

### 8.2 Debug in Browser

1. **Open browser DevTools → Console**
2. **Check for dataLayer events:**
   ```javascript
   // Check current dataLayer content
   console.log(window.dataLayer);
   ```

3. **Verify GTM is loading:**
   - Look for GTM scripts in Network tab
   - Check for GTM debug panel in preview mode

## Step 9: Publish Your Container

Once testing is complete:

1. **Exit Preview mode**
2. **Click "Submit" in GTM**
3. **Add Version Name:** "Initial GA4 Setup with E-commerce Tracking"
4. **Add Description:** "Added product view, purchase, checkout, wishlist, and authentication tracking"
5. **Click "Publish"**

## Gaming-Specific Events (Optional Advanced Setup)

For your gaming platform, consider adding these custom events:

### Account Rental Events
```javascript
// When user rents an account
dataLayer.push({
  'event': 'account_rental',
  'rental_type': 'mobile_legends', // mobile_legends, pubg, free_fire, genshin
  'rental_duration': '7_days',
  'rental_price': 50000,
  'currency': 'IDR'
});
```

### Account Purchase Events
```javascript
// When user buys an account permanently
dataLayer.push({
  'event': 'account_purchase',
  'account_type': 'mobile_legends',
  'account_level': 'mythic',
  'purchase_price': 500000,
  'currency': 'IDR'
});
```

## Troubleshooting

### Common Issues:

1. **Tags not firing:** Check trigger conditions match event names exactly
2. **Data not appearing:** Verify variable names match dataLayer keys
3. **Preview mode not working:** Ensure GTM script is in page head
4. **Events showing as (not set):** Check that dataLayer variables are created

### Debug Commands:

```javascript
// Check if GTM is loaded
console.log('GTM loaded:', typeof google_tag_manager !== 'undefined');

// Monitor dataLayer pushes
window.dataLayer = window.dataLayer || [];
window.dataLayer.push = function(obj) {
  console.log('DataLayer push:', obj);
  Array.prototype.push.call(this, obj);
};
```

## Next Steps

After implementing these tags:

1. **Connect to Google Ads** for conversion tracking
2. **Set up Google Analytics 4** for detailed reporting
3. **Configure Enhanced E-commerce** for advanced insights
4. **Add custom dimensions** for gaming-specific data

Your GTM setup will now track comprehensive user behavior for optimizing your Google Ads campaigns!