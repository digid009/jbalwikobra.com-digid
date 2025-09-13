# 🗃️ JB ALWIKOBRA DATABASE SCHEMA VERIFICATION

## 📊 Database Overview
**Total Records:** 509 across 12 main tables
**Database URL:** https://xeithuvgldzxnggxadri.supabase.co
**Status:** ✅ All core tables operational

---

## 🏗️ Core Tables Structure

### 1. 👥 Users Table
- **Records:** 30 total (1 admin, 12 verified)
- **Purpose:** User authentication and profile management

**Columns:**
```sql
id                    UUID PRIMARY KEY
phone                 VARCHAR (unique identifier)
email                 VARCHAR 
password_hash         VARCHAR (bcrypt hashed)
name                  VARCHAR
is_active            BOOLEAN (default: true)
is_admin             BOOLEAN (default: false)
avatar_url           VARCHAR
created_at           TIMESTAMP WITH TIME ZONE
updated_at           TIMESTAMP WITH TIME ZONE  
last_login_at        TIMESTAMP WITH TIME ZONE
phone_verified       BOOLEAN (default: false)
phone_verified_at    TIMESTAMP WITH TIME ZONE
profile_completed    BOOLEAN (default: false)
profile_completed_at TIMESTAMP WITH TIME ZONE
date_of_birth        DATE
gender               VARCHAR
bio                  TEXT
notification_preferences JSONB
login_attempts       INTEGER (default: 0)
locked_until         TIMESTAMP WITH TIME ZONE
```

**Sample Data:**
- Admin: `admin@jbalwikobra.com` (AlWIKOBRA01)
- Regular users: Various Indonesian phone numbers
- Profile completion: 40% (12/30 users)

---

### 2. 📦 Orders Table
- **Records:** 189 total
- **Purpose:** E-commerce order management

**Columns:**
```sql
id                   UUID PRIMARY KEY
product_id           UUID (FK to products)
customer_name        VARCHAR
customer_email       VARCHAR
customer_phone       VARCHAR  
order_type          VARCHAR
amount              NUMERIC
status              VARCHAR (pending|paid|completed|cancelled)
payment_method      VARCHAR (xendit)
rental_duration     INTEGER
created_at          TIMESTAMP WITH TIME ZONE
updated_at          TIMESTAMP WITH TIME ZONE
user_id             UUID (FK to users)
xendit_invoice_id   VARCHAR
xendit_invoice_url  VARCHAR
currency            VARCHAR (default: IDR)
expires_at          TIMESTAMP WITH TIME ZONE
paid_at             TIMESTAMP WITH TIME ZONE
payment_channel     VARCHAR
payer_email         VARCHAR
payer_phone         VARCHAR
client_external_id  VARCHAR
```

**Status Distribution:**
- Cancelled: 114 (60%)
- Pending: 49 (26%)
- Paid: 19 (10%)
- Completed: 7 (4%)

---

### 3. 🛍️ Products Table  
- **Records:** 141 total
- **Purpose:** Product catalog management

**Sample Columns:**
```sql
id              UUID PRIMARY KEY
name            VARCHAR
description     TEXT
price           NUMERIC
original_price  NUMERIC
```

**Sample Products:**
- FREE FIRE B1
- Mobile gaming top-ups
- Digital vouchers

---

### 4. 🎯 Banners Table
- **Records:** 2 active
- **Purpose:** Homepage promotional banners

**Columns:**
```sql
id          UUID PRIMARY KEY  
title       VARCHAR
subtitle    VARCHAR
image_url   VARCHAR
link_url    VARCHAR
```

**Active Banners:**
- "TOPUP MURAH" campaign
- Other promotional content

---

### 5. 📱 Feed Posts Table
- **Records:** 7 posts
- **Purpose:** Social feed content management

**Columns:**
```sql
id          UUID PRIMARY KEY
user_id     UUID (FK to users) 
type        VARCHAR
product_id  UUID (FK to products)
title       VARCHAR
```

---

### 6. 📞 Phone Verifications Table
- **Records:** 29 verifications
- **Purpose:** SMS verification system

**Columns:**
```sql
id                  UUID PRIMARY KEY
user_id            UUID (FK to users)
phone              VARCHAR
verification_code  VARCHAR
expires_at         TIMESTAMP WITH TIME ZONE
```

---

### 7. 🔐 User Sessions Table
- **Records:** 89 sessions
- **Purpose:** Authentication session management

**Columns:**
```sql
id            UUID PRIMARY KEY
user_id       UUID (FK to users)
session_token VARCHAR
expires_at    TIMESTAMP WITH TIME ZONE
created_at    TIMESTAMP WITH TIME ZONE
```

---

### 8. 🔔 Admin Notifications Table
- **Records:** 5 notifications
- **Purpose:** Admin dashboard notifications

**Columns:**
```sql
id        UUID PRIMARY KEY
type      VARCHAR
title     VARCHAR
message   TEXT
order_id  UUID (FK to orders)
```

---

### 9. ⭐ Reviews Table
- **Records:** 1 review
- **Purpose:** Product review system

**Columns:**
```sql
id         UUID PRIMARY KEY
user_id    UUID (FK to users)
product_id UUID (FK to products)
rating     INTEGER
comment    TEXT
```

---

### 10. 📨 Notifications Table
- **Records:** 3 notifications
- **Purpose:** User notifications system

**Columns:**
```sql
id      UUID PRIMARY KEY
user_id UUID (FK to users)
type    VARCHAR
title   VARCHAR
body    TEXT
```

---

### 11. ⚡ Flash Sales Table
- **Records:** 13 flash sales
- **Purpose:** Time-limited promotional pricing

**Columns:**
```sql
id             UUID PRIMARY KEY
product_id     UUID (FK to products)
sale_price     NUMERIC
original_price NUMERIC
start_time     TIMESTAMP WITH TIME ZONE
```

---

## 🔍 Data Integrity Status

### ✅ Verified Tables (11/12)
- `users` - Complete with proper authentication fields
- `orders` - Full e-commerce functionality
- `products` - Extensive product catalog
- `banners` - Active promotional system
- `feed_posts` - Social content management
- `phone_verifications` - SMS verification working
- `user_sessions` - Authentication sessions
- `admin_notifications` - Admin alerting system
- `reviews` - Product feedback system  
- `notifications` - User messaging system
- `flash_sales` - Promotional pricing system

### ❌ Missing Tables (1/12)
- `categories` - Product categorization system

---

## 🔗 Foreign Key Relationships

```sql
orders.user_id          -> users.id
orders.product_id       -> products.id
feed_posts.user_id      -> users.id  
feed_posts.product_id   -> products.id
phone_verifications.user_id -> users.id
user_sessions.user_id   -> users.id
admin_notifications.order_id -> orders.id
reviews.user_id         -> users.id
reviews.product_id      -> products.id
notifications.user_id   -> users.id
flash_sales.product_id  -> products.id
```

---

## 💡 Schema Health Summary

### 🟢 Strengths
1. **Complete Authentication System** - Phone verification, sessions, admin roles
2. **Full E-commerce Functionality** - Orders, products, payments via Xendit
3. **Rich User Profiles** - Profile completion tracking, preferences
4. **Social Features** - Feed posts, reviews, notifications
5. **Marketing Tools** - Banners, flash sales, notifications
6. **Audit Trail** - Created/updated timestamps throughout

### 🟡 Observations  
1. **High Order Cancellation Rate** - 60% cancelled orders need investigation
2. **Low Profile Completion** - Only 40% users completed profiles
3. **Single Review** - Review system underutilized
4. **Missing Categories** - Product categorization not implemented

### 🔴 Recommendations
1. **Implement Categories Table** - For better product organization
2. **Review Order Cancellation Flow** - Investigate high cancellation rate
3. **Encourage Profile Completion** - Add incentives for users
4. **Promote Review System** - Encourage post-purchase reviews

---

## 🔧 Environment Variables Required

### Frontend (.env)
```bash
REACT_APP_SUPABASE_URL=https://xeithuvgldzxnggxadri.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_production_FH0rlDXpMSERzMzC9BAnBD74bP3wPRp32gRbk1tudBkkRG0N76DOLxDsopoula45
```

### Vercel Production
```bash
SUPABASE_URL=https://xeithuvgldzxnggxadri.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
XENDIT_SECRET_KEY=xnd_development_***
WHATSAPP_API_KEY=***
```

---

**Database Schema Verification Complete ✅**  
**Last Updated:** September 13, 2025
**Verified by:** Automated Schema Check
