-- Add WhatsApp column to orders table for better customer contact tracking
-- Run this in Supabase SQL Editor

-- Add customer_whatsapp column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_whatsapp VARCHAR(50);

-- Add index for better performance on WhatsApp lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_whatsapp ON orders(customer_whatsapp);

-- Update the comment to describe the new column
COMMENT ON COLUMN orders.customer_whatsapp IS 'Customer WhatsApp number for direct communication (optional, separate from phone)';

-- Optional: Update existing records to copy phone to whatsapp if they're similar
-- This is commented out as it should be done manually based on business logic
-- UPDATE orders 
-- SET customer_whatsapp = customer_phone 
-- WHERE customer_whatsapp IS NULL 
-- AND customer_phone LIKE '+62%' OR customer_phone LIKE '62%' OR customer_phone LIKE '08%';
