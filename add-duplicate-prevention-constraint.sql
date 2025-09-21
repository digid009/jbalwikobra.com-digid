-- Add duplicate prevention constraint for orders
-- Prevents duplicate orders from same customer with same amount within a short timeframe

-- Create a function to extract the hour from a timestamp for time-based grouping
CREATE OR REPLACE FUNCTION extract_hour_key(created_at timestamptz)
RETURNS text AS $$
BEGIN
  -- Create a key that groups orders within the same hour
  RETURN to_char(created_at, 'YYYY-MM-DD-HH24');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a partial unique index that prevents duplicates within the same hour
-- This allows customers to reorder the same product on different days
-- but prevents rapid clicking duplicates within the same hour
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_customer_amount_hour
ON orders(customer_email, amount, extract_hour_key(created_at))
WHERE status IN ('pending', 'processing', 'completed');

-- Also add an index for efficient duplicate checking in our API
CREATE INDEX IF NOT EXISTS idx_orders_duplicate_check
ON orders(customer_email, amount, created_at)
WHERE status IN ('pending', 'processing', 'completed');

-- Add a comment explaining the constraint
COMMENT ON INDEX uq_orders_customer_amount_hour IS 
'Prevents duplicate orders from same customer with same amount within the same hour. Allows legitimate reorders on different days.';

-- Verify the constraint was created
SELECT 
  schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname IN ('uq_orders_customer_amount_hour', 'idx_orders_duplicate_check');
