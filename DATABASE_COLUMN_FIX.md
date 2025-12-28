# Quick Start: Database Column Fix

## The Problem
```
❌ Webhook Error: Could not find the 'paid_at' column of 'payments'
❌ Admin API Error: column orders.product_name does not exist
```

## The Fix (2 minutes)

### Step 1: Run Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste file: `supabase/migrations/20251228_add_missing_columns.sql`
3. Click "Run"

### Step 2: Deploy Code
1. Merge this PR
2. Deploy to production

## What It Does
- ✅ Adds `paid_at` column to `payments` table
- ✅ Adds `product_name` column to `orders` table
- ✅ Backfills existing orders with product names
- ✅ Creates indexes for performance

## After Fix
- ✅ Webhook can update payment timestamps
- ✅ Admin panel displays product names in orders
- ✅ New orders automatically populate product name

## Rollback
```sql
ALTER TABLE public.payments DROP COLUMN paid_at;
ALTER TABLE public.orders DROP COLUMN product_name;
```

## More Info
See `SCHEMA_FIX_SUMMARY.md` for complete documentation.
