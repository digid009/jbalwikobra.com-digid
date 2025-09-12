-- Flash Sales Database Enhancement SQL Script
-- Run this in Supabase SQL Editor to add the missing discount_percentage column

-- Step 1: Add discount_percentage column to flash_sales table
ALTER TABLE flash_sales 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Step 2: Update existing records to calculate discount_percentage
UPDATE flash_sales 
SET discount_percentage = ROUND(
  ((original_price - sale_price) / original_price * 100)::DECIMAL, 2
) 
WHERE original_price > 0 AND sale_price > 0 AND discount_percentage IS NULL;

-- Step 3: Add comment to document the column
COMMENT ON COLUMN flash_sales.discount_percentage IS 'Discount percentage (0-100), calculated from original_price and sale_price';

-- Step 4: Create trigger function for automatic calculation (optional)
CREATE OR REPLACE FUNCTION calculate_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate discount percentage automatically
  IF NEW.original_price > 0 AND NEW.sale_price > 0 THEN
    NEW.discount_percentage = ROUND(
      ((NEW.original_price - NEW.sale_price) / NEW.original_price * 100)::DECIMAL, 2
    );
  ELSE
    NEW.discount_percentage = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically calculate discount_percentage
DROP TRIGGER IF EXISTS trigger_calculate_discount_percentage ON flash_sales;
CREATE TRIGGER trigger_calculate_discount_percentage
  BEFORE INSERT OR UPDATE ON flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION calculate_discount_percentage();

-- Step 6: Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'flash_sales'
  AND table_schema = 'public'
ORDER BY ordinal_position;
