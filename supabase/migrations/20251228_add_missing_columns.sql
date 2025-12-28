-- ===========================================================================
-- FIX MISSING DATABASE COLUMNS
-- ===========================================================================
-- 
-- This migration adds missing columns that are referenced in the application code
-- but don't exist in the database schema, causing errors:
--
-- 1. payments.paid_at - Referenced in webhook.ts when updating payment status
-- 2. orders.product_name - Referenced in admin.ts when listing orders
--
-- ERRORS FIXED:
-- - [Webhook] Error: "Could not find the 'paid_at' column of 'payments' in the schema cache"
-- - [Admin API] Error: "column orders.product_name does not exist"
--
-- ===========================================================================

BEGIN;

-- ===========================================================================
-- 1. Add paid_at column to payments table
-- ===========================================================================
-- This column is used by the webhook to track when a payment was completed
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN public.payments.paid_at IS 
'Timestamp when the payment was successfully completed. Set by webhook when payment status becomes paid or completed.';

CREATE INDEX IF NOT EXISTS idx_payments_paid_at 
ON public.payments(paid_at) 
WHERE paid_at IS NOT NULL;

-- ===========================================================================
-- 2. Add product_name column to orders table
-- ===========================================================================
-- This column is used by the admin API to display product names in order lists
-- without requiring a JOIN to the products table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS product_name TEXT;

COMMENT ON COLUMN public.orders.product_name IS 
'Denormalized product name stored at order creation time. Used for faster order list queries in admin panel without JOINing products table.';

CREATE INDEX IF NOT EXISTS idx_orders_product_name 
ON public.orders(product_name);

-- ===========================================================================
-- 3. Backfill product_name for existing orders
-- ===========================================================================
-- Update existing orders to populate product_name from products table
UPDATE public.orders o
SET product_name = p.name
FROM public.products p
WHERE o.product_id = p.id
  AND o.product_name IS NULL;

-- ===========================================================================
-- VERIFICATION
-- ===========================================================================
SELECT 
  'MIGRATION COMPLETED' as status,
  'payments.paid_at' as added_column_1,
  'orders.product_name' as added_column_2,
  (SELECT COUNT(*) FROM public.orders WHERE product_name IS NOT NULL) as orders_with_product_name,
  (SELECT COUNT(*) FROM public.orders WHERE product_name IS NULL) as orders_without_product_name;

COMMIT;

-- ===========================================================================
-- SUCCESS!
-- ===========================================================================
-- 
-- The following errors should now be resolved:
-- ✅ Webhook can now update payments.paid_at successfully
-- ✅ Admin API can now select orders.product_name successfully
-- ✅ Existing orders have been backfilled with product names where available
--
-- NOTES:
-- - Future orders should populate product_name at creation time
-- - Orders without a valid product_id will have NULL product_name
-- - The paid_at column will be populated by the webhook when payments complete
-- ===========================================================================
