# Database Schema Fix Summary

## Issue
Two database columns were referenced in the code but didn't exist in the schema, causing errors:

1. **`payments.paid_at`** - Webhook trying to update non-existent column
   - Error: `Could not find the 'paid_at' column of 'payments' in the schema cache`
   - Location: `api/xendit/webhook.ts` line 632, 662, 741

2. **`orders.product_name`** - Admin API trying to select non-existent column
   - Error: `column orders.product_name does not exist`
   - Location: `api/admin.ts` line 222
   - Also referenced in: `api/xendit/create-invoice.ts` lines 166, 195, 208, 249

## Root Cause
- The `payments` table was referenced with a `paid_at` column but it was never added in migrations
- The `orders` table was expected to have a `product_name` column for denormalized data but it was never created
- Order creation code was trying to SELECT `product_name` but never INSERT it

## Solution

### 1. Database Migration (`supabase/migrations/20251228_add_missing_columns.sql`)
- **Added `payments.paid_at` column**: `TIMESTAMPTZ` to track when payment was completed
- **Added `orders.product_name` column**: `TEXT` to store denormalized product name
- **Created indexes** on both new columns for better query performance
- **Backfilled data**: Updated existing orders with product names from the products table

### 2. Code Updates

#### `api/xendit/create-invoice.ts`
- Added product name fetch before order creation
- Included `product_name` in order payload during insert and upsert
- Included `product_name` in order updates

#### `api/xendit/create-direct-payment.ts`
- Added product name fetch before order creation  
- Included `product_name` in order payload during insert
- Included `product_name` in select statement

### 3. Webhook Behavior
The webhook (`api/xendit/webhook.ts`) already had the correct code to update `payments.paid_at`, it just needed the column to exist. No changes required.

## Migration Instructions

### For Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251228_add_missing_columns.sql`
3. Paste and run the migration
4. Verify success by checking the verification output

### For Supabase CLI
```bash
# If using Supabase CLI
supabase migration up --local  # For local testing
supabase migration up          # For production
```

## Testing Checklist
- [ ] Run the migration in Supabase
- [ ] Verify `payments` table has `paid_at` column
- [ ] Verify `orders` table has `product_name` column
- [ ] Test webhook payment completion (should update payments.paid_at)
- [ ] Test admin panel order list (should display product names)
- [ ] Test new order creation (should populate product_name)
- [ ] Check that existing orders were backfilled with product names

## Expected Results

### Before Fix
```
❌ Webhook Error: Could not find the 'paid_at' column of 'payments'
❌ Admin API Error: column orders.product_name does not exist
```

### After Fix
```
✅ Webhook successfully updates payments.paid_at when payment completes
✅ Admin API successfully lists orders with product names
✅ New orders automatically populate product_name field
✅ Existing orders backfilled with product names where available
```

## Impact
- **Low Risk**: Only adds columns, doesn't modify existing data structure
- **No Breaking Changes**: All existing queries continue to work
- **Performance**: Indexes added to optimize queries on new columns
- **Data Integrity**: Backfill ensures historical data is complete

## Rollback (if needed)
```sql
-- Remove the added columns
ALTER TABLE public.payments DROP COLUMN IF EXISTS paid_at;
ALTER TABLE public.orders DROP COLUMN IF EXISTS product_name;

-- Remove indexes
DROP INDEX IF EXISTS idx_payments_paid_at;
DROP INDEX IF EXISTS idx_orders_product_name;
```

## Related Files
- Migration: `supabase/migrations/20251228_add_missing_columns.sql`
- Updated: `api/xendit/create-invoice.ts`
- Updated: `api/xendit/create-direct-payment.ts`
- Reference: `api/xendit/webhook.ts` (no changes needed)
- Reference: `api/admin.ts` (no changes needed)
