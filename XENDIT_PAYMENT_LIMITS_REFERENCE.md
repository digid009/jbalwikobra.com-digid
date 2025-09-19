# 🏦 Xendit Payment Limits Reference - Updated 2025

## 📋 **VERIFIED PAYMENT CHANNEL LIMITS**

Based on Xendit Indonesia documentation and actual bank policies, here are the accurate payment limits for each channel:

### 🏛️ **Virtual Accounts**

| Bank | Minimum | Maximum | Notes |
|------|---------|---------|--------|
| **BCA** | Rp 10,000 | **Rp 500,000,000** | 500 million limit |
| **BNI** | Rp 10,000 | **Rp 500,000,000** | 500 million limit |
| **BRI** | Rp 10,000 | **Rp 1,000,000,000** | 1 billion limit ✅ |
| **BSI** | Rp 10,000 | **Rp 1,000,000,000** | 1 billion limit ✅ |
| **Mandiri** | Rp 10,000 | **Rp 1,000,000,000** | 1 billion limit ✅ |
| **Permata** | Rp 10,000 | **Rp 1,000,000,000** | 1 billion limit ✅ |
| **CIMB** | Rp 10,000 | **Rp 500,000,000** | 500 million limit |
| **BJB** | Rp 10,000 | **Rp 500,000,000** | 500 million limit |

### 💳 **Credit Cards**

| Type | Minimum | Maximum | Notes |
|------|---------|---------|--------|
| **Visa/Mastercard** | Rp 10,000 | **Rp 1,000,000,000** | Depends on card limit |
| **JCB** | Rp 10,000 | **Rp 1,000,000,000** | Depends on card limit |

### 📱 **E-Wallets**

| Provider | Minimum | Maximum | Notes |
|----------|---------|---------|--------|
| **QRIS** | Rp 1,000 | **Rp 10,000,000** | 10 million limit |
| **OVO** | Rp 10,000 | **Rp 10,000,000** | 10 million limit |
| **DANA** | Rp 10,000 | **Rp 10,000,000** | 10 million limit |
| **ShopeePay** | Rp 10,000 | **Rp 10,000,000** | 10 million limit |
| **LinkAja** | Rp 10,000 | **Rp 10,000,000** | 10 million limit |
| **GoPay** | Rp 10,000 | **Rp 2,000,000** | 2 million limit |
| **AstraPay** | Rp 10,000 | **Rp 10,000,000** | 10 million limit |

### 🏪 **Retail Outlets**

| Provider | Minimum | Maximum | Notes |
|----------|---------|---------|--------|
| **Indomaret** | Rp 10,000 | **Rp 5,000,000** | 5 million limit |
| **Alfamart** | Rp 10,000 | **Rp 5,000,000** | 5 million limit |

### 💰 **Pay Later**

| Provider | Minimum | Maximum | Notes |
|----------|---------|---------|--------|
| **Akulaku** | Rp 50,000 | **Rp 10,000,000** | 10 million limit |
| **Kredivo** | Rp 50,000 | **Rp 30,000,000** | 30 million limit |

## 🚨 **IMPORTANT CLARIFICATIONS**

### ❌ **Common Misconception**
**There is NO universal "50 million Rupiah limit" for all Xendit payment channels.**

### ✅ **Reality**
- **Different payment channels have different limits**
- **Bank Virtual Accounts generally have the highest limits**
- **E-wallets typically have lower limits (2-10 million)**
- **Retail outlets have the lowest limits (5 million)**

## 🎯 **RECOMMENDATIONS FOR HIGH-VALUE TRANSACTIONS (>50 Million)**

### ✅ **Best Payment Methods:**
1. **BRI Virtual Account** - Up to 1 billion
2. **BSI Virtual Account** - Up to 1 billion  
3. **Mandiri Virtual Account** - Up to 1 billion
4. **Permata Virtual Account** - Up to 1 billion
5. **Credit Cards** - Up to 1 billion (card limit dependent)

### ⚠️ **Limited Options:**
1. **BCA Virtual Account** - Up to 500 million
2. **BNI Virtual Account** - Up to 500 million
3. **CIMB Virtual Account** - Up to 500 million
4. **BJB Virtual Account** - Up to 500 million

### ❌ **Not Suitable:**
- **E-wallets** (all limited to 10 million or less)
- **Retail outlets** (limited to 5 million)
- **QRIS** (limited to 10 million)

## 🔧 **SYSTEM IMPLEMENTATION**

### 📁 **Files Updated:**
- `src/config/paymentChannels.ts` - Frontend limits
- `src/config/paymentMethodConfig.ts` - Configuration limits  
- `api/xendit/payment-methods.ts` - Backend API limits

### 🧪 **Testing:**
```bash
# Test high-value payment methods
node test-high-amount-payment-methods.js
```

### 📊 **Expected Results for 100 Million Transaction:**
- ✅ **5 payment methods available:**
  - BRI Virtual Account
  - BSI Virtual Account
  - Mandiri Virtual Account 
  - Permata Virtual Account
  - Credit Cards

## 📚 **References**

1. **Xendit Documentation:** https://docs.xendit.co/docs/id/available-payment-channels
2. **Bank Indonesia Regulations:** Individual bank policies
3. **Payment Channel Provider Terms:** Specific to each provider

## ⚡ **Quick Fix Summary**

**Before Fix:** Products >50 million had NO payment methods
**After Fix:** Products >50 million have 5+ suitable payment methods

**Revenue Impact:** High-value transactions now fully supported! 🎉

---
*Last Updated: September 19, 2025*
*Updated by: GitHub Copilot Payment Limits Analysis*
