# Payment Flow Manual Testing Guide

## 🎯 Testing Objective
Test the complete purchase flow from product selection to checkout modal, focusing on:
1. UI improvements (removed payment summary)
2. Form validation
3. Payment method display
4. Flash sale vs regular product checkout
5. Modal readability improvements

## 🧪 Test Scenarios

### 1. Regular Product Purchase Flow
**Steps:**
1. Open http://localhost:3003
2. Navigate to Products page
3. Select a regular (non-flash sale) product
4. Click "Detail" to view product detail page
5. Click "Beli Sekarang" (Buy Now)
6. Fill customer information form:
   - Name: "Test User"
   - Email: "test@localhost.com"  
   - WhatsApp: "+628123456789"
7. Verify checkout modal appearance
8. Check that rental options are visible (if product has rental)
9. Attempt to submit

**Expected Results:**
- ✅ Modal has black background (readable)
- ✅ No "Ringkasan Pembayaran" section visible
- ✅ Customer form, payment methods, and actions only
- ✅ Form validation works for empty fields
- ✅ Phone number validation works
- ✅ Payment methods display correctly

### 2. Flash Sale Product Purchase Flow  
**Steps:**
1. Navigate to Flash Sales page
2. Select a flash sale product
3. Click on flash sale card (should navigate to detail page)
4. Verify flash sale detail page shows:
   - Original price (crossed out)
   - Sale price
   - Discount percentage
   - Working countdown timer
5. Click "Beli Sekarang"
6. Fill customer form
7. Verify checkout modal

**Expected Results:**
- ✅ Flash sale navigation works correctly
- ✅ Countdown timer updates dynamically
- ✅ Rental options are hidden for flash sale products
- ✅ Checkout modal shows correct flash sale price
- ✅ Modal has clean interface without payment summary

### 3. Rental Product Flow
**Steps:**
1. Find a product with rental options
2. View product detail page
3. Select a rental duration
4. Click "Sewa Sekarang" (Rent Now)
5. Fill customer form
6. Verify rental-specific elements

**Expected Results:**
- ✅ Rental options display correctly
- ✅ Selected rental duration shows in modal header
- ✅ Rental price calculates correctly
- ✅ WhatsApp rental option works

### 4. Form Validation Testing
**Test Cases:**
1. Submit with empty name → should show error
2. Submit with invalid email → should show error  
3. Submit with invalid phone → should show error
4. Submit with valid data → should proceed (may fail at API call, that's ok)

### 5. UI/UX Improvements Verification
**Check:**
- [ ] Modal background is solid black (not transparent)
- [ ] No "Ringkasan Pembayaran" section
- [ ] Product details shown in header only
- [ ] Clean, streamlined form layout
- [ ] Payment methods display properly
- [ ] Mobile responsiveness works

## 🐛 Common Issues to Watch For

### JavaScript Errors
Check browser console for:
- Missing component imports
- State management errors
- Type validation errors
- API call failures

### UI Issues
- Modal z-index problems
- Text readability issues
- Form field validation display
- Mobile layout problems

### Flash Sale Specific
- Timer not updating
- Navigation not working
- Rental options showing when they shouldn't
- Incorrect pricing display

## 📊 Test Results Template

```
✅/❌ Regular product purchase flow
✅/❌ Flash sale product purchase flow  
✅/❌ Rental product flow
✅/❌ Form validation working
✅/❌ Modal UI improvements applied
✅/❌ Payment methods display correctly
✅/❌ Mobile responsiveness

Issues Found:
1. [Issue description]
2. [Issue description]
```

## 🛠️ Debugging Tips

### Browser Console
```javascript
// Check for flash sale data
console.log('Flash sale state:', window.location.state);

// Check product detail state
console.log('Product data:', document.querySelector('[data-product-id]'));

// Monitor form validation
document.querySelector('form').addEventListener('submit', e => {
  console.log('Form submission:', e);
});
```

### React DevTools
- Check component state in ProductDetailPage
- Verify props passed to CheckoutModal
- Monitor useProductDetail hook state

### Network Tab
- API calls should fail gracefully in development
- No unexpected 404s for static assets
- XHR/Fetch requests show correct payloads

## 🎯 Success Criteria

The payment flow is working correctly if:
1. All UI improvements are visible
2. Form validation prevents invalid submissions  
3. Flash sale features work as expected
4. No JavaScript errors in console
5. Modal is readable and functional
6. User experience is smooth and intuitive

## 📝 Notes
- API calls will fail in localhost (this is expected)
- Focus on frontend behavior and UI/UX
- Test both desktop and mobile views
- Verify all recent changes are working
